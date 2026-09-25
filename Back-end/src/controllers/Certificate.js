const Certificate = require("../modules/dbCertificate");
const User = require("../modules/dbUsers");
const Course = require("../modules/dbCourse");
const ApiError = require("../utils/ApiError");
const crypto = require("crypto");
const QRCode = require("qrcode");

const generateCertificateForStudent = async (studentId, courseId) => {
  const existingCertificate = await Certificate.findOne({
    student: studentId,
    course: courseId,
  });

  if (existingCertificate) {
    return existingCertificate;
  }

  const student = await User.findById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  const course = await Course.findById(courseId).populate(
    "instructorId",
    "firstName lastName",
  );

  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.instructorId) {
    throw new Error("Course instructor not found");
  }

  const certificateId =
    "CERT-" + crypto.randomBytes(4).toString("hex").toUpperCase();

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4200";

  const verificationUrl = `${frontendUrl}/verify-certificate/${certificateId}`;

  const qrCode = await QRCode.toDataURL(verificationUrl);

  const certificate = await Certificate.create({
    student: studentId,
    course: courseId,
    studentName: `${student.firstName} ${student.lastName}`,
    courseName: course.title,
    instructorName: `${course.instructorId.firstName} ${course.instructorId.lastName}`,
    certificateId,
    issueDate: new Date(),
    verificationUrl,
    qrCode,
  });

  const track = await Course.findById(courseId).populate("track");
  if (track?.track?.requiredSkills?.length) {
    const existing = Array.isArray(student.verifiedSkills) ? student.verifiedSkills : [];
    for (const requiredSkill of track.track.requiredSkills) {
      const alreadyExists = existing.some((skill) =>
        typeof skill === "string"
          ? skill.toLowerCase() === requiredSkill.skill.toLowerCase()
          : skill?.skill?.toLowerCase() === requiredSkill.skill.toLowerCase(),
      );
      if (!alreadyExists) existing.push({ skill: requiredSkill.skill, level: requiredSkill.level, courseId });
    }
    student.verifiedSkills = existing;
    await student.save();
  }

  return certificate;
};

const verifyCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({
      certificateId,
    });

    if (!certificate) {
      return next(
        new ApiError(404, "Invalid Certificate ID. Certificate not found."),
      );
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: "Certificate is authentic and valid",
      data: certificate,
    });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const getMyCertificates = async (req, res, next) => {
  try {
    const studentId = req.id;

    const certificates = await Certificate.find({
      student: studentId,
    }).sort({ issueDate: -1 });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

module.exports = {
  generateCertificateForStudent,
  verifyCertificate,
  getMyCertificates,
};

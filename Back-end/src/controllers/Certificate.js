const Certificate = require("../modules/dbCertificate");
const User = require("../modules/dbUsers");
const Course = require("../modules/dbCourse");
const crypto = require("crypto");
const QRCode = require("qrcode");

exports.generateCertificateForStudent = async (studentId, courseId) => {
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
    "firstName lastName"
  );

  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.instructorId) {
    throw new Error("Course instructor not found");
  }

  const certificateId =
    "CERT-" +
    crypto.randomBytes(4).toString("hex").toUpperCase();

  const frontendUrl =
    process.env.FRONTEND_URL || "http://localhost:4200";

  const verificationUrl =
    `${frontendUrl}/verify-certificate/${certificateId}`;

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

  return certificate;
};
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({
      certificateId,
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "Invalid Certificate ID. Certificate not found.",
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: "Certificate is authentic and valid",
      data: certificate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getMyCertificates = async (req, res) => {
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
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const Enrollment = require("../modules/dbEnrollement");
const Lesson = require("../modules/dbLesson");
const Course = require("../modules/dbCourse");
const { generateCertificateForStudent } = require("./Certificate");
const { updateUserActivity } = require("../services/activity");
const ApiError = require("../utils/ApiError");

const getMyEnrollements = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.id })
      .populate("courseId", "title slug image instructorId price level duration rating status")
      .populate("lastLesson", "title order")
      .populate("certificateId", "certificateId issueDate verificationUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({ message: "success", data: enrollments });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

const getEnrollementById = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({ _id: req.params.id, studentId: req.id })
      .populate("courseId")
      .populate("lastLesson", "title order")
      .populate("certificateId", "certificateId issueDate verificationUrl qrCode");

    if (!enrollment) return next(new ApiError(404, "Enrollment not found"));
    return res.status(200).json({ message: "success", data: enrollment });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

const updateProgress = async (req, res, next) => {
  try {
    const { lessonId } = req.body;
    if (!lessonId) return next(new ApiError(400, "lessonId is required"));

    const enrollment = await Enrollment.findOne({ _id: req.params.id, studentId: req.id });
    if (!enrollment) return next(new ApiError(404, "Enrollment not found"));

    const lesson = await Lesson.findOne({ _id: lessonId, courseId: enrollment.courseId });
    if (!lesson) return next(new ApiError(404, "Lesson does not belong to this course"));

    const alreadyCompleted = enrollment.completedLessons.some((id) => id.toString() === lessonId.toString());
    if (!alreadyCompleted) enrollment.completedLessons.push(lessonId);

    const totalLessons = await Lesson.countDocuments({ courseId: enrollment.courseId });
    const completedCount = enrollment.completedLessons.length;
    const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    enrollment.progress = Math.min(100, progress);
    enrollment.lastLesson = lessonId;
    enrollment.lastAccessedAt = new Date();

    if (enrollment.progress >= 100) {
      enrollment.progress = 100;
      enrollment.status = "completed";
      enrollment.completedAt = enrollment.completedAt || new Date();
    } else {
      enrollment.status = "in-progress";
      enrollment.completedAt = null;
    }

    await enrollment.save();
    await updateUserActivity(req.id);

    if (enrollment.status === "completed" && !enrollment.certificateId) {
      const certificate = await generateCertificateForStudent(req.id, enrollment.courseId);
      enrollment.certificateId = certificate._id;
      await enrollment.save();
    }

    return res.status(200).json({ message: "Progress updated successfully", data: enrollment });
  } catch (err) {
    return next(err instanceof ApiError ? err : new ApiError(500, err.message));
  }
};

module.exports = { getMyEnrollements, getEnrollementById, updateProgress };

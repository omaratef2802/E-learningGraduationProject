const Enrollment = require("../modules/dbEnrollement");

exports.completeEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    enrollment.certificateId = req.body.certificateId || null;
    enrollment.status = "Completed";
    enrollment.completedAt = new Date();
    await enrollment.save();

    res.json({ message: "Enrollment completed", enrollment });
  } catch (err) {
    next(err);
  }
};
exports.createEnrollment = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { courseId } = req.body;

    const exists = await Enrollment.findOne({ userId, courseId });
    if (exists) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    const enrollment = await Enrollment.create({ userId, courseId });
    res.status(201).json({ message: "Enrolled", enrollment });
  } catch (err) {
    next(err);
  }
};

exports.getMyCourses = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const enrollments = await Enrollment.find({ userId })
      .populate("courseId")
      .populate("certificateId");
    res.json({ enrollments });
  } catch (err) {
    next(err);
  }
};

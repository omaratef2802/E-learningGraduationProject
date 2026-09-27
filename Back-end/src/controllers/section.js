const sectionModule = require("../modules/dbSection");
const courseModule = require("../modules/dbCourse");
const Lesson = require("../modules/dbLesson");
const Enrollment = require("../modules/dbEnrollement");
const ApiError = require("../utils/ApiError");
const Quiz = require("../modules/dbQuizs");
const cloudinary = require("../configs/cloudinary");

const createSection = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, order } = req.body;

    const course = await courseModule.findOne({
      _id: courseId,
      instructorId: req.id,
    });

    if (!course) {
      return next(
        new ApiError(404, "Course not found or you are not the instructor"),
      );
    }

    const existSection = await sectionModule.findOne({
      courseId,
      order,
    });

    if (existSection) {
      return next(new ApiError(400, "This section order already exists"));
    }

    const section = await sectionModule.create({
      title,
      description,
      courseId,
      order,
    });

    return res.status(201).json({
      message: "Section created successfully",
      data: section,
    });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

const getCourseSections = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await courseModule.findById(courseId);

    if (!course) {
      return next(new ApiError(404, "Course not found"));
    }

    if (
      req.role === "instructor" &&
      course.instructorId.toString() !== req.id.toString()
    ) {
      return next(
        new ApiError(403, "You are not allowed to access this course"),
      );
    }

    if (req.role === "student") {
      if (course.status !== "published") {
        return next(new ApiError(404, "Course not found"));
      }

      const enrollment = await Enrollment.findOne({
        studentId: req.id,
        courseId,
      });

      if (!enrollment) {
        return next(new ApiError(403, "You are not enrolled in this course"));
      }
    }

    const sections = await sectionModule.find({ courseId }).sort({ order: 1 });

    return res.status(200).json({
      message: "Sections fetched successfully",
      data: sections,
    });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

const getSectionById = async (req, res, next) => {
  try {
    const section = await sectionModule.findById(req.params.id);

    if (!section) {
      return next(new ApiError(404, "Section not found"));
    }

    const course = await courseModule.findById(section.courseId);

    if (!course) {
      return next(new ApiError(404, "Course not found"));
    }

    if (
      req.role === "instructor" &&
      course.instructorId.toString() !== req.id.toString()
    ) {
      return next(
        new ApiError(403, "You are not allowed to access this section"),
      );
    }

    if (req.role === "student") {
      if (course.status !== "published") {
        return next(new ApiError(404, "Section not found"));
      }

      const enrollment = await Enrollment.findOne({
        studentId: req.id,
        courseId: course._id,
      });

      if (!enrollment) {
        return next(new ApiError(403, "You are not enrolled in this course"));
      }
    }

    return res.status(200).json({
      message: "Section fetched successfully",
      data: section,
    });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

const updateSection = async (req, res, next) => {
  try {
    const section = await sectionModule.findById(req.params.id);

    if (!section) {
      return next(new ApiError(404, "Section not found"));
    }

    const course = await courseModule.findOne({
      _id: section.courseId,
      instructorId: req.id,
    });

    if (!course) {
      return next(
        new ApiError(403, "You are not the instructor of this course"),
      );
    }

    const { title, description, order } = req.body;

    if (order !== undefined) {
      const existSection = await sectionModule.findOne({
        courseId: section.courseId,
        order,
        _id: { $ne: section._id },
      });

      if (existSection) {
        return next(new ApiError(400, "This section order already exists"));
      }

      section.order = order;
    }

    if (title !== undefined) {
      section.title = title;
    }

    if (description !== undefined) {
      section.description = description;
    }

    await section.save();

    return res.status(200).json({
      message: "Section updated successfully",
      data: section,
    });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

const deleteSection = async (req, res, next) => {
  try {
    const section = await sectionModule.findById(req.params.id);

    if (!section) {
      return next(new ApiError(404, "Section not found"));
    }

    const course = await courseModule.findOne({
      _id: section.courseId,
      instructorId: req.id,
    });

    if (!course) {
      return next(
        new ApiError(403, "You are not the instructor of this course"),
      );
    }

    if (course.status === "published" && await Enrollment.exists({ courseId: course._id })) {
      return next(new ApiError(409, "You cannot delete a section from a course with enrolled students"));
    }

    const lessons = await Lesson.find({ sectionId: section._id }).select("videoPublicId quizId");
    for (const lesson of lessons) {
      if (lesson.videoPublicId) await cloudinary.uploader.destroy(lesson.videoPublicId, { resource_type: "video" });
      if (lesson.quizId) await Quiz.findByIdAndDelete(lesson.quizId);
    }
    await Lesson.deleteMany({ sectionId: section._id });
    await Enrollment.updateMany({ courseId: section.courseId }, { $pull: { completedLessons: { $in: lessons.map((lesson) => lesson._id) } } });
    await sectionModule.findByIdAndDelete(section._id);

    return res.status(200).json({
      message: "Section deleted successfully",
    });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

module.exports = {
  createSection,
  getCourseSections,
  getSectionById,
  updateSection,
  deleteSection,
};

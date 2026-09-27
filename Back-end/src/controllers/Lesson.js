const Lesson = require("../modules/dbLesson");
const Enrollment = require("../modules/dbEnrollement");
const Section = require("../modules/dbSection");
const Course = require("../modules/dbCourse");
const Quiz = require("../modules/dbQuizs");
const cloudinary = require("../configs/cloudinary");
const uploadVideo = require("../utils/uploadVideo");
const ApiError = require("../utils/ApiError");

const validateQuiz = async (quizId, courseId, instructorId) => {
  if (!quizId) return null;
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new ApiError(404, "Quiz not found");
  if (quiz.courseId && quiz.courseId.toString() !== courseId.toString()) throw new ApiError(400, "Quiz does not belong to this course");
  if (quiz.instructorId && quiz.instructorId.toString() !== instructorId.toString()) throw new ApiError(403, "You are not the owner of this quiz");
  const lesson = await Lesson.findOne({ quizId });
  if (lesson) throw new ApiError(400, "This quiz is already assigned to another lesson");
  if (!quiz.courseId || !quiz.instructorId) {
    quiz.courseId = courseId;
    quiz.instructorId = instructorId;
    await quiz.save();
  }
  return quiz;
};

const createLesson = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, duration, type, textContent, sectionId, order, quizId, isPreview } = req.body;

    const course = await Course.findOne({ _id: courseId, instructorId: req.id });
    if (!course) return next(new ApiError(404, "Course not found or you are not the instructor"));

    const section = await Section.findOne({ _id: sectionId, courseId });
    if (!section) return next(new ApiError(404, "Section not found or does not belong to this course"));

    const duplicateOrder = await Lesson.findOne({ sectionId, order });
    if (duplicateOrder) return next(new ApiError(409, "This lesson order already exists in the section"));

    if (!['video', 'text'].includes(type)) return next(new ApiError(400, "Invalid lesson type"));
    if (type === "video" && !req.file) return next(new ApiError(400, "Video is required"));
    if (type === "text" && !textContent?.trim()) return next(new ApiError(400, "Text content is required"));

    if (quizId) await validateQuiz(quizId, courseId, req.id);

    let videoUrl = null;
    let videoPublicId = null;
    if (type === "video") {
      const result = await uploadVideo(req.file.buffer);
      videoUrl = result.secure_url;
      videoPublicId = result.public_id;
    }

    const lesson = await Lesson.create({ title, duration, type, videoUrl, videoPublicId, textContent: type === "text" ? textContent : null, courseId, sectionId, order, quizId: quizId || null, isPreview: Boolean(isPreview) });
    return res.status(201).json({ message: "Lesson created successfully", data: lesson });
  } catch (err) {
    return next(err instanceof ApiError ? err : new ApiError(500, err.message));
  }
};

const getCourseLessons = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return next(new ApiError(404, "Course not found"));

    if (req.role === "instructor" && course.instructorId.toString() !== req.id.toString()) return next(new ApiError(403, "You are not allowed to access this course"));

    if (req.role === "student") {
      if (course.status !== "published") return next(new ApiError(404, "Course not found"));
      const enrollment = await Enrollment.findOne({ studentId: req.id, courseId: course._id });
      const filter = enrollment ? { courseId: course._id } : { courseId: course._id, isPreview: true };
      const lessons = await Lesson.find(filter).populate("sectionId", "title order").populate("quizId", "title passingScore").sort({ sectionId: 1, order: 1 });
      return res.status(200).json({ message: enrollment ? "Lessons fetched successfully" : "Preview lessons fetched successfully", data: lessons });
    }

    const lessons = await Lesson.find({ courseId: course._id }).populate("sectionId", "title order").populate("quizId", "title passingScore").sort({ sectionId: 1, order: 1 });
    return res.status(200).json({ message: "Lessons fetched successfully", data: lessons });
  } catch (err) { return next(new ApiError(500, err.message)); }
};

const getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate("sectionId", "title order")
      .populate("quizId", "title passingScore")
      .populate("courseId", "title instructorId status");
    if (!lesson) return next(new ApiError(404, "Lesson not found"));

    if (req.role === "instructor" && lesson.courseId.instructorId?.toString() !== req.id.toString()) return next(new ApiError(403, "You are not allowed to access this lesson"));

    if (req.role === "student") {
      if (lesson.courseId.status !== "published") return next(new ApiError(404, "Lesson not found"));
      if (!lesson.isPreview) {
        const enrollment = await Enrollment.findOne({ studentId: req.id, courseId: lesson.courseId._id });
        if (!enrollment) return next(new ApiError(403, "You are not enrolled in this course"));
      }
    }

    return res.status(200).json({ message: "Lesson fetched successfully", data: lesson });
  } catch (err) { return next(new ApiError(500, err.message)); }
};

const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return next(new ApiError(404, "Lesson not found"));

    const course = await Course.findOne({ _id: lesson.courseId, instructorId: req.id });
    if (!course) return next(new ApiError(403, "You are not the instructor of this course"));

    const { title, duration, type, textContent, sectionId, order, quizId, isPreview } = req.body;
    const targetSectionId = sectionId || lesson.sectionId;
    const targetOrder = order !== undefined ? order : lesson.order;

    const section = await Section.findOne({ _id: targetSectionId, courseId: lesson.courseId });
    if (!section) return next(new ApiError(404, "Section not found or does not belong to this course"));

    const duplicateOrder = await Lesson.findOne({ sectionId: targetSectionId, order: targetOrder, _id: { $ne: lesson._id } });
    if (duplicateOrder) return next(new ApiError(409, "This lesson order already exists in the section"));

    if (quizId !== undefined && quizId !== null) {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) return next(new ApiError(404, "Quiz not found"));
      const assigned = await Lesson.findOne({ quizId, _id: { $ne: lesson._id }, courseId: lesson.courseId });
      if (assigned) return next(new ApiError(400, "This quiz is already assigned to another lesson"));
    }

    if (title !== undefined) lesson.title = title;
    if (duration !== undefined) lesson.duration = duration;
    if (sectionId !== undefined) lesson.sectionId = sectionId;
    if (order !== undefined) lesson.order = order;
    if (quizId !== undefined) lesson.quizId = quizId || null;
    if (isPreview !== undefined) lesson.isPreview = Boolean(isPreview);

    if (type !== undefined && !['video', 'text'].includes(type)) return next(new ApiError(400, "Invalid lesson type"));
    if (textContent !== undefined) lesson.textContent = textContent;

    if (type === "text") {
      if (!textContent?.trim() && !lesson.textContent?.trim()) return next(new ApiError(400, "Text content is required"));
      if (lesson.videoPublicId) await cloudinary.uploader.destroy(lesson.videoPublicId, { resource_type: "video" });
      lesson.videoUrl = null;
      lesson.videoPublicId = null;
      lesson.type = "text";
    }

    if (type === "video") {
      if (!req.file && !lesson.videoUrl) return next(new ApiError(400, "Video is required"));
      lesson.type = "video";
    }

    if (req.file) {
      if (lesson.videoPublicId) await cloudinary.uploader.destroy(lesson.videoPublicId, { resource_type: "video" });
      const result = await uploadVideo(req.file.buffer);
      lesson.videoUrl = result.secure_url;
      lesson.videoPublicId = result.public_id;
      lesson.type = "video";
      lesson.textContent = null;
    }

    if (lesson.type === "video" && !lesson.videoUrl) return next(new ApiError(400, "Video is required"));
    if (lesson.type === "text" && !lesson.textContent?.trim()) return next(new ApiError(400, "Text content is required"));

    await lesson.save();
    return res.status(200).json({ message: "Lesson updated successfully", data: lesson });
  } catch (err) { return next(err instanceof ApiError ? err : new ApiError(500, err.message)); }
};

const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return next(new ApiError(404, "Lesson not found"));
    const course = await Course.findOne({ _id: lesson.courseId, instructorId: req.id });
    if (!course) return next(new ApiError(403, "You are not the instructor of this course"));
    if (course.status === "published" && await Enrollment.exists({ courseId: course._id })) return next(new ApiError(409, "You cannot delete a lesson from a course with enrolled students"));

    if (lesson.videoPublicId) await cloudinary.uploader.destroy(lesson.videoPublicId, { resource_type: "video" });
    if (lesson.quizId) await Quiz.findByIdAndDelete(lesson.quizId);
    await Lesson.findByIdAndDelete(lesson._id);
    await Enrollment.updateMany({ courseId: lesson.courseId }, { $pull: { completedLessons: lesson._id }, $set: { lastLesson: null } });

    return res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (err) { return next(new ApiError(500, err.message)); }
};

module.exports = { createLesson, getCourseLessons, getLessonById, updateLesson, deleteLesson };

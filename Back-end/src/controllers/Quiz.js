const Quiz = require("../modules/dbQuizs");
const Lesson = require("../modules/dbLesson");
const Enrollment = require("../modules/dbEnrollement");
const Course = require("../modules/dbCourse");
const ApiError = require("../utils/ApiError");

const safeQuiz = (quiz) => {
  const object = quiz.toObject ? quiz.toObject() : { ...quiz };
  object.questions = (object.questions || []).map(({ correctAnswer, ...question }) => question);
  return object;
};

const createQuiz = async (req, res, next) => {
  try {
    const { title, questions, passingScore, lessonId } = req.body;
    if (!title || !Array.isArray(questions) || questions.length === 0 || !lessonId) return next(new ApiError(400, "Title, questions and lessonId are required"));

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return next(new ApiError(404, "Lesson not found"));
    const course = await Course.findOne({ _id: lesson.courseId, instructorId: req.id });
    if (!course) return next(new ApiError(403, "You are not allowed to create a quiz for this lesson"));
    if (lesson.quizId) return next(new ApiError(400, "This lesson already has a quiz"));

    const quiz = await Quiz.create({ title, questions, passingScore, lessonId: undefined, courseId: course._id, instructorId: req.id });
    lesson.quizId = quiz._id;
    await lesson.save();

    return res.status(201).json({ message: "Quiz created successfully", data: quiz });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

const getQuizzes = async (req, res, next) => {
  try {
    let quizzes;
    if (req.role === "instructor") {
      quizzes = await Quiz.find({ instructorId: req.id }).sort({ createdAt: -1 });
      return res.status(200).json({ count: quizzes.length, data: quizzes });
    }

    const enrollments = await Enrollment.find({ studentId: req.id }).select("courseId");
    const courseIds = enrollments.map((item) => item.courseId);
    quizzes = await Quiz.find({ courseId: { $in: courseIds } }).sort({ createdAt: -1 });
    return res.status(200).json({ count: quizzes.length, data: quizzes.map(safeQuiz) });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return next(new ApiError(404, "Quiz not found"));

    if (req.role === "student") {
      const enrollment = await Enrollment.findOne({ studentId: req.id, courseId: quiz.courseId });
      const course = await Course.findOne({ _id: quiz.courseId, status: "published" });
      if (!course || !enrollment) return next(new ApiError(403, "You are not enrolled in this course"));
      return res.status(200).json({ data: safeQuiz(quiz) });
    }

    if (req.role === "instructor" && quiz.instructorId.toString() !== req.id.toString()) return next(new ApiError(403, "You are not allowed to access this quiz"));
    return res.status(200).json({ data: quiz });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, instructorId: req.id });
    if (!quiz) return next(new ApiError(404, "Quiz not found"));

    const { title, questions, passingScore } = req.body;
    if (title !== undefined) quiz.title = title;
    if (questions !== undefined) quiz.questions = questions;
    if (passingScore !== undefined) quiz.passingScore = passingScore;
    await quiz.save();
    return res.status(200).json({ message: "Quiz updated successfully", data: quiz });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, instructorId: req.id });
    if (!quiz) return next(new ApiError(404, "Quiz not found"));

    await Lesson.updateMany({ quizId: quiz._id }, { $set: { quizId: null } });
    await Quiz.deleteOne({ _id: quiz._id });
    return res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

module.exports = { createQuiz, getQuizzes, getQuizById, updateQuiz, deleteQuiz };

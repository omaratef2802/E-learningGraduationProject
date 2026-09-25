const QuizAttempt = require("../modules/dbQuizAttempt");
const Enrollment = require("../modules/dbEnrollement");
const Quiz = require("../modules/dbQuizs");
const Lesson = require("../modules/dbLesson");
const Course = require("../modules/dbCourse");
const { updateUserActivity } = require("../services/activity");
const ApiError = require("../utils/ApiError");

const hideAnswers = (attempt) => {
  const object = attempt.toObject ? attempt.toObject() : { ...attempt };
  if (object.quizSnapshot?.questions) {
    object.quizSnapshot.questions = object.quizSnapshot.questions.map(
      ({ correctAnswer, ...question }) => question,
    );
  }
  return object;
};

const submitQuizAttempt = async (req, res, next) => {
  try {
    const studentId = req.id;
    const { quizId, lessonId, studentAnswers } = req.body;
    if (!quizId || !lessonId)
      return next(new ApiError(400, "Quiz and lesson are required"));
    if (studentAnswers !== undefined && !Array.isArray(studentAnswers))
      return next(new ApiError(400, "Student answers must be an array"));

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return next(new ApiError(404, "Quiz not found"));

    const lesson = await Lesson.findOne({ _id: lessonId, quizId });
    if (!lesson)
      return next(
        new ApiError(400, "This quiz does not belong to this lesson"),
      );
    if (quiz.courseId.toString() !== lesson.courseId.toString())
      return next(new ApiError(400, "Quiz and lesson course do not match"));

    const course = await Course.findOne({
      _id: lesson.courseId,
      status: "published",
    });
    if (!course) return next(new ApiError(404, "Course not found"));
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId: course._id,
    });
    if (!enrollment)
      return next(new ApiError(403, "You are not enrolled in this course"));

    const answers = studentAnswers || [];
    const usedQuestionIndexes = new Set();
    for (const answer of answers) {
      if (
        !Number.isInteger(answer.questionIndex) ||
        answer.questionIndex < 0 ||
        answer.questionIndex >= quiz.questions.length
      )
        return next(new ApiError(400, "Invalid question index"));
      if (usedQuestionIndexes.has(answer.questionIndex))
        return next(
          new ApiError(400, "Duplicate question index is not allowed"),
        );
      usedQuestionIndexes.add(answer.questionIndex);
      const question = quiz.questions[answer.questionIndex];
      if (
        answer.selectedAnswer !== undefined &&
        answer.selectedAnswer !== null &&
        !question.options.includes(answer.selectedAnswer)
      )
        return next(new ApiError(400, "Selected answer is not a valid option"));
    }

    let score = 0;
    let totalScore = 0;
    quiz.questions.forEach((question, index) => {
      totalScore += question.points;
      const studentAnswer = answers.find(
        (answer) => answer.questionIndex === index,
      );
      if (studentAnswer?.selectedAnswer === question.correctAnswer)
        score += question.points;
    });

    const percentage =
      totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      student: studentId,
      quiz: quizId,
      course: course._id,
      lesson: lessonId,
      quizSnapshot: {
        questions: quiz.questions.map((question) => ({
          questionText: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          points: question.points,
        })),
      },
      studentAnswers: answers,
      score,
      totalScore,
      percentage,
      passed,
    });

    await updateUserActivity(studentId);
    return res
      .status(201)
      .json({
        message: "Quiz attempt submitted successfully",
        data: hideAnswers(attempt),
      });
  } catch (error) {
    return next(
      error instanceof ApiError ? error : new ApiError(500, error.message),
    );
  }
};

const getMyQuizAttempts = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ student: req.id })
      .populate("quiz", "title passingScore")
      .populate("course", "title")
      .populate("lesson", "title")
      .sort({ createdAt: -1 });
    return res
      .status(200)
      .json({
        message: "success",
        count: attempts.length,
        data: attempts.map(hideAnswers),
      });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const getQuizAttemptById = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      student: req.id,
    })
      .populate("quiz", "title passingScore")
      .populate("course", "title")
      .populate("lesson", "title");
    if (!attempt) return next(new ApiError(404, "Quiz attempt not found"));
    return res
      .status(200)
      .json({ message: "success", data: hideAnswers(attempt) });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

module.exports = { submitQuizAttempt, getMyQuizAttempts, getQuizAttemptById };

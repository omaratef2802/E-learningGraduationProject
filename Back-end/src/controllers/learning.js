const Learning = require("../services/learningProgression");
const Enrollment = require("../modules/dbEnrollement");
const Lesson = require("../modules/dbLesson");
const Quiz = require("../modules/dbQuizs");
const Course = require("../modules/dbCourse");
const QuizAttempt = require("../modules/dbQuizAttempt");
const { generateCertificateForStudent } = require("./Certificate");
const ApiError = require("../utils/ApiError");

// GET /E-learning/learning/:courseId/state
// Returns the full learning state of the enrolled student: every section with
// its unlocked/completed flags, every lesson (score included) and the section
// final quiz. Sections after an unfinished one come back `unlocked: false`.
const getCourseState = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { sections, enrollment } = await Learning.getLearningState(req.id, courseId);
    return res.status(200).json({
      message: "Learning state fetched successfully",
      data: {
        enrollment,
        sections,
      },
    });
  } catch (err) {
    return next(err instanceof ApiError ? err : new ApiError(500, err.message));
  }
};

// GET /E-learning/learning/:courseId/lesson/:lessonId
// Returns the lesson content only when it is actually unlocked, so a student
// cannot skip ahead by guessing an id.
const getLessonContent = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    // requireLessonUnlocked throws 403 when the previous lesson / quiz gates
    // are not satisfied yet.
    await Learning.requireLessonUnlocked(req.id, courseId, lessonId);

    const lesson = await Lesson.findOne({ _id: lessonId, courseId })
      .populate("quizId", "title passingScore")
      .populate("sectionId", "title order")
      .lean();
    if (!lesson) return next(new ApiError(404, "Lesson not found in this course"));

    return res.status(200).json({ message: "Lesson fetched successfully", data: lesson });
  } catch (err) {
    return next(err instanceof ApiError ? err : new ApiError(500, err.message));
  }
};

// POST /E-learning/learning/:courseId/lesson/:lessonId/complete
// Marks a lesson as completed. A lesson that has an attached quiz can only be
// completed once that quiz has been passed, which is what keeps the thread
// "lesson -> quiz -> next lesson" meaningful.
const completeLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { lessonState } = await Learning.requireLessonUnlocked(req.id, courseId, lessonId);

    if (lessonState.quizId && !lessonState.quizPassed) {
      return next(new ApiError(403, "Pass this lesson's quiz before marking it complete"));
    }

    const enrollment = await Enrollment.findOne({ studentId: req.id, courseId });
    if (!enrollment) return next(new ApiError(403, "You are not enrolled in this course"));

    const alreadyCompleted = enrollment.completedLessons.some((id) => String(id) === String(lessonId));
    if (!alreadyCompleted) enrollment.completedLessons.push(lessonId);

    const totalLessons = await Lesson.countDocuments({ courseId });
    const progress = totalLessons > 0 ? Math.round((enrollment.completedLessons.length / totalLessons) * 100) : 0;
    enrollment.progress = Math.min(100, progress);
    enrollment.lastLesson = lessonId;
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    // Recompute the state so the client immediately receives the freshly
    // unlocked next lesson / section.
    const refreshed = await Learning.getLearningState(req.id, courseId);
    return res.status(200).json({
      message: "Lesson completed successfully",
      data: { enrollment: refreshed.enrollment, sections: refreshed.sections },
    });
  } catch (err) {
    return next(err instanceof ApiError ? err : new ApiError(500, err.message));
  }
};

// GET /E-learning/learning/quiz/:quizId
// Returns a quiz (without correct answers) only when the student is allowed to
// take it: all lessons of its section completed for a section final quiz, or
// the lesson itself unlocked for a lesson quiz.
const getQuizContent = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return next(new ApiError(404, "Quiz not found"));

    const enrollment = await Enrollment.findOne({ studentId: req.id, courseId: quiz.courseId });
    if (!enrollment) return next(new ApiError(403, "You are not enrolled in this course"));

    const course = await Course.findOne({ _id: quiz.courseId, status: "published" });
    if (!course) return next(new ApiError(404, "Course not found"));

    await Learning.requireQuizUnlocked(req.id, quiz);

    const safe = quiz.toObject();
    safe.questions = (safe.questions || []).map(({ correctAnswer, ...question }) => question);
    return res.status(200).json({ message: "Quiz fetched successfully", data: safe });
  } catch (err) {
    return next(err instanceof ApiError ? err : new ApiError(500, err.message));
  }
};

// POST /E-learning/learning/quiz/:quizId/attempt
// Submits answers, grades them server-side, stores the attempt and returns the
// score (percentage) plus pass/fail and the refreshed learning state.
const submitAttempt = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { studentAnswers, lessonId } = req.body;
    if (studentAnswers !== undefined && !Array.isArray(studentAnswers)) {
      return next(new ApiError(400, "Student answers must be an array"));
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return next(new ApiError(404, "Quiz not found"));

    const enrollment = await Enrollment.findOne({ studentId: req.id, courseId: quiz.courseId });
    if (!enrollment) return next(new ApiError(403, "You are not enrolled in this course"));

    const course = await Course.findOne({ _id: quiz.courseId, status: "published" });
    if (!course) return next(new ApiError(404, "Course not found"));

    // Enforces the lock: a lesson quiz needs the lesson unlocked, a section
    // final quiz needs every lesson in the section completed.
    await Learning.requireQuizUnlocked(req.id, quiz);

    const answers = studentAnswers || [];
    const usedIndexes = new Set();
    for (const answer of answers) {
      if (!Number.isInteger(answer.questionIndex) || answer.questionIndex < 0 || answer.questionIndex >= quiz.questions.length) {
        return next(new ApiError(400, "Invalid question index"));
      }
      if (usedIndexes.has(answer.questionIndex)) return next(new ApiError(400, "Duplicate question index is not allowed"));
      usedIndexes.add(answer.questionIndex);
      const question = quiz.questions[answer.questionIndex];
      if (answer.selectedAnswer !== undefined && answer.selectedAnswer !== null && !question.options.includes(answer.selectedAnswer)) {
        return next(new ApiError(400, "Selected answer is not a valid option"));
      }
    }

    let score = 0;
    let totalScore = 0;
    quiz.questions.forEach((question, index) => {
      totalScore += question.points;
      const studentAnswer = answers.find((answer) => answer.questionIndex === index);
      if (studentAnswer?.selectedAnswer === question.correctAnswer) score += question.points;
    });

    const percentage = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      student: req.id,
      quiz: quizId,
      course: course._id,
      lesson: lessonId || null,
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

    // A passed section final quiz is the last step of that section. When every
    // section of the course is finished, the certificate is generated
    // automatically for the student (name, course and instructor included).
    let certificate = null;
    if (passed && quiz.sectionId) {
      certificate = await maybeIssueCertificate(req.id, quiz.courseId);
    }

    const refreshed = await Learning.getLearningState(req.id, quiz.courseId);
    return res.status(201).json({
      message: passed ? "Quiz passed" : "Quiz submitted",
      data: {
        attempt: {
          _id: attempt._id,
          quiz: quizId,
          course: course._id,
          lesson: lessonId || null,
          score,
          totalScore,
          percentage,
          passed,
          createdAt: attempt.createdAt,
        },
        sections: refreshed.sections,
        enrollment: refreshed.enrollment,
        certificate: certificate
          ? {
              _id: certificate._id,
              course: String(certificate.course),
              certificateId: certificate.certificateId,
              studentName: certificate.studentName,
              courseName: certificate.courseName,
              instructorName: certificate.instructorName,
              issueDate: certificate.issueDate,
              verificationUrl: certificate.verificationUrl,
              qrCode: certificate.qrCode,
            }
          : null,
      },
    });
  } catch (err) {
    return next(err instanceof ApiError ? err : new ApiError(500, err.message));
  }
};

/**
 * Issues the certificate once every section of the course is fully complete
 * (all lessons done and the final quiz of each section passed). Returns the
 * existing or freshly generated certificate, or null while the course is not
 * finished yet.
 */
const maybeIssueCertificate = async (studentId, courseId) => {
  const { sections } = await Learning.getLearningState(studentId, courseId);
  if (!sections.length) return null;
  const finished = sections.every((section) => section.completed);
  if (!finished) return null;

  try {
    return await generateCertificateForStudent(studentId, courseId);
  } catch (error) {
    // A missing instructor/course should not fail the quiz submission itself.
    console.error("Certificate generation failed:", error.message);
    return null;
  }
};

module.exports = { getCourseState, getLessonContent, completeLesson, getQuizContent, submitAttempt };

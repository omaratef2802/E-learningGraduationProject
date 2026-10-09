const Enrollment = require("../modules/dbEnrollement");
const Section = require("../modules/dbSection");
const Lesson = require("../modules/dbLesson");
const Quiz = require("../modules/dbQuizs");
const QuizAttempt = require("../modules/dbQuizAttempt");
const ApiError = require("../utils/ApiError");

const getLearningState = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment) throw new ApiError(403, "You are not enrolled in this course");

  const sections = await Section.find({ courseId }).sort({ order: 1 }).lean();
  const sectionIds = sections.map((section) => section._id);
  const [lessons, finalQuizzes, attempts] = await Promise.all([
    Lesson.find({ courseId }).sort({ sectionId: 1, order: 1 }).lean(),
    Quiz.find({ sectionId: { $in: sectionIds } }).lean(),
    QuizAttempt.find({ student: studentId, course: courseId }).sort({ createdAt: -1 }).lean(),
  ]);

  const completedIds = new Set((enrollment.completedLessons || []).map(String));
  const passedQuizIds = new Set(attempts.filter((attempt) => attempt.passed).map((attempt) => String(attempt.quiz)));
  const bestScores = new Map();
  for (const attempt of attempts) {
    const key = String(attempt.quiz);
    if (!bestScores.has(key) || bestScores.get(key).percentage < attempt.percentage) bestScores.set(key, attempt);
  }
  const sectionState = sections.map((section, sectionIndex) => {
    const sectionLessons = lessons.filter((lesson) => String(lesson.sectionId) === String(section._id)).sort((a, b) => a.order - b.order);
    const finalQuiz = finalQuizzes.find((quiz) => String(quiz.sectionId) === String(section._id));
    const previous = sectionIndex > 0 ? sections[sectionIndex - 1] : null;
    const previousLessons = previous ? lessons.filter((lesson) => String(lesson.sectionId) === String(previous._id)) : [];
    const previousFinalQuiz = previous && finalQuizzes.find((quiz) => String(quiz.sectionId) === String(previous._id));
    const unlocked = !previous || (
      previousLessons.every((lesson) => completedIds.has(String(lesson._id))) &&
      (!previousFinalQuiz || passedQuizIds.has(String(previousFinalQuiz._id)))
    );
    const allLessonsComplete = sectionLessons.every((lesson) => completedIds.has(String(lesson._id)));
    const finalQuizPassed = !finalQuiz || passedQuizIds.has(String(finalQuiz._id));

    return {
      id: String(section._id), title: section.title, description: section.description, order: section.order,
      unlocked,
      completed: allLessonsComplete && finalQuizPassed,
      lessons: sectionLessons.map((lesson, lessonIndex) => {
        const priorLessons = sectionLessons.slice(0, lessonIndex);
        const quizAttempt = lesson.quizId ? bestScores.get(String(lesson.quizId)) : null;
        return {
          id: String(lesson._id), title: lesson.title, duration: lesson.duration, type: lesson.type,
          order: lesson.order, isPreview: lesson.isPreview,
          quizId: lesson.quizId ? String(lesson.quizId) : null,
          unlocked: unlocked && priorLessons.every((prior) => completedIds.has(String(prior._id))),
          completed: completedIds.has(String(lesson._id)),
          quizPassed: Boolean(lesson.quizId && passedQuizIds.has(String(lesson.quizId))),
          score: quizAttempt?.percentage ?? null,
        };
      }),
      finalQuiz: finalQuiz ? {
        id: String(finalQuiz._id), title: finalQuiz.title,
        unlocked: unlocked && allLessonsComplete,
        passed: passedQuizIds.has(String(finalQuiz._id)),
        score: bestScores.get(String(finalQuiz._id))?.percentage ?? null,
      } : null,
    };
  });
  return { enrollment, sections: sectionState };
};

const requireLessonUnlocked = async (studentId, courseId, lessonId) => {
  const state = await getLearningState(studentId, courseId);
  const lessonState = state.sections.flatMap((section) => section.lessons).find((lesson) => lesson.id === String(lessonId));
  if (!lessonState) throw new ApiError(404, "Lesson not found in this course");
  if (!lessonState.unlocked) throw new ApiError(403, "Finish the previous lesson and required quiz first");
  return { ...state, lessonState };
};

const requireQuizUnlocked = async (studentId, quiz) => {
  const state = await getLearningState(studentId, quiz.courseId);
  if (quiz.sectionId) {
    const section = state.sections.find((item) => item.id === String(quiz.sectionId));
    if (!section || !section.unlocked || section.lessons.some((lesson) => !lesson.completed)) {
      throw new ApiError(403, "Finish every lesson in this section before taking its final quiz");
    }
    return state;
  }
  const lesson = await Lesson.findOne({ quizId: quiz._id, courseId: quiz.courseId }).select("_id");
  if (!lesson) throw new ApiError(404, "Quiz lesson not found");
  await requireLessonUnlocked(studentId, quiz.courseId, lesson._id);
  return state;
};

module.exports = { getLearningState, requireLessonUnlocked, requireQuizUnlocked };

const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const {
  getCourseState,
  getLessonContent,
  completeLesson,
  getQuizContent,
  submitAttempt,
} = require("../controllers/learning");

// Full learning state for a course: sections, lock flags, lesson scores.
router.get("/:courseId/state", auth, relasedTo("student"), getCourseState);

// Lesson content — only served when the lesson is actually unlocked.
router.get(
  "/:courseId/lesson/:lessonId",
  auth,
  relasedTo("student"),
  getLessonContent,
);
router.post(
  "/:courseId/lesson/:lessonId/complete",
  auth,
  relasedTo("student"),
  completeLesson,
);

// Quiz content (no correct answers) and attempt submission with server grading.
router.get("/quiz/:quizId", auth, relasedTo("student"), getQuizContent);
router.post("/quiz/:quizId/attempt", auth, relasedTo("student"), submitAttempt);

module.exports = router;

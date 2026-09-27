const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const {
  submitQuizAttempt,
  getMyQuizAttempts,
  getQuizAttemptById,
} = require("../controllers/QuizAttempt");
router.post("/submit", auth, relasedTo("student"), submitQuizAttempt);
router.get("/my-attempts", auth, relasedTo("student"), getMyQuizAttempts);
router.get(
  "/my-attempts/:attemptId",
  auth,
  relasedTo("student"),
  getQuizAttemptById,
);

module.exports = router;

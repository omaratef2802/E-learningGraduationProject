const express = require("express");
const router = express.Router();
const quizController = require("../controllers/QuizAttempt");
const { auth, relasedTo } = require("../middlewares/auth");

router.post("/:quizId/attempts", auth, relasedTo("user"), quizController.submitQuiz);
router.get("/:quizId/my-attempts", auth, relasedTo("user"), quizController.getMyQuizAttempts);

module.exports = router;
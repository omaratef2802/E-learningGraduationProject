const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} = require("../controllers/Quiz");
router.post("/createQuiz", auth, relasedTo("instructor"), createQuiz);
router.get("/getQuizzes", auth, relasedTo("student", "instructor"), getQuizzes);
router.get(
  "/getQuiz/:id",
  auth,
  relasedTo("student", "instructor"),
  getQuizById,
);
router.patch("/updateQuiz/:id", auth, relasedTo("instructor"), updateQuiz);
router.delete("/deleteQuiz/:id", auth, relasedTo("instructor"), deleteQuiz);

module.exports = router;

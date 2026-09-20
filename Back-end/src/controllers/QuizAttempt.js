const QuizAttempt = require("../modules/dbQuizAttempt");
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { courseId, lessonId, answers, quizSnapshot } = req.body;
    const studentId = req.id; 

    let correctCount = 0;
    const totalQuestions = quizSnapshot.questions.length;

    quizSnapshot.questions.forEach((question, index) => {
      if (
        answers[index] &&
        answers[index].selectedAnswer === question.correctAnswer
      ) {
        correctCount++;
      }
    });

    const percentage = (correctCount / totalQuestions) * 100;
    const passed = percentage >= 70;

    const attempt = await QuizAttempt.create({
      student: studentId,
      quiz: quizId,
      course: courseId,
      lesson: lessonId,
      quizSnapshot,
      studentAnswers: answers,
      score: correctCount,
      totalScore: totalQuestions,
      percentage,
      passed,
    });

    return res.status(201).json({
      success: true,
      message: passed ? "Congratulations, you passed the quiz!" : "You failed the quiz, try again.",
      data: attempt,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
exports.getMyQuizAttempts = async (req, res) => {
try {
const { quizId } = req.params;
const studentId = req.id;

const attempts = await QuizAttempt.find({ student: studentId, quiz: quizId });

return res.status(200).json({
success: true,
count: attempts.length,
data: attempts,
});
} catch (error) {
return res.status(500).json({ success: false, message: error.message });
}
};
const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true }, // متوافق مع الـ contract
course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
quizSnapshot: {
questions: [{
questionText: String,
options: [String],
correctAnswer: String
}]
},
studentAnswers: [{
questionIndex: Number,
selectedAnswer: String
}],
score: { type: Number, required: true },
totalScore: { type: Number, required: true },
percentage: { type: Number, required: true },
passed: { type: Boolean, required: true }
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
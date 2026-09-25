const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "quizzes",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lessons",
    },

    quizSnapshot: {
      questions: [
        {
          questionText: String,
          options: [String],
          correctAnswer: String,
          points: Number,
        },
      ],
    },

    studentAnswers: [
      {
        questionIndex: Number,
        selectedAnswer: String,
      },
    ],

    score: {
      type: Number,
      required: true,
      min: 0,
    },

    totalScore: {
      type: Number,
      required: true,
      min: 0,
    },

    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    passed: {
      type: Boolean,
      required: true,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

quizAttemptSchema.index({ student: 1, quiz: 1, createdAt: -1 });
quizAttemptSchema.index({ student: 1, course: 1, createdAt: -1 });

const quizAttemptsModule = mongoose.model("QuizAttempt", quizAttemptSchema);
module.exports = quizAttemptsModule;

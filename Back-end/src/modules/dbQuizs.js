const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "courses", required: true },
    questions: [
      {
        question: { type: String, required: true, trim: true },
        options: {
          type: [String],
          required: true,
          validate: { validator: (value) => value.length >= 2, message: "Quiz question must have at least 2 options" },
        },
        correctAnswer: {
          type: String,
          required: true,
          trim: true,
          validate: {
            validator: function (value) { return this.options.includes(value); },
            message: "Correct answer must be one of the options",
          },
        },
        points: { type: Number, required: true, min: 1, default: 1 },
      },
    ],
    passingScore: { type: Number, required: true, min: 0, max: 100, default: 50 },
  },
  { timestamps: true },
);

quizSchema.index({ courseId: 1, instructorId: 1 });

module.exports = mongoose.model("quizzes", quizSchema);

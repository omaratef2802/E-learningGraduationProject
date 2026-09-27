const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
    },
    duration: {
      type: Number,
      default: 0,
      min: [0, "Duration cannot be negative"],
    },
    type: {
      type: String,
      enum: ["video", "text"],
      required: [true, "Lesson type is required"],
    },
    videoUrl: { type: String, default: null },
    videoPublicId: { type: String, default: null },
    textContent: { type: String, default: null, trim: true },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: [true, "Course is required"],
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sections",
      required: [true, "Section is required"],
    },
    order: {
      type: Number,
      required: [true, "Lesson order is required"],
      min: [1, "Order must start from 1"],
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "quizzes",
      default: null,
    },
    isPreview: { type: Boolean, default: false },
  },
  { timestamps: true },
);

lessonSchema.index({ sectionId: 1, order: 1 }, { unique: true });
lessonSchema.index({ courseId: 1 });

module.exports = mongoose.model("lessons", lessonSchema);

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: { type: String, trim: true },
  },
  { timestamps: true },
);

reviewSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
reviewSchema.index({ courseId: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);

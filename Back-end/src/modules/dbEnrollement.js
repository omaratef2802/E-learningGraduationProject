const mongoose = require("mongoose");

const enrollementSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "student is required"],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: [true, "course is required"],
    },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed"],
      default: "not-started",
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be less than 0"],
      max: [100, "Progress cannot be greater than 100"],
    },
    lastLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lessons",
      default: null,
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "lessons",
      },
    ],
    lastAccessedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "certificates",
      default: null,
    },
  },
  { timestamps: true },
);

enrollementSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
enrollementSchema.index({ studentId: 1, status: 1 });
enrollementSchema.index({ courseId: 1 });

module.exports = mongoose.model("enrollments", enrollementSchema);

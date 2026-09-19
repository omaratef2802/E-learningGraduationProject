const mongoose = require("mongoose");
const enrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    progressPercentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
    lastLessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
    lastPosition: {
      type: Number,
      default: 0,
    },
    completedAt: {
    type: Date,
    default: null
  },
    certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    default: null
  }
  
  },
  
  { timestamps: true },
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);

const mongoose = require("mongoose");

const projectSubmissionSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: [true, "Project is required"],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Student is required"],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: [true, "Course is required"],
    },
    submissionUrl: { type: String, trim: true, default: null },
    submissionFile: { type: String, trim: true, default: null },
    comment: { type: String, trim: true, default: null },
    status: {
      type: String,
      enum: ["submitted", "graded", "late"],
      default: "submitted",
    },
    score: { type: Number, min: 0, default: null },
    feedback: { type: String, trim: true, default: null },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

projectSubmissionSchema.index({ projectId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("projectSubmissions", projectSubmissionSchema);

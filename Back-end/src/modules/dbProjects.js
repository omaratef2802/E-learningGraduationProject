const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    projectDescription: {
      type: String,
      required: true,
      trim: true,
    },

    githubRepo: {
      type: String,
      trim: true,
    },

    liveDemo: {
      type: String,
      trim: true,
    },

    screenshots: [String],

    deadline: {
      type: Date,
      required: true,
    },

    submissionDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Assigned",
        "Submitted",
        "Under Review",
        "Approved",
        "Rejected",
        "Request Changes",
      ],
      default: "Assigned",
    },

    instructorFeedback: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },

      comment: String,

      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },

      reviewedAt: Date,
    },

    skillsAwarded: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
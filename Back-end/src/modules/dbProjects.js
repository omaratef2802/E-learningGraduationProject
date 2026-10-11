const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: [true, "Course is required"],
    },

    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lessons",
      default: null,
    },

    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Instructor is required"],
    },

    deadline: {
      type: Date,
      default: null,
    },

    maxScore: {
      type: Number,
      default: 100,
      min: [1, "Max score must be greater than 0"],
    },

    requirements: [
      {
        type: String,
        trim: true,
      },
    ],

    attachmentUrl: {
      type: String,
      default: null,
      trim: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
const projectModule = mongoose.model("projects", projectSchema);
module.exports = projectModule;

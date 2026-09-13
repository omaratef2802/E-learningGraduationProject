const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Track title is required"],
      trim: true,
      minlength: [3, "Track title must be at least 3 characters"],
      maxlength: [100, "Track title cannot exceed 100 characters"]
    },

    slug: {
      type: String,
      required: [true, "Track slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Invalid track slug"
      ]
    },

    description: {
      type: String,
      required: [true, "Track description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [500, "Description cannot exceed 500 characters"]
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"]
    },

    requiredSkills: [
      {
        skill: {
          type: String,
          required: [true, "Skill is required"],
          trim: true
        },

        level: {
          type: String,
          required: [true, "Skill level is required"],
          enum: {
            values: ["beginner", "intermediate", "advanced"],
            message: "Invalid skill level"
          }
        }
      }
    ],

    relatedCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course"
        }
      }
    ],
    icon: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);
module.exports = mongoose.model("Track", trackSchema);
const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Track title is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: [true, "Track slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid track slug"],
    },
    image: { type: String },
    description: {
      type: String,
      required: [true, "Track description is required"],
      trim: true,
      minlength: 10,
      maxlength: 500,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    requiredSkills: [
      {
        skill: { type: String, required: true, trim: true },
        level: {
          type: String,
          required: true,
          enum: ["beginner", "intermediate", "advanced"],
        },
      },
    ],
    relatedCourses: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "courses" },
      },
    ],
    icon: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("tracks", trackSchema);

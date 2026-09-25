const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [3, "Course title must be at least 3 characters"],
      maxlength: [150, "Course title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      minlength: [10, "Course description must be at least 10 characters"],
      maxlength: [1000, "Course description cannot exceed 1000 characters"],
    },
    slug: {
      type: String,
      required: [true, "Course slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers and hyphens",
      ],
    },
    image: {
      type: String,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Instructor is required"],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tracks",
      required: [true, "Track is required"],
    },

    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: [0, "Price cannot be negative"],
    },

    level: {
      type: String,
      required: [true, "Course level is required"],
      enum: {
        values: ["beginner", "intermediate", "advanced"],
        message: "Invalid course level",
      },
    },

    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be greater than 5"],
    },

    duration: {
      type: Number,
      required: [true, "Course duration is required"],
      min: [1, "Duration must be at least 1"],
    },

    status: {
      type: String,
      enum: {
        values: ["draft", "published", "archived"],
        message: "Invalid course status",
      },
      default: "draft",
    },

    objectives: [
      {
        type: String,
        trim: true,
      },
    ],

    prerequisites: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const courseModule = mongoose.model("courses", courseSchema);
module.exports = courseModule;

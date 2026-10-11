const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Section title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: [true, "Course is required"],
    },
    order: {
      type: Number,
      required: [true, "Section order is required"],
      min: [1, "Order must start from 1"],
    },
  },
  { timestamps: true },
);

sectionSchema.index({ courseId: 1, order: 1 }, { unique: true });

module.exports = mongoose.model("sections", sectionSchema);

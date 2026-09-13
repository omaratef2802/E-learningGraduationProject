const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: [3, "Category name must be at least 3 characters"],
      maxlength: [50, "Category name cannot exceed 50 characters"]
    },

    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers and hyphens"
      ]
    },

    icon: {
      type: String,
      trim: true
    },

    description: {
      type: String,
      required: [true, "Category description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [500, "Description cannot exceed 500 characters"]
    },

    subcategories: [
      {
        name: {
          type: String,
          required: [true, "Subcategory name is required"],
          trim: true,
          minlength: [2, "Subcategory name must be at least 2 characters"],
          maxlength: [50, "Subcategory name cannot exceed 50 characters"]
        },

        slug: {
          type: String,
          required: [true, "Subcategory slug is required"],
          trim: true,
          lowercase: true,
          match: [
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Subcategory slug is invalid"
          ]
        },
        image: {
          type: String,
          trim: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Category", categorySchema);
const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    // Older MongoDB data has a unique index on `student`. Keep this alias
    // populated until that legacy index is safely migrated from the database.
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      select: false,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
        required: true,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Wishlist", wishlistSchema);

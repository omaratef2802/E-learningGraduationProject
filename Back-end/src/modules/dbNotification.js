const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: [
        "payment",
        "enrollment",
        "project",
        "certificate",
        "review",
        "system",
      ],
      default: "system",
    },
  },
  {
    timestamps: true,
  },
);

const notification = mongoose.model("notifications", notificationSchema);
module.exports = notification;

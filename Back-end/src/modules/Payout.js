const mongoose = require("mongoose");
const payoutSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paid"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Payout", payoutSchema);

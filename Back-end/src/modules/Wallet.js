const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    balance: { type: Number, default: 0, min: 0 },
    pendingPayout: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

walletSchema.virtual("availableBalance").get(function () {
  return Math.max(0, this.balance - this.pendingPayout);
});

module.exports = mongoose.model("Wallet", walletSchema);

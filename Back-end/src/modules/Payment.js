const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "processing", "success", "failed", "refunded"], default: "pending" },
    fulfilledAt: { type: Date, default: null },
  },
  { timestamps: true },
);

paymentSchema.index({ orderId: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const PasswordResetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
      required: true,
    },
    otp: {
      type: String,
      required: [true, "otp is required"],
    },
    otpExpires: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

PasswordResetSchema.pre("save", async function () {
  if (this.otp) {
    this.otp = await bcrypt.hash(this.otp, 10);
  }
});

const PasswordReset = mongoose.model("passwordResets", PasswordResetSchema);

module.exports = PasswordReset;

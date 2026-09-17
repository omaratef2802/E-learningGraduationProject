const mongoose = require("mongoose");
const walletSchema = new mongoose.Schema({
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  holdingBalance: {
    type: Number,
    default: 0,
  },
  availableBalance: {
    type: Number,
    default: 0,
  },
});
module.exports = mongoose.model("Wallet", walletSchema);

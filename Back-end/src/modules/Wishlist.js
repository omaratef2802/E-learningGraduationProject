const mongoose = require("mongoose");
const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  ],
});
module.exports = mongoose.model("Wishlist", wishlistSchema);

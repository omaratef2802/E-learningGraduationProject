const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const { addToWishlist, getWishlist, removeFromWishlist, clearWishlist } = require("../controllers/Wishlist");
router.get("/", auth, relasedTo("student"), getWishlist);
router.post("/courses", auth, relasedTo("student"), addToWishlist);
router.delete("/courses/:courseId", auth, relasedTo("student"), removeFromWishlist);
router.delete("/courses", auth, relasedTo("student"), clearWishlist);
module.exports = router;

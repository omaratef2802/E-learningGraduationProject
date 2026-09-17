const express = require("express");
const { addToWishlist, getWishlist, removeFromWishlist} = require("../controllers/Wishlist");
const auth = require("../middleware/auth");
const router = express.Router();
router.post("/", auth, addToWishlist);
router.get("/", auth, getWishlist);
router.delete("/:courseId", auth, removeFromWishlist);
module.exports = router;

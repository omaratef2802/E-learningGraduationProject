const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const { addToCart, getCart, removeFromCart, clearCart } = require("../controllers/Cart");
router.get("/", auth, relasedTo("student"), getCart);
router.post("/courses", auth, relasedTo("student"), addToCart);
router.delete("/courses/:courseId", auth, relasedTo("student"), removeFromCart);
router.delete("/courses", auth, relasedTo("student"), clearCart);
module.exports = router;

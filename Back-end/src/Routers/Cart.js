const express = require("express");
const { addToCart, getCart, removeFromCart, clearCart} = require("../controllers/Cart");
const {auth} = require("../middlewares/auth");
const router = express.Router();
router.post("/", auth, addToCart);
router.get("/", auth, getCart);
router.delete("/:courseId", auth, removeFromCart);
router.delete("/", auth, clearCart);
module.exports = router;

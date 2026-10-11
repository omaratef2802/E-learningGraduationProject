const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const { createOrder, buyNow, getOrders, getOrderById } = require("../controllers/Order");
router.get("/", auth, relasedTo("student"), getOrders);
router.post("/", auth, relasedTo("student"), createOrder);
router.post("/buy-now", auth, relasedTo("student"), buyNow);
router.get("/:id", auth, relasedTo("student"), getOrderById);
module.exports = router;

const express = require("express");
const { createOrder, getOrders, getOrderById} = require("../controllers/Order");
const auth = require("../middleware/auth");
const router = express.Router();
router.post("/", auth, createOrder);
router.get("/", auth, getOrders);
router.get("/:id", auth, getOrderById);
module.exports = router;

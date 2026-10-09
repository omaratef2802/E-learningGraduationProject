const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const { createPayment, getPaymentHistory, getPaymentStatus, paymobCallback } = require("../controllers/Payment");
router.post("/paymob/callback", paymobCallback);
router.post("/", auth, relasedTo("student"), createPayment);
router.get("/", auth, relasedTo("student"), getPaymentHistory);
router.get("/:id/status", auth, relasedTo("student"), getPaymentStatus);
module.exports = router;

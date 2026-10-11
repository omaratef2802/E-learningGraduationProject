const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const {
  getPayPalConfig,
  createPayPalOrder,
  capturePayPalOrder,
  getPaymentHistory,
  getPaymentStatus,
} = require("../controllers/Payment");

// PayPal client ID is public, but require a student session so checkout is available only to learners.
router.get("/paypal/config", auth, relasedTo("student"), getPayPalConfig);
router.post("/paypal/create-order", auth, relasedTo("student"), createPayPalOrder);
router.post("/paypal/capture-order", auth, relasedTo("student"), capturePayPalOrder);

router.get("/", auth, relasedTo("student"), getPaymentHistory);
router.get("/:id/status", auth, relasedTo("student"), getPaymentStatus);

module.exports = router;

const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const { createPayment, updatePayment, getPaymentHistory } = require("../controllers/Payment");
router.post("/", auth, relasedTo("student"), createPayment);
router.get("/", auth, relasedTo("student"), getPaymentHistory);
router.patch("/:id", auth, relasedTo("admin"), updatePayment);
router.patch("/:id/confirm", auth, relasedTo("admin"), updatePayment);
module.exports = router;

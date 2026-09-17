const express = require("express");
const { createPayment, updatePayment, getPaymentHistory} = require("../controllers/Payment");
const {auth , relasedTo} = require("../middlewares/auth");
const router = express.Router();
router.post("/", auth, createPayment);
router.patch("/:id", relasedTo("admin"), auth, updatePayment);
router.get("/history", auth, getPaymentHistory);
module.exports = router;

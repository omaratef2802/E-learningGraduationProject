const express = require("express");
const { createRefund, getRefunds, updateRefund} = require("../controllers/Refund");
const auth = require("../middleware/auth");
const router = express.Router();
router.post("/", auth, createRefund);
router.get("/", auth, getRefunds);
router.patch("/:id", relasedTo("admin"), auth, updateRefund);
module.exports = router;

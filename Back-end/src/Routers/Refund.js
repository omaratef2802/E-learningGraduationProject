const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const {
  createRefund,
  getRefunds,
  updateRefund,
} = require("../controllers/Refund");
router.post("/", auth, relasedTo("student"), createRefund);
router.get("/", auth, relasedTo("student"), getRefunds);
router.patch("/:id", auth, relasedTo("admin"), updateRefund);
module.exports = router;

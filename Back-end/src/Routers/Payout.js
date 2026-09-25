const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const {
  createPayout,
  getPayoutHistory,
  updatePayout,
} = require("../controllers/Payout");
router.post("/", auth, relasedTo("instructor"), createPayout);
router.get("/", auth, relasedTo("instructor"), getPayoutHistory);
router.patch("/:id", auth, relasedTo("admin"), updatePayout);
module.exports = router;

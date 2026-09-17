const express = require("express");
const { createPayout, getPayoutHistory, updatePayout} = require("../controllers/Payout");
const {auth , relasedTo} = require("../middlewares/auth");
const router = express.Router();
router.post("/", auth, createPayout);
router.get("/", auth, getPayoutHistory);
router.patch("/:id", relasedTo("admin"), auth, updatePayout);
module.exports = router;

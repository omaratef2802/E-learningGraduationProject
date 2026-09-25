const express = require("express");
const { getWallet } = require("../controllers/Wallet");
const { auth, relasedTo } = require("../middlewares/auth");
const router = express.Router();
router.get("/", auth, relasedTo("instructor"), getWallet);
module.exports = router;

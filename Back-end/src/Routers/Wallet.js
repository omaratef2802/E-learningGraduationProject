const express = require("express");
const { getWallet } = require("../controllers/Wallet");
const auth = require("../middleware/auth");
const router = express.Router();
router.get("/", auth, getWallet);
module.exports = router;

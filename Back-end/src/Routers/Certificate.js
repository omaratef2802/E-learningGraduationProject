const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const { verifyCertificate, getMyCertificates } = require("../controllers/Certificate");
router.get("/verify/:certificateId", verifyCertificate);
router.get("/myCertificates", auth, relasedTo("student"), getMyCertificates);
module.exports = router;

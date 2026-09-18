const express = require("express");
const router = express.Router();

const { verifyCertificate, generateCertificate } = require("../controllers/Certificate");

router.get("/verify/:certificateId", verifyCertificate);
router.post("/generate", generateCertificate);

module.exports = router;
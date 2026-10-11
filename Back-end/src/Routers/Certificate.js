const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const { verifyCertificate, getMyCertificates, getInstructorCertificates } = require("../controllers/Certificate");
router.get("/verify/:certificateId", verifyCertificate);
router.get("/myCertificates", auth, relasedTo("student"), getMyCertificates);
router.get("/instructorCertificates", auth, relasedTo("instructor"), getInstructorCertificates);
module.exports = router;

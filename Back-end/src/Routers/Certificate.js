const express = require("express");

const router = express.Router();

const {
  verifyCertificate,
  getMyCertificates,
} = require("../controllers/Certificate");

const { auth, relasedTo } = require("../middlewares/auth");

// Public certificate verification
router.get(
  "/verify/:certificateId",
  verifyCertificate
);

// Student views their certificates
router.get(
  "/my-certificates",
  auth,
  relasedTo("user"),
  getMyCertificates
);

module.exports = router;
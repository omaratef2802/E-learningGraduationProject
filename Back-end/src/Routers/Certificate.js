const express = require("express");

const router = express.Router();

const {
  verifyCertificate,
  getMyCertificates,
} = require("../controllers/Certificate");

const { auth, relasedTo } = require("../middlewares/auth");

router.get(
  "/verify/:certificateId",
  verifyCertificate
);

router.get(
  "/my-certificates",
  auth,
  relasedTo("user"),
  getMyCertificates
);

module.exports = router;
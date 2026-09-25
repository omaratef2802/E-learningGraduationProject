const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const { getInstructorStudents } = require("../controllers/Instructor");

router.get(
  "/students",
  auth,
  relasedTo("instructor", "admin"),
  getInstructorStudents
);

module.exports = router;

const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const { getMyEnrollements, getEnrollementById, updateProgress } = require("../controllers/Enrollement");

router.get("/myCourses", auth, relasedTo("student"), getMyEnrollements);
router.get("/course/:id", auth, relasedTo("student"), getEnrollementById);
router.patch("/progress/:id", auth, relasedTo("student"), updateProgress);
module.exports = router;

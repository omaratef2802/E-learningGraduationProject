const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const {
  createSection,
  getCourseSections,
  getSectionById,
  updateSection,
  deleteSection,
} = require("../controllers/section");

router.post("/course/:courseId", auth, relasedTo("instructor"), createSection);
router.get(
  "/course/:courseId",
  auth,
  relasedTo("student", "instructor"),
  getCourseSections,
);
router.get("/:id", auth, relasedTo("student", "instructor"), getSectionById);
router.patch("/:id", auth, relasedTo("instructor"), updateSection);
router.delete("/:id", auth, relasedTo("instructor"), deleteSection);
module.exports = router;

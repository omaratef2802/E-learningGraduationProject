const express = require("express");

const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCoursesByTrack,
  getCoursesByCategory,
  getCourseById,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
} = require("../controllers/Course");

const { auth, relasedTo } = require("../middlewares/auth");

router.get("/", getAllCourses);
router.get("/courses", getAllCourses);
router.get("/track/:trackId", getCoursesByTrack);
router.get("/category/:categoryId", getCoursesByCategory);
router.get("/:id", getCourseById);

router.post("/addCourse", auth, relasedTo("instructor"), createCourse);
router.put("/updateCourse/:id", auth, relasedTo("instructor"), updateCourse);
router.patch("/status/:id", auth, relasedTo("instructor"), updateCourseStatus);
router.delete("/deleteCourse/:id", auth, relasedTo("instructor"), deleteCourse);
module.exports = router;

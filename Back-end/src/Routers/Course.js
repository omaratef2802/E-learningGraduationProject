const express = require("express");

const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCoursesByTrack,
  getCoursesByCategory,
  getCourseById,
  updateCourse,
  deleteCourse
} = require("../controllers/Course");

const { auth, relasedTo } = require("../middlewares/auth");

router.get("/", auth, getAllCourses);

router.get("/track/:trackId", auth, getCoursesByTrack);

router.get("/category/:categoryId", auth, getCoursesByCategory);

router.get("/:id", auth, getCourseById);

router.post("/", auth, relasedTo("admin", "instructor"), createCourse);

router.put("/:id", auth,relasedTo("admin", "instructor"), updateCourse);

router.delete("/:id", auth,relasedTo("admin", "instructor"), deleteCourse);

module.exports = router;
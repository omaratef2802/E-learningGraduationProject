const express = require("express");

const router = express.Router();

const {
  createCourse,
  getCourses,
  getCoursesByTrack,
  getCoursesByCategory,
  getCourseById,
  updateCourse,
  deleteCourse
} = require("../controllers/Course");

const { auth, relasedTo } = require("../middlewares/auth");


// Get All Courses
router.get("/", auth, getCourses);


// Get Courses By Track
router.get("/track/:trackId", auth, getCoursesByTrack);


// Get Courses By Category
router.get("/category/:categoryId", auth, getCoursesByCategory);


// Get Course By ID
router.get("/id/:id", auth, getCourseById);


// Create Course - Admin only
router.post("/", auth, relasedTo("admin"), createCourse);


// Update Course - Admin only
router.put("/:id", auth, relasedTo("admin"), updateCourse);


// Delete Course - Admin only
router.delete("/:id", auth, relasedTo("admin"), deleteCourse);


module.exports = router;
const express = require("express");

const router = express.Router();

const {
  createCourse,
  createCourseByAdmin,
  getAdminCourses,
  getAllCourses,
  getCoursesByTrack,
  getCoursesByCategory,
  getCoursesByInstructor,
  getCourseById,
  updateCourse,
  updateCourseStatus,
  reviewCourse,
  getCoursesForReview,
  deleteCourse,
} = require("../controllers/Course");

const { auth, relasedTo } = require("../middlewares/auth");

router.get("/", getAllCourses);
router.get("/myCourses", auth, getAllCourses);
router.get("/courses", getAllCourses);
router.get("/track/:trackId", getCoursesByTrack);
router.get("/category/:categoryId", getCoursesByCategory);
router.get("/instructor/:instructorId", getCoursesByInstructor);

// Admin review routes are declared before `/:id` so "review" is not captured
// as a course id by the route below.
router.get("/review/pending", auth, relasedTo("admin"), getCoursesForReview);
router.patch("/review/:id", auth, relasedTo("admin"), reviewCourse);
router.get("/admin/all", auth, relasedTo("admin"), getAdminCourses);
router.post("/admin/create", auth, relasedTo("admin"), createCourseByAdmin);

router.get("/:id", getCourseById);

router.post("/addCourse", auth, relasedTo("instructor"), createCourse);
router.put("/updateCourse/:id", auth, relasedTo("instructor"), updateCourse);
router.patch("/status/:id", auth, relasedTo("instructor"), updateCourseStatus);
router.delete("/deleteCourse/:id", auth, relasedTo("instructor", "admin"), deleteCourse);

module.exports = router;

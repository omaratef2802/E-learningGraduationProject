const express = require("express");
const { auth, relasedTo } = require("../middlewares/auth");
const router = express.Router();
const { createReview, getReviews, updateReview, deleteReview } = require("../controllers/Review");
router.post("/createReview/:courseId", auth, relasedTo("student"), createReview);
router.get("/getReviews/:courseId", getReviews);
router.patch("/updateReview/:id", auth, relasedTo("student"), updateReview);
router.delete("/deleteReview/:id", auth, relasedTo("student"), deleteReview);
module.exports = router;

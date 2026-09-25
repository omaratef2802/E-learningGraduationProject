const Review = require("../modules/dbReview");
const Enrollment = require("../modules/dbEnrollement");
const Course = require("../modules/dbCourse");
const { updateUserActivity } = require("../services/activity");
const ApiError = require("../utils/ApiError");

const refreshCourseRating = async (courseId) => {
  const stats = await Review.aggregate([
    { $match: { courseId } },
    { $group: { _id: "$courseId", average: { $avg: "$rating" } } },
  ]);
  const rating = stats.length ? Math.round(stats[0].average * 10) / 10 : 0;
  await Course.findByIdAndUpdate(courseId, { rating });
};

const createReview = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const enrollment = await Enrollment.findOne({ studentId: req.id, courseId, status: "completed" });
    if (!enrollment) return next(new ApiError(403, "You must complete the course before reviewing it"));

    const review = await Review.create({ studentId: req.id, courseId, rating, comment });
    await refreshCourseRating(courseId);
    await updateUserActivity(req.id);
    return res.status(201).json({ message: "Review created successfully", data: review });
  } catch (error) {
    if (error?.code === 11000) return next(new ApiError(409, "You have already reviewed this course"));
    return next(new ApiError(500, error.message));
  }
};

const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ courseId: req.params.courseId })
      .populate("studentId", "firstName lastName img")
      .sort({ createdAt: -1 });
    return res.status(200).json({ count: reviews.length, reviews });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, studentId: req.id });
    if (!review) return next(new ApiError(404, "Review not found"));
    if (req.body.rating !== undefined) review.rating = req.body.rating;
    if (req.body.comment !== undefined) review.comment = req.body.comment;
    await review.save();
    await refreshCourseRating(review.courseId);
    return res.status(200).json({ message: "Review updated successfully", data: review });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, studentId: req.id });
    if (!review) return next(new ApiError(404, "Review not found"));
    await refreshCourseRating(review.courseId);
    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

module.exports = { createReview, getReviews, updateReview, deleteReview };

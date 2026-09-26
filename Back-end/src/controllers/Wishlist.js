const Wishlist = require("../modules/Wishlist");
const Course = require("../modules/dbCourse");
const Enrollment = require("../modules/dbEnrollement");
const ApiError = require("../utils/ApiError");

const addToWishlist = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findOne({ _id: courseId, status: "published" });
    if (!course)
      return next(new ApiError(404, "Course not found or not available"));
    if (await Enrollment.exists({ studentId: req.id, courseId }))
      return next(new ApiError(409, "You are already enrolled in this course"));

    let wishlist = await Wishlist.findOne({ userId: req.id });
    if (!wishlist)
      wishlist = await Wishlist.create({ userId: req.id, courses: [courseId] });
    else {
      if (wishlist.courses.some((id) => id.toString() === courseId.toString()))
        return next(new ApiError(400, "Course already in wishlist"));
      wishlist.courses.push(courseId);
      await wishlist.save();
    }
    return res
      .status(201)
      .json({ message: "Course added to wishlist", wishlist });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};
const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.id }).populate(
      "courses",
      "title image price slug status",
    );
    if (!wishlist) return res.status(200).json({ userId: req.id, courses: [] });
    return res.status(200).json(wishlist);
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};
const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.id });
    if (!wishlist) return next(new ApiError(404, "Wishlist not found"));
    wishlist.courses = wishlist.courses.filter(
      (id) => id.toString() !== req.params.courseId,
    );
    await wishlist.save();
    return res
      .status(200)
      .json({ message: "Course removed from wishlist", wishlist });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};
const clearWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.id });
    if (!wishlist) return res.status(200).json({ message: "Wishlist cleared" });
    wishlist.courses = [];
    await wishlist.save();
    return res.status(200).json({ message: "Wishlist cleared" });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};
module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
};

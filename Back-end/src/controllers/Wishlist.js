const Wishlist = require("../modules/Wishlist");
const Course = require("../modules/dbCourse");
const Enrollment = require("../modules/dbEnrollement");
const ApiError = require("../utils/ApiError");

const addToWishlist = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return next(new ApiError(400, "Course id is required"));

    // Validate both conditions together instead of making the student wait for
    // two sequential database round trips before their wishlist is updated.
    const [course, enrollment] = await Promise.all([
      Course.exists({ _id: courseId, status: "published" }),
      Enrollment.exists({ studentId: req.id, courseId }),
    ]);
    if (!course) return next(new ApiError(404, "Course not found or not available"));
    if (enrollment) return next(new ApiError(409, "You are already enrolled in this course"));

    // $addToSet makes repeated clicks/retries safe and performs the wishlist
    // update in one atomic database operation.
    const ownerFilter = { $or: [{ userId: req.id }, { student: req.id }] };
    const wishlistUpdate = {
      $set: { userId: req.id, student: req.id },
      $addToSet: { courses: courseId },
    };
    let wishlist;
    try {
      wishlist = await Wishlist.findOneAndUpdate(
        ownerFilter,
        wishlistUpdate,
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
    } catch (error) {
      // Two first-time requests can race to create the unique user wishlist.
      // If that happens, retry the atomic add against the row that now exists.
      if (error.code !== 11000) throw error;
      wishlist = await Wishlist.findOneAndUpdate(
        ownerFilter,
        wishlistUpdate,
        { new: true },
      );
    }
    return res.status(201).json({ message: "Course added to wishlist", wishlist });
  } catch (error) { return next(new ApiError(500, error.message)); }
};
const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ $or: [{ userId: req.id }, { student: req.id }] }).populate({ path: "courses", select: "title description image price slug level rating duration objectives prerequisites status instructorId category track", populate: [
      { path: "instructorId", select: "firstName lastName email img bio" },
      { path: "category", select: "name slug" },
      { path: "track", select: "title slug" },
    ] });
    if (!wishlist) return res.status(200).json({ userId: req.id, courses: [] });
    return res.status(200).json(wishlist);
  } catch (error) { return next(new ApiError(500, error.message)); }
};
const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ $or: [{ userId: req.id }, { student: req.id }] });
    if (!wishlist) return next(new ApiError(404, "Wishlist not found"));
    wishlist.courses = wishlist.courses.filter((id) => id.toString() !== req.params.courseId);
    await wishlist.save();
    return res.status(200).json({ message: "Course removed from wishlist", wishlist });
  } catch (error) { return next(new ApiError(500, error.message)); }
};
const clearWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ $or: [{ userId: req.id }, { student: req.id }] });
    if (!wishlist) return res.status(200).json({ message: "Wishlist cleared" });
    wishlist.courses = [];
    await wishlist.save();
    return res.status(200).json({ message: "Wishlist cleared" });
  } catch (error) { return next(new ApiError(500, error.message)); }
};
module.exports = { addToWishlist, getWishlist, removeFromWishlist, clearWishlist };

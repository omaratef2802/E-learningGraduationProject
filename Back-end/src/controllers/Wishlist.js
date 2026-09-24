const Wishlist = require("../modules/Wishlist");
const ApiError = require("../utils/ApiError");
const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: userId,
        courses: [courseId],
      });
      return res.status(201).json({
        message: "Course added to wishlist",
        wishlist: wishlist,
      });
    }
    const courseExists = wishlist.courses.find(
      (course) => course.toString() === courseId,
    );
    if (courseExists) {
      throw new ApiError(400, "Course already in wishlist");
    }

    wishlist.courses.push(courseId);
    await wishlist.save();
    res.status(200).json({
      message: "Course added to wishlist",
      wishlist: wishlist,
    });
  } catch (error) {
    next(error);
  }
};
const getWishlist = async (req, res, next) => {
  try {
    const userId = req.id;
    const wishlist = await Wishlist.findOne({ userId }).populate({path:"courses",populate:{path:"instructorId"}});
    if (!wishlist) {
      throw new ApiError(404, "Wishlist is empty");
    }
    res.status(200).json(wishlist);
  } catch (error) {
    next(error);
  }
};
const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.id;
    const courseId = req.params.courseId;
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      throw new ApiError(404, "Wishlist not found");
    }
    const courseExists = wishlist.courses.find(
      (course) => course.toString() === courseId,
    );
    if (!courseExists) {
      throw new ApiError(404, "Course not found in wishlist");
    }
    wishlist.courses = wishlist.courses.filter(
      (course) => course.toString() !== courseId,
    );
    await wishlist.save();
    res.status(200).json({
      message: "Course removed from wishlist",
      wishlist: wishlist,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { addToWishlist, getWishlist, removeFromWishlist};

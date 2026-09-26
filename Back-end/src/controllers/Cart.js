const Cart = require("../modules/Cart");
const Course = require("../modules/dbCourse");
const Enrollment = require("../modules/dbEnrollement");
const ApiError = require("../utils/ApiError");

const recalculateCart = (cart) => {
  cart.totalPrice = cart.courses.reduce((sum, item) => sum + item.price, 0);
};

const addToCart = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return next(new ApiError(400, "courseId is required"));
    const course = await Course.findOne({ _id: courseId, status: "published" });
    if (!course)
      return next(new ApiError(404, "Course not found or not available"));
    if (await Enrollment.exists({ studentId: req.id, courseId }))
      return next(new ApiError(409, "You are already enrolled in this course"));

    let cart = await Cart.findOne({ userId: req.id });
    if (!cart)
      cart = await Cart.create({
        userId: req.id,
        courses: [{ courseId, price: course.price }],
        totalPrice: course.price,
      });
    else {
      if (
        cart.courses.some(
          (item) => item.courseId.toString() === courseId.toString(),
        )
      )
        return next(new ApiError(400, "Course already in cart"));
      cart.courses.push({ courseId, price: course.price });
      recalculateCart(cart);
      await cart.save();
    }
    return res.status(201).json({ message: "Course added to cart", cart });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.id }).populate(
      "courses.courseId",
      "title image price slug status",
    );
    if (!cart)
      return res
        .status(200)
        .json({ userId: req.id, courses: [], totalPrice: 0 });
    return res.status(200).json(cart);
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.id });
    if (!cart) return next(new ApiError(404, "Cart not found"));
    const exists = cart.courses.some(
      (item) => item.courseId.toString() === req.params.courseId,
    );
    if (!exists) return next(new ApiError(404, "Course not found in cart"));
    cart.courses = cart.courses.filter(
      (item) => item.courseId.toString() !== req.params.courseId,
    );
    recalculateCart(cart);
    await cart.save();
    return res.status(200).json({ message: "Course removed from cart", cart });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.id });
    if (!cart) return res.status(200).json({ message: "Cart cleared" });
    cart.courses = [];
    cart.totalPrice = 0;
    await cart.save();
    return res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};
module.exports = { addToCart, getCart, removeFromCart, clearCart };

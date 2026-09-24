const Cart = require("../modules/Cart");
const ApiError = require("../utils/ApiError");
const addToCart = async (req, res, next) => {
  try {
    const userId = req.id;
    const { courseId, price } = req.body;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({
        userId: userId,
        courses: [
          {
            courseId: courseId,
            price: price,
          },
        ],
        totalPrice: price,
      });
      return res.status(201).json({
        message: "Course added to cart",
        cart: cart,
      });
    }
    const courseExists = cart.courses.find(
      (course) => course.courseId.toString() === courseId,
    );
    if (courseExists) {
      throw new ApiError(400, "Course already in cart");
    }
    cart.courses.push({
      courseId: courseId,
      price: price,
    });
    cart.totalPrice = cart.totalPrice + price;
    await cart.save();
    res.status(200).json({
      message: "Course added to cart",
      cart: cart,
    });
  } catch (error) {
    next(error);
  }
};
const getCart = async (req, res, next) => {
  try {
    const userId = req.id;

    const cart = await Cart.findOne({ userId }).populate({
      path: "courses.courseId",
      populate: {
        path: "instructorId",
      },
    });

    if (!cart) {
      throw new ApiError(404, "Cart is empty");
    }

    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};
const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.id;
    const courseId = req.params.courseId;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }
    const course = cart.courses.find(
      (course) => course.courseId.toString() === courseId,
    );
    if (!course) {
      throw new ApiError(404, "Course not found in cart");
    }
    cart.courses = cart.courses.filter(
      (course) => course.courseId.toString() !== courseId,
    );
    cart.totalPrice = cart.totalPrice - course.price;
    await cart.save();
    res.status(200).json({
      message: "Course removed from cart",
      cart: cart,
    });
  } catch (error) {
    next(error);
  }
};
const clearCart = async (req, res, next) => {
  try {
    const userId = req.id;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }
    cart.courses = [];
    cart.totalPrice = 0;
    await cart.save();
    res.status(200).json({
      message: "Cart cleared",
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { addToCart, getCart, removeFromCart, clearCart };

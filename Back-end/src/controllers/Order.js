const Order = require("../modules/Order");
const Cart = require("../modules/Cart");
const ApiError = require("../utils/ApiError");
const { createNotificationHelper } = require("./Notification");
const createOrder = async (req, res, next) => {
  try {
    const userId = req.id;
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.courses.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }
    const order = await Order.create({
      userId: userId,
      courses: cart.courses,
      totalPrice: cart.totalPrice,
      status: "pending",
    });
    await createNotificationHelper({
      userId: userId,
      title: "Order Placed",
      message: `Your order #${order._id} for $${order.totalPrice} has been placed.`,
      type: "payment",
      referenceId: order._id,
    });
    res.status(201).json({
      message: "Order created",
      order: order,
    });
  } catch (error) {
    next(error);
  }
};
const getOrders = async (req, res, next) => {
  try {
    const userId = req.id;
    const orders = await Order.find({
      userId: userId,
    });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};
const getOrderById = async (req, res, next) => {
  try {
    const userId = req.id;
    const order = await Order.findOne({
      _id: req.params.id,
      userId: userId,
    });
    if (!order) {
      throw new ApiError(404, "Order not found");
    }
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};
module.exports = { createOrder, getOrders, getOrderById};

const Payment = require("../modules/Payment");
const Order = require("../modules/Order");
const ApiError = require("../utils/ApiError");
const createPayment = async (req, res, next) => {
  try {
    const userId = req.id;
    const { orderId, paymentMethod } = req.body;
    const order = await Order.findOne({
      _id: orderId,
      userId: userId,
    });
    if (!order) {
      throw new ApiError(404, "Order not found");
    }
    const payment = await Payment.create({
      orderId: order._id,
      userId: userId,
      amount: order.totalPrice,
      paymentMethod: paymentMethod,
      status: "pending",
    });
    res.status(201).json({
      message: "Payment created",
      payment: payment,
    });
  } catch (error) {
    next(error);
  }
};
const updatePayment = async (req, res, next) => {
  try {
    const userId = req.id;
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: userId,
    });
    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }
    const { status } = req.body;
    if (status !== "success" && status !== "failed") {
      throw new ApiError(400, "Invalid payment status");
    }
    payment.status = status;
    await payment.save();
    const order = await Order.findById(payment.orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }
    if (status === "success") {
      order.status = "paid";
    }
    if (status === "failed") {
      order.status = "cancelled";
    }
    await order.save();
    res.status(200).json({
      message: "Payment updated",
      payment: payment,
    });
  } catch (error) {
    next(error);
  }
};
const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.id;
    const payments = await Payment.find({
      userId: userId,
    });
    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
};
module.exports = { createPayment, updatePayment, getPaymentHistory};

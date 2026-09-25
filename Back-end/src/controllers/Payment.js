const Payment = require("../modules/Payment");
const Order = require("../modules/Order");
const Wallet = require("../modules/Wallet");
const Course = require("../modules/dbCourse");
const { createEnrollmentForPayment } = require("../services/enrollment");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");

const fulfillOrder = async (orderId) => {
  const session = await mongoose.startSession();
  try {
    let fulfilledOrder;
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new ApiError(404, "Order not found");
      if (order.status === "refunded") throw new ApiError(400, "Order has already been refunded");
      order.status = "paid";

      for (const item of order.courses) {
        const course = await Course.findById(item.courseId).session(session);
        if (!course) throw new ApiError(404, "Course in order no longer exists");

        if (!item.enrollmentCreated) {
          const existingEnrollment = await require("../modules/dbEnrollement").findOne({ studentId: order.userId, courseId: course._id }).session(session);
          if (!existingEnrollment) {
            await require("../modules/dbEnrollement").create([{ studentId: order.userId, courseId: course._id }], { session });
          }
          item.enrollmentCreated = true;
        }

        if (!item.walletCredited) {
          let wallet = await Wallet.findOne({ instructorId: course.instructorId }).session(session);
          if (!wallet) {
            const created = await Wallet.create([{ instructorId: course.instructorId, balance: item.price, pendingPayout: 0 }], { session });
            wallet = created[0];
          } else {
            wallet.balance += item.price;
            await wallet.save({ session });
          }
          item.walletCredited = true;
        }
      }

      order.markModified("courses");
      await order.save({ session });
      fulfilledOrder = order;
    });
    return fulfilledOrder;
  } finally {
    await session.endSession();
  }
};

const createPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod } = req.body;
    if (!orderId || !paymentMethod) return next(new ApiError(400, "orderId and paymentMethod are required"));

    const order = await Order.findOne({ _id: orderId, userId: req.id });
    if (!order) return next(new ApiError(404, "Order not found"));
    if (order.status !== "pending") return next(new ApiError(400, "Order is not available for payment"));

    const existingPending = await Payment.findOne({ orderId: order._id, status: "pending" }).sort({ createdAt: -1 });
    if (existingPending) return res.status(200).json({ message: "Pending payment already exists", payment: existingPending });

    const payment = await Payment.create({
      orderId: order._id,
      userId: req.id,
      amount: order.totalPrice,
      paymentMethod,
      status: "pending",
    });

    return res.status(201).json({ message: "Payment created", payment });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const updatePayment = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["success", "failed"].includes(status)) return next(new ApiError(400, "Invalid payment status"));

    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      { $set: { status: status === "success" ? "processing" : "failed" } },
      { new: true },
    );
    if (!payment) return next(new ApiError(400, "Payment has already been processed or not found"));

    if (status === "failed") {
      payment.status = "failed";
      await payment.save();
      return res.status(200).json({ message: "Payment failed", payment });
    }

    let order;
    try {
      order = await fulfillOrder(payment.orderId);
    } catch (error) {
      await Payment.findByIdAndUpdate(payment._id, { $set: { status: "pending" } });
      throw error;
    }
    payment.status = "success";
    payment.fulfilledAt = new Date();
    await payment.save();

    return res.status(200).json({ message: "Payment confirmed successfully", payment, order });
  } catch (error) {
    return next(error instanceof ApiError ? error : new ApiError(500, error.message));
  }
};

const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.id })
      .populate("orderId")
      .sort({ createdAt: -1 });
    return res.status(200).json({ count: payments.length, data: payments });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

module.exports = { createPayment, updatePayment, getPaymentHistory, fulfillOrder };

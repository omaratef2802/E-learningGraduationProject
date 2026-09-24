const Refund = require("../modules/Refund");
const Payment = require("../modules/Payment");
const Order = require("../modules/Order");
const ApiError = require("../utils/ApiError");
const { createNotificationHelper } = require("./Notification");
const createRefund = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { paymentId, reason } = req.body;
    const payment = await Payment.findOne({
      _id: paymentId,
      userId: userId,
    });
    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }
    if (payment.status !== "success") {
      throw new ApiError(400, "Payment cannot be refunded");
    }
    const refund = await Refund.create({
      paymentId: paymentId,
      userId: userId,
      reason: reason,
    });
    res.status(201).json({
      message: "Refund request created",
      refund: refund,
    });
  } catch (error) {
    next(error);
  }
};
const getRefunds = async (req, res, next) => {
  try {
    const userId = req.id;
    const refunds = await Refund.find({
      userId: userId,
    });
    res.status(200).json(refunds);
  } catch (error) {
    next(error);
  }
};
const updateRefund = async (req, res, next) => {
  try {
    const refund = await Refund.findById(req.params.id);
    if (!refund) {
      throw new ApiError(404, "Refund not found");
    }
    const { status } = req.body;
    if (status !== "approved" && status !== "rejected") {
      throw new ApiError(400, "Invalid refund status");
    }
    refund.status = status;
    await refund.save();
    if (status === "approved") {
      const payment = await Payment.findById(refund.paymentId);
      if (!payment) {
        throw new ApiError(404, "Payment not found");
      }
      payment.status = "refunded";
      await payment.save();
      const order = await Order.findById(payment.orderId);
      if (!order) {
        throw new ApiError(404, "Order not found");
      }
      order.status = "refunded";
      await order.save();

      await createNotificationHelper({
        userId: refund.userId,
        title: "Refund Approved",
        message: `Your refund request for payment #${refund.paymentId} has been approved.`,
        type: "refund",
        referenceId: refund._id,
      });
    }
    if (status === "rejected") {
      await createNotificationHelper({
        userId: refund.userId,
        title: "Refund Rejected",
        message: `Your refund request for payment #${refund.paymentId} has been rejected.`,
        type: "refund",
        referenceId: refund._id,
      });
    }
    res.status(200).json({
      message: "Refund updated",
      refund: refund,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { createRefund, getRefunds, updateRefund};

const Refund = require("../modules/Refund");
const Payment = require("../modules/Payment");
const Order = require("../modules/Order");
const Wallet = require("../modules/Wallet");
const Enrollment = require("../modules/dbEnrollement");
const Certificate = require("../modules/dbCertificate");
const Course = require("../modules/dbCourse");
const ApiError = require("../utils/ApiError");

const createRefund = async (req, res, next) => {
  try {
    const { paymentId, reason } = req.body;
    const payment = await Payment.findOne({ _id: paymentId, userId: req.id });
    if (!payment) return next(new ApiError(404, "Payment not found"));
    if (payment.status !== "success")
      return next(new ApiError(400, "Payment cannot be refunded"));

    const existingRefund = await Refund.findOne({
      paymentId,
      status: { $in: ["pending", "approved"] },
    });
    if (existingRefund)
      return next(new ApiError(400, "A refund request already exists"));

    const refund = await Refund.create({ paymentId, userId: req.id, reason });
    return res.status(201).json({ message: "Refund request created", refund });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const getRefunds = async (req, res, next) => {
  try {
    const refunds = await Refund.find({ userId: req.id })
      .populate("paymentId")
      .sort({ createdAt: -1 });
    return res.status(200).json({ count: refunds.length, data: refunds });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const updateRefund = async (req, res, next) => {
  try {
    const refund = await Refund.findById(req.params.id);
    if (!refund) return next(new ApiError(404, "Refund not found"));
    if (refund.status !== "pending")
      return next(new ApiError(400, "Refund has already been processed"));

    const { status } = req.body;
    if (!["approved", "rejected"].includes(status))
      return next(new ApiError(400, "Invalid refund status"));

    if (status === "rejected") {
      refund.status = "rejected";
      await refund.save();
      return res.status(200).json({ message: "Refund rejected", refund });
    }

    const payment = await Payment.findById(refund.paymentId);
    if (!payment || payment.status !== "success")
      return next(new ApiError(400, "Payment is no longer refundable"));

    const order = await Order.findById(payment.orderId);
    if (!order) return next(new ApiError(404, "Order not found"));

    const itemsWithCourses = [];
    for (const item of order.courses) {
      const course = await Course.findById(item.courseId);
      if (!course)
        return next(new ApiError(404, "Course in order no longer exists"));
      let wallet = null;
      if (item.walletCredited) {
        wallet = await Wallet.findOne({ instructorId: course.instructorId });
        if (
          !wallet ||
          wallet.balance < item.price ||
          wallet.availableBalance < item.price
        ) {
          return next(
            new ApiError(
              400,
              `Instructor wallet cannot cover refund for course: ${course.title}`,
            ),
          );
        }
      }
      itemsWithCourses.push({ item, course, wallet });
    }

    for (const { item, course, wallet } of itemsWithCourses) {
      if (item.walletCredited) {
        wallet.balance -= item.price;
        await wallet.save();
        item.walletCredited = false;
      }
      if (item.enrollmentCreated) {
        await Enrollment.deleteOne({
          studentId: order.userId,
          courseId: course._id,
        });
        await Certificate.deleteOne({
          student: order.userId,
          course: course._id,
        });
        item.enrollmentCreated = false;
      }
    }

    payment.status = "refunded";
    order.status = "refunded";
    refund.status = "approved";

    await payment.save();
    await order.save();
    await refund.save();

    return res
      .status(200)
      .json({ message: "Refund approved successfully", refund });
  } catch (error) {
    return next(
      error instanceof ApiError ? error : new ApiError(500, error.message),
    );
  }
};

module.exports = { createRefund, getRefunds, updateRefund };

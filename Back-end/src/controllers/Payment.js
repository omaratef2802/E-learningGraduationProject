const Payment = require("../modules/Payment");
const Order = require("../modules/Order");
const Wallet = require("../modules/Wallet");
const Cart = require("../modules/Cart");
const Course = require("../modules/dbCourse");
const { createEnrollmentForPayment } = require("../services/enrollment");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const crypto = require("node:crypto");

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
      // Keep the cart intact while an order/payment is pending. Empty it only
      // in the same transaction that successfully marks the order as paid.
      await Cart.updateOne(
        { userId: order.userId },
        { $set: { courses: [], totalPrice: 0 } },
        { session },
      );
      fulfilledOrder = order;
    });
    return fulfilledOrder;
  } finally {
    await session.endSession();
  }
};

const createPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return next(new ApiError(400, "orderId is required"));
    const order = await Order.findOne({ _id: orderId, userId: req.id });
    if (!order) return next(new ApiError(404, "Order not found"));
    if (order.status !== "pending") return next(new ApiError(400, "Order is not available for payment"));

    const existingPending = await Payment.findOne({ orderId: order._id, status: "pending" }).sort({ createdAt: -1 });
    if (existingPending?.gatewayOrderId) return res.status(200).json({ message: "Pending payment already exists", payment: existingPending });

    const payment = await Payment.create({
      orderId: order._id,
      userId: req.id,
      amount: order.totalPrice,
      paymentMethod: process.env.PAYMENT_MODE === "mock" ? "mock" : "paymob",
      status: "pending",
    });

    if (process.env.PAYMENT_MODE === "mock") {
      try {
        await fulfillOrder(order._id);
        payment.status = "success";
        payment.fulfilledAt = new Date();
        await payment.save();
        return res.status(201).json({ message: "Demo payment completed", payment, demo: true });
      } catch (error) {
        payment.status = "failed";
        await payment.save();
        throw error;
      }
    }

    const requiredConfig = ["PAYMOB_SECRET_KEY", "PAYMOB_PUBLIC_KEY", "PAYMOB_INTEGRATION_ID", "PAYMOB_HMAC_SECRET", "PAYMOB_NOTIFICATION_URL", "FRONTEND_URL"];
    if (requiredConfig.some((key) => !process.env[key])) {
      await Payment.findByIdAndUpdate(payment._id, { status: "failed" });
      return next(new ApiError(503, "Paymob is not configured. Add the required Paymob environment variables."));
    }

    const User = require("../modules/dbUsers");
    const user = await User.findById(req.id).select("firstName lastName email phone");
    const billingData = {
      apartment: "NA", first_name: user.firstName || "Student", last_name: user.lastName || "User",
      street: "NA", building: "NA", phone_number: user.phone || "+200000000000",
      city: "Cairo", country: "EG", email: user.email, floor: "NA", state: "Cairo",
    };
    const response = await fetch("https://accept.paymob.com/v1/intention/", {
      method: "POST",
      headers: { Authorization: `Token ${process.env.PAYMOB_SECRET_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(order.totalPrice * 100), currency: "EGP",
        payment_methods: [Number(process.env.PAYMOB_INTEGRATION_ID)], billing_data: billingData,
        items: order.courses.map((item) => ({ name: "Course enrollment", amount: Math.round(item.price * 100), description: "Online course", quantity: 1 })),
        special_reference: payment._id.toString(), notification_url: process.env.PAYMOB_NOTIFICATION_URL,
        redirection_url: `${process.env.FRONTEND_URL.split(",")[0].trim()}/course/${order.courses[0].courseId}?paymentId=${payment._id}`,
      }),
    });
    const intention = await response.json();
    if (!response.ok || !intention.client_secret) {
      await Payment.findByIdAndUpdate(payment._id, { status: "failed" });
      return next(new ApiError(502, intention.message || "Could not start Paymob checkout"));
    }
    payment.gatewayOrderId = String(intention.intention_order_id);
    await payment.save();

    const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${encodeURIComponent(process.env.PAYMOB_PUBLIC_KEY)}&clientSecret=${encodeURIComponent(intention.client_secret)}`;
    return res.status(201).json({ message: "Paymob checkout created", payment, checkoutUrl });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const verifyPaymobHmac = (obj, received) => {
  const source = obj.source_data || {};
  const values = [obj.amount_cents, obj.created_at, obj.currency, obj.error_occured, obj.has_parent_transaction,
    obj.id, obj.integration_id, obj.is_3d_secure, obj.is_auth, obj.is_capture, obj.is_refunded,
    obj.is_standalone_payment, obj.is_voided, obj.order?.id, obj.owner, obj.pending,
    source.pan, source.sub_type, source.type, obj.success];
  if (values.some((value) => value === undefined || value === null)) return false;
  const expected = crypto.createHmac("sha512", process.env.PAYMOB_HMAC_SECRET || "").update(values.join("")).digest();
  const actual = Buffer.from(received || "", "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};

const paymobCallback = async (req, res, next) => {
  try {
    const obj = req.body?.obj;
    if (!obj || !verifyPaymobHmac(obj, req.query.hmac)) return next(new ApiError(401, "Invalid Paymob callback signature"));
    let payment = await Payment.findOne({ gatewayOrderId: String(obj.order?.id) });
    if (!payment) return next(new ApiError(404, "Payment not found"));
    if (payment.status === "success" || payment.status === "failed") return res.sendStatus(200);
    if (Number(obj.amount_cents) !== Math.round(payment.amount * 100) || obj.currency !== "EGP") return next(new ApiError(400, "Payment amount or currency does not match"));
    if (!obj.success || obj.pending) {
      payment.status = obj.pending ? "pending" : "failed";
      await payment.save();
      return res.sendStatus(200);
    }
    payment = await Payment.findOneAndUpdate(
      { _id: payment._id, status: "pending" },
      { $set: { status: "processing", gatewayTransactionId: String(obj.id) } },
      { new: true },
    );
    if (!payment) return res.sendStatus(200);
    try {
      await fulfillOrder(payment.orderId);
      payment.status = "success";
      payment.fulfilledAt = new Date();
      await payment.save();
    } catch (error) {
      payment.status = "pending";
      await payment.save();
      throw error;
    }
    return res.sendStatus(200);
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

const getPaymentStatus = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, userId: req.id }).select("_id status amount orderId");
    if (!payment) return next(new ApiError(404, "Payment not found"));
    return res.status(200).json({ payment });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

module.exports = { createPayment, getPaymentHistory, getPaymentStatus, fulfillOrder, paymobCallback };

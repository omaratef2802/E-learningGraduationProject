const axios = require("axios");
const Payment = require("../modules/Payment");
const Order = require("../modules/Order");
const Wallet = require("../modules/Wallet");
const Cart = require("../modules/Cart");
const Course = require("../modules/dbCourse");
const Enrollment = require("../modules/dbEnrollement");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");

const getPayPalSettings = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new ApiError(503, "PayPal is not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to the backend .env file.");
  }

  const mode = String(process.env.PAYPAL_MODE || "sandbox").toLowerCase();
  if (!["sandbox", "live"].includes(mode)) {
    throw new ApiError(500, "PAYPAL_MODE must be either sandbox or live.");
  }

  const currency = String(process.env.PAYPAL_CURRENCY || "USD").toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new ApiError(500, "PAYPAL_CURRENCY must be a three-letter currency code.");
  }

  const priceCurrency = String(process.env.PRICE_CURRENCY || "EGP").toUpperCase();
  if (!/^[A-Z]{3}$/.test(priceCurrency)) {
    throw new ApiError(500, "PRICE_CURRENCY must be a three-letter currency code.");
  }

  let egpPerUsd = Number(process.env.PAYPAL_EGP_PER_USD);
  let rateIsSandboxEstimate = false;
  if (priceCurrency === "EGP" && currency === "USD" && (!Number.isFinite(egpPerUsd) || egpPerUsd <= 0)) {
    if (mode === "live") {
      throw new ApiError(503, "Before enabling PayPal Live, set PAYPAL_EGP_PER_USD to your verified current EGP-per-USD pricing rate.");
    }
    // Sandbox-only display/testing fallback, not a production exchange-rate quote.
    egpPerUsd = 50;
    rateIsSandboxEstimate = true;
  }

  return {
    clientId,
    clientSecret,
    currency,
    priceCurrency,
    egpPerUsd,
    rateIsSandboxEstimate,
    baseUrl: mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com",
  };
};

const money = (value) => (Math.round((Number(value) + Number.EPSILON) * 100) / 100).toFixed(2);

const getGatewayAmount = (localAmount, settings) => {
  if (settings.priceCurrency === settings.currency) return money(localAmount);
  if (settings.priceCurrency === "EGP" && settings.currency === "USD" && settings.egpPerUsd > 0) {
    return money(Number(localAmount) / settings.egpPerUsd);
  }
  throw new ApiError(400, `No configured conversion is available from ${settings.priceCurrency} to ${settings.currency}.`);
};

const getPayPalAccessToken = async (settings) => {
  try {
    const response = await axios.post(
      `${settings.baseUrl}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: { username: settings.clientId, password: settings.clientSecret },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 20000,
      },
    );
    if (!response.data?.access_token) throw new Error("PayPal did not return an access token.");
    return response.data.access_token;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const detail = error.response?.data?.error_description || error.response?.data?.message;
    throw new ApiError(502, detail ? `PayPal authentication failed: ${detail}` : "Could not authenticate with PayPal. Check your PayPal Sandbox credentials.");
  }
};

const paypalRequest = async (method, path, data) => {
  const settings = getPayPalSettings();
  const accessToken = await getPayPalAccessToken(settings);
  try {
    const response = await axios({
      method,
      url: `${settings.baseUrl}${path}`,
      data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      timeout: 25000,
    });
    return response.data;
  } catch (error) {
    const providerMessage = error.response?.data?.details?.[0]?.description
      || error.response?.data?.message
      || error.response?.data?.name;
    throw new ApiError(502, providerMessage ? `PayPal request failed: ${providerMessage}` : "PayPal could not complete the request. Please try again.");
  }
};

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
          const existingEnrollment = await Enrollment.findOne({ studentId: order.userId, courseId: course._id }).session(session);
          if (!existingEnrollment) {
            await Enrollment.create([{ studentId: order.userId, courseId: course._id }], { session });
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
      // Remove only the courses paid for by this order. A direct "Buy now"
      // purchase must not erase unrelated courses the learner still has in the cart.
      const cart = await Cart.findOne({ userId: order.userId }).session(session);
      if (cart) {
        const purchasedIds = new Set(order.courses.map((item) => item.courseId.toString()));
        cart.courses = cart.courses.filter((item) => !purchasedIds.has(item.courseId.toString()));
        cart.totalPrice = cart.courses.reduce((sum, item) => sum + Number(item.price || 0), 0);
        await cart.save({ session });
      }
      fulfilledOrder = order;
    });
    return fulfilledOrder;
  } finally {
    await session.endSession();
  }
};

const getPayPalConfig = async (req, res, next) => {
  try {
    const settings = getPayPalSettings();
    return res.status(200).json({
      clientId: settings.clientId,
      currency: settings.currency,
      priceCurrency: settings.priceCurrency,
      egpPerUsd: settings.priceCurrency === "EGP" && settings.currency === "USD" ? settings.egpPerUsd : null,
      rateIsSandboxEstimate: settings.rateIsSandboxEstimate,
    });
  } catch (error) {
    return next(error instanceof ApiError ? error : new ApiError(500, error.message));
  }
};

const createPayPalOrder = async (req, res, next) => {
  let payment;
  try {
    const { orderId } = req.body;
    if (!orderId) return next(new ApiError(400, "orderId is required"));

    const order = await Order.findOne({ _id: orderId, userId: req.id });
    if (!order) return next(new ApiError(404, "Order not found"));
    if (order.status !== "pending") return next(new ApiError(400, "This order is not available for payment"));
    if (!Number.isFinite(Number(order.totalPrice)) || Number(order.totalPrice) <= 0) {
      return next(new ApiError(400, "PayPal checkout requires an order total greater than zero"));
    }

    const settings = getPayPalSettings();
    payment = await Payment.findOne({ orderId: order._id, userId: req.id, paymentMethod: "paypal", status: "pending" }).sort({ createdAt: -1 });

    // Reuse a pending provider order after a shopper closes the PayPal window.
    if (payment?.gatewayOrderId) {
      return res.status(200).json({
        message: "Pending PayPal order reused",
        payment: { _id: payment._id, orderId: payment.orderId, amount: payment.amount, currency: payment.currency, gatewayAmount: payment.gatewayAmount, gatewayCurrency: payment.gatewayCurrency, status: payment.status },
        paypalOrderId: payment.gatewayOrderId,
        currency: settings.currency,
        gatewayAmount: payment.gatewayAmount,
      });
    }

    const gatewayAmount = getGatewayAmount(order.totalPrice, settings);
    payment = await Payment.create({
      orderId: order._id,
      userId: req.id,
      amount: Number(order.totalPrice),
      currency: settings.priceCurrency,
      gatewayAmount: Number(gatewayAmount),
      gatewayCurrency: settings.currency,
      paymentMethod: "paypal",
      status: "pending",
    });

    const paypalOrder = await paypalRequest("POST", "/v2/checkout/orders", {
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: order._id.toString(),
        custom_id: payment._id.toString(),
        invoice_id: payment._id.toString(),
        description: "PathwayEd course enrollment",
        amount: { currency_code: settings.currency, value: gatewayAmount },
      }],
      application_context: {
        brand_name: "PathwayEd",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
      },
    });

    if (!paypalOrder?.id || paypalOrder.status !== "CREATED") {
      throw new ApiError(502, "PayPal did not create a valid checkout order");
    }

    payment.gatewayOrderId = paypalOrder.id;
    await payment.save();

    return res.status(201).json({
      message: "PayPal order created",
      payment: { _id: payment._id, orderId: payment.orderId, amount: payment.amount, currency: payment.currency, gatewayAmount: payment.gatewayAmount, gatewayCurrency: payment.gatewayCurrency, status: payment.status },
      paypalOrderId: paypalOrder.id,
      currency: settings.currency,
      gatewayAmount: payment.gatewayAmount,
    });
  } catch (error) {
    if (payment && !payment.gatewayOrderId) {
      await Payment.findByIdAndUpdate(payment._id, { $set: { status: "failed" } }).catch(() => {});
    }
    return next(error instanceof ApiError ? error : new ApiError(502, "Could not start PayPal checkout. Please check the Sandbox credentials and try again."));
  }
};

const capturePayPalOrder = async (req, res, next) => {
  try {
    const { paypalOrderId } = req.body;
    if (!paypalOrderId || typeof paypalOrderId !== "string") {
      return next(new ApiError(400, "paypalOrderId is required"));
    }

    let payment = await Payment.findOne({ gatewayOrderId: paypalOrderId, userId: req.id, paymentMethod: "paypal" });
    if (!payment) return next(new ApiError(404, "PayPal payment was not found for this account"));
    if (payment.status === "success") {
      return res.status(200).json({ message: "Payment already completed", payment, captureId: payment.gatewayTransactionId });
    }
    if (payment.status === "failed" || payment.status === "refunded") {
      return next(new ApiError(400, "This PayPal payment can no longer be captured"));
    }

    const order = await Order.findOne({ _id: payment.orderId, userId: req.id });
    if (!order) return next(new ApiError(404, "Order not found"));
    if (order.status === "refunded") return next(new ApiError(400, "Order has already been refunded"));

    let paypalOrder;
    try {
      paypalOrder = await paypalRequest("POST", `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {});
    } catch (captureError) {
      // A retry after the provider captured successfully can return an already-captured error.
      // Re-fetch the order and continue only if PayPal confirms COMPLETED.
      try {
        paypalOrder = await paypalRequest("GET", `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`);
      } catch {
        throw captureError;
      }
      if (paypalOrder?.status !== "COMPLETED") throw captureError;
    }

    if (paypalOrder?.status !== "COMPLETED") {
      return next(new ApiError(402, "PayPal has not confirmed a completed payment"));
    }

    const settings = getPayPalSettings();
    const purchaseUnits = Array.isArray(paypalOrder.purchase_units) ? paypalOrder.purchase_units : [];
    const purchaseUnit = purchaseUnits.find((item) => item.custom_id === payment._id.toString())
      || purchaseUnits.find((item) => item.reference_id === order._id.toString());
    if (!purchaseUnit) return next(new ApiError(400, "PayPal order does not match this purchase"));
    if (purchaseUnit.custom_id && purchaseUnit.custom_id !== payment._id.toString()) {
      return next(new ApiError(400, "PayPal payment reference does not match"));
    }
    if (purchaseUnit.reference_id && purchaseUnit.reference_id !== order._id.toString()) {
      return next(new ApiError(400, "PayPal order reference does not match"));
    }

    const capture = purchaseUnit.payments?.captures?.find((entry) => entry.status === "COMPLETED")
      || purchaseUnit.payments?.captures?.[0];
    const capturedAmount = capture?.amount || purchaseUnit.amount;
    const hasStoredGatewayAmount = payment.gatewayAmount !== null && payment.gatewayAmount !== undefined && Number.isFinite(Number(payment.gatewayAmount));
    const expectedGatewayAmount = hasStoredGatewayAmount
      ? Number(payment.gatewayAmount)
      : Number(getGatewayAmount(payment.amount, settings));
    if (!capturedAmount || capturedAmount.currency_code !== (payment.gatewayCurrency || settings.currency) || Math.round(Number(capturedAmount.value) * 100) !== Math.round(expectedGatewayAmount * 100)) {
      return next(new ApiError(400, "Captured amount or currency does not match the order"));
    }
    if (capture?.status && capture.status !== "COMPLETED") {
      return next(new ApiError(402, "PayPal has not confirmed a completed capture"));
    }

    const claimedPayment = await Payment.findOneAndUpdate(
      { _id: payment._id, status: "pending" },
      { $set: { status: "processing", gatewayTransactionId: capture?.id || null } },
      { new: true },
    );

    if (!claimedPayment) {
      const latest = await Payment.findById(payment._id);
      if (latest?.status === "success") {
        return res.status(200).json({ message: "Payment already completed", payment: latest, captureId: latest.gatewayTransactionId });
      }
      return res.status(202).json({ message: "Payment confirmation is being processed", payment: latest });
    }

    try {
      await fulfillOrder(claimedPayment.orderId);
      claimedPayment.status = "success";
      claimedPayment.fulfilledAt = new Date();
      await claimedPayment.save();
      return res.status(200).json({ message: "Payment completed and course enrollment activated", payment: claimedPayment, captureId: claimedPayment.gatewayTransactionId });
    } catch (error) {
      // The transaction in fulfillOrder rolls back its enrollment/wallet changes on failure.
      // Keeping this pending lets a retry re-check the completed PayPal order safely.
      claimedPayment.status = "pending";
      await claimedPayment.save();
      throw error;
    }
  } catch (error) {
    return next(error instanceof ApiError ? error : new ApiError(502, "Could not confirm the PayPal payment. Check its status in PayPal Sandbox and retry."));
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
    const payment = await Payment.findOne({ _id: req.params.id, userId: req.id }).select("_id status amount currency gatewayAmount gatewayCurrency orderId paymentMethod gatewayTransactionId");
    if (!payment) return next(new ApiError(404, "Payment not found"));
    return res.status(200).json({ payment });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

module.exports = {
  getPayPalConfig,
  createPayPalOrder,
  capturePayPalOrder,
  getPaymentHistory,
  getPaymentStatus,
  fulfillOrder,
};

const Payout = require("../modules/Payout");
const Wallet = require("../modules/Wallet");
const ApiError = require("../utils/ApiError");
const createPayout = async (req, res, next) => {
  try {
    const instructorId = req.id;
    const { amount } = req.body;
    const wallet = await Wallet.findOne({
      instructorId: instructorId,
    });
    if (!wallet) {
      throw new ApiError(404, "Wallet not found");
    }
    if (amount <= 0) {
      throw new ApiError(400, "Invalid amount");
    }
    if (amount > wallet.availableBalance) {
      throw new ApiError(400, "Insufficient balance");
    }
    const payout = await Payout.create({
      instructorId: instructorId,
      amount: amount,
      status: "pending",
    });
    res.status(201).json({
      message: "Payout request created",
      payout: payout,
    });
  } catch (error) {
    next(error);
  }
};
const getPayoutHistory = async (req, res, next) => {
  try {
    const instructorId = req.id;
    const payouts = await Payout.find({
      instructorId: instructorId,
    });
    res.status(200).json(payouts);
  } catch (error) {
    next(error);
  }
};
const updatePayout = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id);
    if (!payout) {
      throw new ApiError(404, "Payout not found");
    }
    const { status } = req.body;
    if (status !== "approved" && status !== "rejected" && status !== "paid") {
      throw new ApiError(400, "Invalid payout status");
    }
    payout.status = status;
    await payout.save();
    if (status === "paid") {
      const wallet = await Wallet.findOne({
        instructorId: payout.instructorId,
      });
      if (!wallet) {
        throw new ApiError(404, "Wallet not found");
      }
      wallet.availableBalance = wallet.availableBalance - payout.amount;
      await wallet.save();
    }
    res.status(200).json({
      message: "Payout updated",
      payout: payout,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { createPayout, getPayoutHistory, updatePayout};

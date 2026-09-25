const Payout = require("../modules/Payout");
const Wallet = require("../modules/Wallet");
const ApiError = require("../utils/ApiError");

const createPayout = async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) return next(new ApiError(400, "Invalid amount"));

    let wallet = await Wallet.findOne({ instructorId: req.id });
    if (!wallet) wallet = await Wallet.create({ instructorId: req.id, balance: 0, pendingPayout: 0 });

    if (amount > wallet.availableBalance) return next(new ApiError(400, "Insufficient available balance"));

    const payout = await Payout.create({ instructorId: req.id, amount, status: "pending" });
    wallet.pendingPayout += amount;
    await wallet.save();

    return res.status(201).json({ message: "Payout request created", payout, wallet });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const getPayoutHistory = async (req, res, next) => {
  try {
    const payouts = await Payout.find({ instructorId: req.id }).sort({ createdAt: -1 });
    return res.status(200).json({ count: payouts.length, data: payouts });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const updatePayout = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id);
    if (!payout) return next(new ApiError(404, "Payout not found"));

    const { status } = req.body;
    if (!["approved", "rejected", "paid"].includes(status)) return next(new ApiError(400, "Invalid payout status"));
    if (payout.status === "paid" || payout.status === "rejected") return next(new ApiError(400, "Payout has already been finalized"));
    if (status === "paid" && payout.status !== "approved") return next(new ApiError(400, "Payout must be approved before being paid"));

    const wallet = await Wallet.findOne({ instructorId: payout.instructorId });
    if (!wallet) return next(new ApiError(404, "Wallet not found"));

    if (status === "rejected") {
      wallet.pendingPayout = Math.max(0, wallet.pendingPayout - payout.amount);
    }

    if (status === "paid") {
      if (payout.amount > wallet.pendingPayout || payout.amount > wallet.balance) return next(new ApiError(400, "Insufficient wallet balance"));
      wallet.pendingPayout -= payout.amount;
      wallet.balance -= payout.amount;
    }

    payout.status = status;
    await wallet.save();
    await payout.save();

    return res.status(200).json({ message: "Payout updated", payout, wallet });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

module.exports = { createPayout, getPayoutHistory, updatePayout };

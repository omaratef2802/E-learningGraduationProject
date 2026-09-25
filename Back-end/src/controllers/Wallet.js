const Wallet = require("../modules/Wallet");
const ApiError = require("../utils/ApiError");

const getWallet = async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ instructorId: req.id });
    if (!wallet)
      wallet = await Wallet.create({
        instructorId: req.id,
        balance: 0,
        pendingPayout: 0,
      });
    return res.status(200).json({ wallet });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

module.exports = { getWallet };

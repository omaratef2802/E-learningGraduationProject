const Wallet = require("../modules/Wallet");
// const ApiError = require("../utils/ApiError");
const getWallet = async (req, res, next) => {
  try {
    const instructorId = req.id;
    let wallet = await Wallet.findOne({
      instructorId: instructorId,
    });
    if (!wallet) {
      wallet = await Wallet.create({
        instructorId: instructorId,
        holdingBalance: 0,
        availableBalance: 0,
      });
    }
    res.status(200).json(wallet);
  } catch (error) {
    next(error);
  }
};
module.exports = { getWallet };

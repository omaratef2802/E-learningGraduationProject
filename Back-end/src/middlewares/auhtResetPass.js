const ApiError = require("../utils/ApiError");
const jwt = require("jsonwebtoken");
const util = require("util");

const verifyResetToken = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) return next(new ApiError(401, "Reset token is required"));
    const decoded = await util.promisify(jwt.verify)(authorization, process.env.RESET_PASSWORD_SECRET);
    if (!decoded?.id) return next(new ApiError(401, "Invalid reset token"));
    req.id = decoded.id;
    req.resetVerified = Boolean(decoded.otpVerified);
    next();
  } catch (err) { return next(new ApiError(401, "Invalid or expired reset token")); }
};

const authResetVerified = (req, res, next) => {
  if (!req.resetVerified) return next(new ApiError(403, "OTP verification is required"));
  next();
};

module.exports = { authReset: verifyResetToken, authResetVerified };

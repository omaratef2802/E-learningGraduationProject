const jwt = require("jsonwebtoken");
const util = require("util");
const User = require("../modules/dbUsers");
const Admin = require("../modules/dbAdmin");
const ApiError = require("../utils/ApiError");

const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) return next(new ApiError(401, "You must login first"));

    const decoded = await util.promisify(jwt.verify)(authorization, process.env.SECRET);
    if (!decoded?.userId || !decoded?.role) return next(new ApiError(401, "Invalid authentication token"));

    const Model = decoded.role === "admin" ? Admin : User;
    const user = await Model.findById(decoded.userId).select("firstName lastName role isActive");
    if (!user) return next(new ApiError(401, "User not found"));
    if (user.isActive === false) return next(new ApiError(403, "Your account is inactive"));

    req.id = decoded.userId;
    req.role = decoded.role;
    req.fullname = decoded.fullname;
    next();
  } catch (err) {
    return next(new ApiError(401, "Invalid or expired authentication token"));
  }
};

function relasedTo(...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.role)) return next(new ApiError(403, "You are not allowed to perform this process"));
    next();
  };
}

module.exports = { auth, relasedTo };

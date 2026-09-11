const jwt = require("jsonwebtoken");
const util = require("util");
const ApiError = require("../utils/ApiError");
const auth = async (req, res, next) => {
  try {
    let { authorization } = req.headers;
    if (!authorization) {
      next(new ApiError(401, "you must login first"));
    }
    let decoded = await util.promisify(jwt.verify)(
      authorization,
      process.env.SECRET,
    );
    if (!decoded) {
      next(new ApiError(401, "you are not authenticated , try again"));
    }
    req.id = decoded.userId;
    req.role = decoded.role;
    req.fullname = decoded.fullname;
    next();
  } catch (err) {
    next(new ApiError(401, err.message));
  }
};

function relasedTo(...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.role)) {
      return next(new ApiError(401, "you don't allowed to this process"));
    }
    next();
  };
}

module.exports = { auth, relasedTo };

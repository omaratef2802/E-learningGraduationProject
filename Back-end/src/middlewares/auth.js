const jwt = require("jsonwebtoken");
const util = require("util");
const ApiError = require("../utils/ApiError");
const auth = async (req, res, next) => {
  try {
    let { authorization } = req.headers;
    if (!authorization) {
      return next(new ApiError(401, "you must login first"));
    }
    const token = authorization.startsWith("Bearer ")
      ? authorization.split(" ")[1]
      : authorization;
    let decoded = await util.promisify(jwt.verify)(
      token,
      process.env.SECRET,
    );
    if (!decoded) {
      return next(new ApiError(401, "you are not authenticated , try again"));
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

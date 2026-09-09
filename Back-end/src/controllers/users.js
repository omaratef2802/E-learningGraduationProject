const userModel = require("../modules/dbUsers");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const util = require("util");
const ApiError = require("../utils/ApiError");
const OTP = require("../modules/OTP");
const sendEmail = require("../utils/sendEmail");

const getAllUsers = async (req, res, next) => {
  try {
    let { page } = req.params;
    let num = page - 1;
    let users = await userModel.find().limit(1).skip(num);
    res.status(200).json({ message: "success", data: users });
  } catch (err) {
    next(new ApiError(404, err.message));
  }
};
const getUserById = async (req, res, next) => {
  try {
    let user = await userModel.findById(req.id);
    res.status(200).json({ message: "success", data: user });
  } catch (err) {
    next(new ApiError(404, err.message));
  }
};
const createUser = async (req, res, next) => {
  try {
    const newuser = req.body;
    const savedUser = await userModel.create(newuser);
    res.status(201).json({ message: "success", data: savedUser });
  } catch (err) {
    next(new ApiError(404, err.message));
  }
};
const deleteUser = async (req, res, next) => {
  try {
    await userModel.findByIdAndDelete(req.id);
    res.status(204).json({ message: "deleted" });
  } catch (err) {
    next(new ApiError(404, err.message));
  }
};
const updateUser = async (req, res, next) => {
  try {
    let updates = req.body;
    let updatedUser = await userModel.findByIdAndUpdate(req.id, updates, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ message: "success", data: updatedUser });
  } catch (err) {
    next(new ApiError(404, err.message));
  }
};
const updatePassword = async (req, res, next) => {
  try {
    let id = req.id;
    let { currentPassword, confirmPassord, newPassword } = req.body;
    if (!confirmPassord || !newPassword || !currentPassword) {
      next(
        new ApiError(
          404,
          "please provide confirm password and new password and currentPassword",
        ),
      );
    }
    const user = await userModel.findById(id);
    let validation = await bcrypt.compare(currentPassword, user.password);
    if (!validation) {
      next(new ApiError(400, "password isn't correct"));
    }
    if (confirmPassord != newPassword) {
      next(new ApiError(401, "confirm password doens't match the password"));
    }
    user.password = newPassword;
    await user.save();
    let tokens = jwt.sign(
      {
        userId: user._id,
        fullname: `${user.firstName} ${user.lastName}`,
        role: user.role,
      },
      process.env.SECRET,
    );
    res.status(200).json({ message: "success", data: tokens });
  } catch (err) {
    next(new ApiError(404, err.message));
  }
};
const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return next(new ApiError(404, "please provide password and email"));
    }
    let user = await userModel.findOne({ email });
    if (!user) {
      return next(new ApiError(404, "invalid email or password"));
    }
    let validtion = await bcrypt.compare(password, user.password);
    if (!validtion) {
      return next(new ApiError(403, "invalid email or password"));
    }
    let tokens = jwt.sign(
      {
        userId: user._id,
        fullname: `${user.firstName} ${user.lastName}`,
        role: user.role,
      },
      process.env.SECRET,
    );
    res.status(200).json({ message: "success", data: tokens });
  } catch (err) {
    next(new ApiError(404, err.message));
  }
};

const uploadImage = async (req, res, next) => {
  try {
    let user = await userModel.findById(req.id);
    user.img = "../uploads/" + req.id + ".jpg";
    await user.save();
    res.status(200).json({
      message: "Image uploaded successfully",
      data: req.file,
    });
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const user = req.user;
    const token = jwt.sign(
      {
        userId: user._id,
        fullname: `${user.firstName} ${user.lastName}`,
        role: user.role,
      },
      process.env.SECRET,
    );
    res.status(200).json({
      message: "Google login success",
      data: token,
    });
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

const forgetPassword = async (req, res, next) => {
  try {
    let { email } = req.body;
    if (!email) {
      return next(new ApiError(400, "provide me the email"));
    }
    let user = await userModel.findOne({ email });
    if (!user) {
      return next(new ApiError(404, "user not found"));
    }

    if (user.authProvider == "google") {
      return next(new ApiError(400, "this account uses google login"));
    }

    const otp = Math.floor(1000 + 9000 * Math.random()).toString();

    await OTP.deleteMany({
      userId: user._id,
    });

    await OTP.create({
      userId: user._id,
      otp: otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendEmail(
      email,
      "Password Reset OTP",
      `<h2>password reset</h2>
      <p>welcome ${user.firstName}</p>
      <p>your otp : </p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      `,
    );
    let token = jwt.sign(
      {
        id: user._id,
      },
      process.env.RESET_PASSWORD_SECRET,
      { expiresIn: "10m" },
    );

    res.status(200).json({
      message: "otp sent successfully",
      data: token,
    });
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { otp: userOtp } = req.body;
    if (!userOtp) {
      return next(new ApiError(401, "please provide me the otp"));
    }
    let { authorization } = req.headers;
    if (!authorization) {
      return next(new ApiError(401, "Please provide tokens"));
    }
    let decoded = await util.promisify(jwt.verify)(
      authorization,
      process.env.RESET_PASSWORD_SECRET,
    );
    if (!decoded) {
      return next(new ApiError(401, "the otp isn't correct"));
    }
    const otp = await OTP.findOne({ userId: decoded.id });
    if (!otp) {
      return next(new ApiError(404, "The otp not found or expired"));
    }
    if (otp.otpExpires < new Date()) {
      await OTP.deleteOne({
        _id: otp._id,
      });
      return next(new ApiError(400, "Otp has expired"));
    }
    const Valid = await bcrypt.compare(userOtp, otp.otp);

    if (!Valid) {
      return next(new ApiError(400, "Invalid otp "));
    }
    const resetToken = jwt.sign(
      { id: decoded.id, otpVerified: true },
      process.env.RESET_PASSWORD_SECRET,
      { expiresIn: "10m" },
    );
    res.status(200).json({ message: "success verify otp", data: resetToken });
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return next(new ApiError(401, "Please provide reset token"));
    }

    let decoded = await util.promisify(jwt.verify)(
      authorization,
      process.env.RESET_PASSWORD_SECRET,
    );

    if (!decoded.otpVerified) {
      return next(new ApiError(401, "please verify OTP first"));
    }

    let user = await userModel.findById(decoded.id);
    if (!user) {
      return next(new ApiError(404, "user not found"));
    }
    let { newPassword, confirmPassword } = req.body;
    if (!newPassword || !confirmPassword) {
      return next(
        new ApiError(
          401,
          "please provide me the confirm password and next password",
        ),
      );
    }
    if (newPassword != confirmPassword) {
      return next(
        new ApiError(401, "password and confirm password not match "),
      );
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({ message: "updated password" });
  } catch (err) {
    return next(new ApiError(404, err.message));
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
  updatePassword,
  login,
  uploadImage,
  googleLogin,
  verifyOtp,
  forgetPassword,
  changePassword,
};

const getAllUser = async (req, res, next) => {
  try {
    const { limit, skip } = req.query;
    const users = await userService.getAllUser(userModule, "student", limit, skip);

    return res.status(200).json({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

const userService = require("../services/users");
const userModule = require("../modules/dbUsers");

const getUserById = async (req, res, next) => {
  try { const user = await userService.getUserById(userModule, req.id); return res.status(200).json({ message: "User fetched successfully", data: user }); }
  catch (err) { next(err); }
};
const creatUser = async (req, res, next) => {
  try { const user = await userService.creatUser(userModule, req.body); return res.status(201).json({ message: "User created successfully", data: user }); }
  catch (err) { next(err); }
};
const updateUser = async (req, res, next) => {
  try { const user = await userService.updateUser(userModule, req.body, req.id); return res.status(200).json({ message: "User updated successfully", data: user }); }
  catch (err) { next(err); }
};
const updatePassword = async (req, res, next) => {
  try { const { currentPassword, confirmPassword, newPassword } = req.body; const token = await userService.updatePassword(userModule, req.id, currentPassword, confirmPassword, newPassword); return res.status(200).json({ message: "Password updated successfully", data: token }); }
  catch (err) { next(err); }
};
const login = async (req, res, next) => {
  try { const { email, password } = req.body; const token = await userService.login(userModule, email, password); return res.status(200).json({ message: "Login successfully", data: token }); }
  catch (err) { next(err); }
};
const uploadImage = async (req, res, next) => {
  try { const image = await userService.uploadImage(userModule, req.id, req.file); return res.status(200).json({ message: "Image uploaded successfully", data: { image } }); }
  catch (err) { next(err); }
};
const googleLogin = async (req, res, next) => {
  try { const token = await userService.googleLogin(req.user); return res.status(200).json({ message: "Google login successfully", data: token }); }
  catch (err) { next(err); }
};
const forgetPassword = async (req, res, next) => {
  try { const token = await userService.forgetPassword(userModule, req.body.email); return res.status(200).json({ message: "OTP sent successfully", data: token }); }
  catch (err) { next(err); }
};
const verifyOtp = async (req, res, next) => {
  try { const token = await userService.verifyOtp(req.body.otp, req.id); return res.status(200).json({ message: "OTP verified successfully", data: token }); }
  catch (err) { next(err); }
};
const changePassword = async (req, res, next) => {
  try { const result = await userService.changePassword(userModule, req.body.newPassword, req.body.confirmPassword, req.id); return res.status(200).json({ message: result }); }
  catch (err) { next(err); }
};
module.exports = { getAllUser, getUserById, creatUser, updateUser, updatePassword, login, uploadImage, googleLogin, forgetPassword, verifyOtp, changePassword };

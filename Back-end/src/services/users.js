const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/ApiError");
const OTP = require("../modules/OTP");
const sendEmail = require("../utils/sendEmail");
const cloudinary = require("../configs/cloudinary");
const Track = require("../modules/dbTrack");

const sanitizeUser = (user) => {
  const object = user.toObject ? user.toObject() : { ...user };
  delete object.password;
  delete object.googleId;
  return object;
};

const signToken = (user) => jwt.sign(
  { userId: user._id, fullname: `${user.firstName} ${user.lastName}`, role: user.role },
  process.env.SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
);

const getAllUser = async (dbModule, role, limit, skip) => {
  try {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safeSkip = Math.max(Number(skip) || 0, 0);
    const users = await dbModule.find({ role }).select("-password -googleId").limit(safeLimit).skip(safeSkip).sort({ createdAt: -1 });
    return users;
  } catch (err) { throw new ApiError(500, err.message); }
};

const getAllAdmin = async (dbModule, limit, skip) => {
  try {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safeSkip = Math.max(Number(skip) || 0, 0);
    return await dbModule.find().select("-password -googleId").limit(safeLimit).skip(safeSkip).sort({ createdAt: -1 });
  } catch (err) { throw new ApiError(500, err.message); }
};

const getUserById = async (dbModule, id) => {
  const user = await dbModule.findById(id).select("-password -googleId");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

const creatUser = async (dbModule, newUser) => {
  try {
    const { firstName, lastName, email, password, dateBirth, phone, role } = newUser;
    if (!firstName || !lastName || !email || !password) throw new ApiError(400, "First name, last name, email and password are required");
    if (role && !["student", "instructor"].includes(role)) throw new ApiError(400, "Invalid role");
    const user = await dbModule.create({ firstName, lastName, email, password, dateBirth, phone, role: role || "student", authProvider: "local" });
    return sanitizeUser(user);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err?.code === 11000) throw new ApiError(409, "Email or Google account already exists");
    throw new ApiError(400, err.message);
  }
};

const deleteUser = async (dbModule, id) => {
  const user = await dbModule.findByIdAndDelete(id);
  if (!user) throw new ApiError(404, "User not found");
  return "deleted";
};

const updateUser = async (dbModule, updates, id) => {
  try {
    const allowedFields = ["firstName", "lastName", "dateBirth", "phone", "bio", "trackId"];
    const filteredUpdates = {};
    for (const field of allowedFields) if (updates[field] !== undefined) filteredUpdates[field] = updates[field];
    if (filteredUpdates.trackId) {
      const track = await Track.findById(filteredUpdates.trackId).select("_id");
      if (!track) throw new ApiError(404, "Track not found");
    }
    const updatedUser = await dbModule.findByIdAndUpdate(id, filteredUpdates, { new: true, runValidators: true });
    if (!updatedUser) throw new ApiError(404, "User not found");
    return sanitizeUser(updatedUser);
  } catch (err) { throw err instanceof ApiError ? err : new ApiError(400, err.message); }
};

const updateAdmin = async (dbModule, updates, id) => {
  try {
    const allowedFields = ["firstName", "lastName", "dateBirth", "phone", "img"];
    const filteredUpdates = {};
    for (const field of allowedFields) if (updates[field] !== undefined) filteredUpdates[field] = updates[field];
    const admin = await dbModule.findByIdAndUpdate(id, filteredUpdates, { new: true, runValidators: true });
    if (!admin) throw new ApiError(404, "Admin not found");
    return sanitizeUser(admin);
  } catch (err) { throw err instanceof ApiError ? err : new ApiError(400, err.message); }
};

const updatePassword = async (dbModule, id, currentPassword, confirmPassword, newPassword) => {
  if (!currentPassword || !confirmPassword || !newPassword) throw new ApiError(400, "Please provide current password, new password and confirm password");
  if (newPassword !== confirmPassword) throw new ApiError(400, "Passwords do not match");
  const user = await dbModule.findById(id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.authProvider === "google") throw new ApiError(400, "Google accounts cannot change password here");
  if (!(await bcrypt.compare(currentPassword, user.password))) throw new ApiError(401, "Current password is incorrect");
  user.password = newPassword;
  await user.save();
  return signToken(user);
};

const login = async (dbModule, email, password) => {
  if (!email || !password) throw new ApiError(400, "Please provide email and password");
  const user = await dbModule.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) throw new ApiError(401, "Invalid email or password");
  if (user.isActive === false) throw new ApiError(403, "Your account is inactive");
  return signToken(user);
};

const uploadImage = async (dbModule, id, file) => {
  try {
    if (!file) throw new ApiError(400, "Please upload an image");
    const user = await dbModule.findById(id);
    if (!user) throw new ApiError(404, "User not found");
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: "e-learning/users", public_id: id, resource_type: "image" }, (error, value) => error ? reject(error) : resolve(value));
      stream.end(file.buffer);
    });
    user.img = result.secure_url;
    await user.save();
    return result.secure_url;
  } catch (err) { throw err instanceof ApiError ? err : new ApiError(400, err.message); }
};

const googleLogin = async (user) => {
  if (!user) throw new ApiError(401, "Google authentication failed");
  if (user.isActive === false) throw new ApiError(403, "Your account is inactive");
  return signToken(user);
};

const forgetPassword = async (dbModule, email) => {
  if (!email) throw new ApiError(400, "Provide the email");
  const user = await dbModule.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw new ApiError(404, "User not found");
  if (user.isActive === false) throw new ApiError(403, "Your account is inactive");
  if (user.authProvider === "google") throw new ApiError(400, "This account uses Google login");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await OTP.deleteMany({ userId: user._id });
  await OTP.create({ userId: user._id, otp, otpExpires: new Date(Date.now() + 10 * 60 * 1000) });
  await sendEmail(email, "Password Reset OTP", `<h2>Password reset</h2><p>Hello ${user.firstName}</p><h1>${otp}</h1><p>This OTP expires in 10 minutes.</p>`);
  return jwt.sign({ id: user._id, resetRequested: true }, process.env.RESET_PASSWORD_SECRET, { expiresIn: "10m" });
};

const verifyOtp = async (userOtp, id) => {
  if (!userOtp || !id) throw new ApiError(400, "OTP and reset token are required");
  const otp = await OTP.findOne({ userId: id });
  if (!otp) throw new ApiError(404, "OTP not found or expired");
  if (otp.otpExpires < new Date()) { await OTP.deleteOne({ _id: otp._id }); throw new ApiError(400, "OTP has expired"); }
  if (!(await bcrypt.compare(userOtp, otp.otp))) throw new ApiError(400, "Invalid OTP");
  await OTP.deleteOne({ _id: otp._id });
  return jwt.sign({ id, otpVerified: true }, process.env.RESET_PASSWORD_SECRET, { expiresIn: "10m" });
};

const changePassword = async (dbModule, newPassword, confirmPassword, id) => {
  if (!newPassword || !confirmPassword) throw new ApiError(400, "Please provide new password and confirm password");
  if (newPassword !== confirmPassword) throw new ApiError(400, "Password and confirm password do not match");
  const user = await dbModule.findById(id);
  if (!user) throw new ApiError(404, "User not found");
  user.password = newPassword;
  await user.save();
  return "Password updated successfully";
};

module.exports = { getAllUser, getAllAdmin, getUserById, creatUser, deleteUser, updateUser, updateAdmin, updatePassword, login, uploadImage, googleLogin, forgetPassword, verifyOtp, changePassword, sanitizeUser };

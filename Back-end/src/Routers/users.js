const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
  authReset,
  authResetVerified,
} = require("../middlewares/auhtResetPass");
const upload = require("../configs/multer");
const passport = require("../configs/passport");
const {
  getUserById,
  creatUser,
  updateUser,
  updatePassword,
  login,
  uploadImage,
  googleLogin,
  verifyOtp,
  changePassword,
  forgetPassword,
} = require("../controllers/users");

router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleLogin,
);
router.post("/signup", creatUser);
router.post("/login", login);
router.get("/profile/:id", auth, getUserById);
router.get("/myProfile", auth, getUserById);
router.patch("/profile", auth, updateUser);
router.post("/updatePassword", auth, updatePassword);
router.post("/profile/uploadImg", auth, upload.single("Img"), uploadImage);
router.post("/forgetPassword", forgetPassword);
router.post("/verifyOtp", authReset, verifyOtp);
router.post("/changePassword", authReset, authResetVerified, changePassword);
module.exports = router;

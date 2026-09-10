const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const upload = require("../configs/multer");
const passport = require("../configs/passport");

const {
  getAllUsers,
  getAllInstructor,
  getUserById,
  createUser,
  deleteUser,
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
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  googleLogin,
);

router.post("/signup", createUser);
router.post("/login", login);
router.get("/profile", auth, getUserById);
router.patch("/profile", auth, updateUser);
router.post("/updatePassowrd", auth, updatePassword);
router.post("/profile/uploadImg", auth, upload.any("file"), uploadImage);
router.post("/forgetPassword", forgetPassword);
router.post("/verifyOtp", verifyOtp);
router.post("/changePassword", changePassword);

// //                      admins & instructor

router.get(
  "/MyUser/:limit/:skip",
  auth,
  relasedTo("admin", "instructor"),
  getAllUsers,
);
router.get("/admin/:limit/:skip", auth, relasedTo("admin"), getAllInstructor);
router.delete("/:id", auth, relasedTo("admin"), deleteUser);

module.exports = router;

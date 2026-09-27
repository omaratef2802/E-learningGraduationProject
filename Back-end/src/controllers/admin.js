const userService = require("../services/users");
const userModule = require("../modules/dbUsers");
const adminModule = require("../modules/dbAdmin");
const Course = require("../modules/dbCourse");
const Enrollment = require("../modules/dbEnrollement");
const Review = require("../modules/dbReview");
const Certificate = require("../modules/dbCertificate");
const Order = require("../modules/Order");
const ProjectSubmission = require("../modules/dbProjectSumission");
const Project = require("../modules/dbProjects");
const ApiError = require("../utils/ApiError");

const getAllInstructor = async (req, res, next) => { try { const { limit, skip } = req.query; return res.status(200).json({ message: "success getting Instructor", data: await userService.getAllUser(userModule, "instructor", limit, skip) }); } catch (err) { next(err); } };
const getAllAdmin = async (req, res, next) => { try { const { limit, skip } = req.query; return res.status(200).json({ message: "Users fetched successfully", data: await userService.getAllAdmin(adminModule, limit, skip) }); } catch (err) { next(err); } };
const getAdminById = async (req, res, next) => { try { return res.status(200).json({ message: "Admin fetched successfully", data: await userService.getUserById(adminModule, req.params.id) }); } catch (err) { next(err); } };
const createAdmin = async (req, res, next) => { try { const user = await adminModule.create({ ...req.body, role: "admin", authProvider: "local" }); const safeUser = userService.sanitizeUser(user); return res.status(201).json({ message: "Admin created successfully", data: safeUser }); } catch (err) { next(err); } };
const updateAdmin = async (req, res, next) => { try { const user = await userService.updateAdmin(adminModule, req.body, req.id); return res.status(200).json({ message: "Admin updated successfully", data: user }); } catch (err) { next(err); } };
const updatePassword = async (req, res, next) => { try { const { currentPassword, confirmPassword, newPassword } = req.body; const token = await userService.updatePassword(adminModule, req.id, currentPassword, confirmPassword, newPassword); return res.status(200).json({ message: "Password updated successfully", data: token }); } catch (err) { next(err); } };
const login = async (req, res, next) => { try { const { email, password } = req.body; const token = await userService.login(adminModule, email, password); return res.status(200).json({ message: "Login successfully", data: token }); } catch (err) { next(err); } };
const uploadImage = async (req, res, next) => { try { const image = await userService.uploadImage(adminModule, req.id, req.file); return res.status(200).json({ message: "Image uploaded successfully", data: { image } }); } catch (err) { next(err); } };
const forgetPassword = async (req, res, next) => { try { const token = await userService.forgetPassword(adminModule, req.body.email); return res.status(200).json({ message: "OTP sent successfully", data: token }); } catch (err) { next(err); } };
const verifyOtp = async (req, res, next) => { try { const token = await userService.verifyOtp(req.body.otp, req.id); return res.status(200).json({ message: "OTP verified successfully", data: token }); } catch (err) { next(err); } };
const changePassword = async (req, res, next) => { try { const result = await userService.changePassword(adminModule, req.body.newPassword, req.body.confirmPassword, req.id); return res.status(200).json({ message: result }); } catch (err) { next(err); } };
const deleteUser = async (req, res, next) => {
  try {
    const user = await userModule.findById(req.params.id).select("role");
    if (!user) return next(new ApiError(404, "User not found"));

    if (user.role === "instructor") {
      const [courses, projects] = await Promise.all([
        Course.countDocuments({ instructorId: user._id }),
        Project.countDocuments({ instructorId: user._id }),
      ]);
      if (courses || projects) return next(new ApiError(409, "Instructor has related courses or projects. Deactivate the account instead."));
    }

    if (user.role === "student") {
      const [enrollments, orders, reviews, certificates, submissions] = await Promise.all([
        Enrollment.countDocuments({ studentId: user._id }),
        Order.countDocuments({ userId: user._id }),
        Review.countDocuments({ studentId: user._id }),
        Certificate.countDocuments({ student: user._id }),
        ProjectSubmission.countDocuments({ studentId: user._id }),
      ]);
      if (enrollments || orders || reviews || certificates || submissions) return next(new ApiError(409, "Student has learning or payment history. Deactivate the account instead."));
    }

    return res.status(200).json({ message: await userService.deleteUser(userModule, req.params.id) });
  } catch (err) { next(err); }
};
module.exports = { getAdminById, getAllAdmin, getAllInstructor, createAdmin, updateAdmin, updatePassword, login, uploadImage, forgetPassword, verifyOtp, changePassword, deleteUser };

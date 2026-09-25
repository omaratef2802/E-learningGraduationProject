const Course = require("../modules/dbCourse");
const User = require("../modules/dbUsers");
const Category = require("../modules/dbCategory");
const Track = require("../modules/dbTrack");
const Section = require("../modules/dbSection");
const Lesson = require("../modules/dbLesson");
const Quiz = require("../modules/dbQuizs");
const Enrollment = require("../modules/dbEnrollement");
const Review = require("../modules/dbReview");
const Order = require("../modules/Order");
const Cart = require("../modules/Cart");
const Wishlist = require("../modules/Wishlist");
const Project = require("../modules/dbProjects");
const Certificate = require("../modules/dbCertificate");
const cloudinary = require("../configs/cloudinary");
const ApiError = require("../utils/ApiError");

const validateCategoryAndTrack = async (categoryId, trackId) => {
  const category = await Category.findById(categoryId);
  if (!category) throw new ApiError(404, "Category not found");

  const track = await Track.findById(trackId);
  if (!track) throw new ApiError(404, "Track not found");
  if (track.categoryId.toString() !== category._id.toString()) {
    throw new ApiError(400, "Track does not belong to the selected category");
  }
};

const createCourse = async (req, res, next) => {
  try {
    const data = { ...req.body };
    delete data.instructorId;
    delete data.rating;
    delete data.status;

    const instructor = await User.findOne({ _id: req.id, role: "instructor", isActive: true });
    if (!instructor) return next(new ApiError(404, "Instructor not found"));
    if (!data.category || !data.track) return next(new ApiError(400, "Category and track are required"));
    await validateCategoryAndTrack(data.category, data.track);

    const existingCourse = await Course.findOne({ slug: data.slug });
    if (existingCourse) return next(new ApiError(409, "Course slug already exists"));

    const course = await Course.create({ ...data, instructorId: req.id, status: "draft" });
    return res.status(201).json({ success: true, message: "Course created successfully", data: course });
  } catch (error) {
    return next(error instanceof ApiError ? error : new ApiError(500, error.message));
  }
};

const getAllCourses = async (req, res, next) => {
  try {
    const filter = req.role === "instructor" ? { instructorId: req.id } : { status: "published" };
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);

    const courses = await Course.find(filter)
      .populate("instructorId", "firstName lastName email")
      .populate("category", "name slug")
      .populate("track", "title slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(filter);
    return res.status(200).json({ success: true, count: courses.length, total, skip, limit, hasMore: skip + courses.length < total, data: courses });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructorId", "firstName lastName email")
      .populate("category", "name slug")
      .populate("track", "title slug");

    if (!course) return next(new ApiError(404, "Course not found"));
    if (!req.role && course.status !== "published") return next(new ApiError(404, "Course not found"));
    if (req.role === "student" && course.status !== "published") return next(new ApiError(404, "Course not found"));
    if (req.role === "instructor" && course.instructorId?._id.toString() !== req.id.toString()) return next(new ApiError(403, "You are not allowed to access this course"));

    return res.status(200).json({ success: true, data: course });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const getCoursesByTrack = async (req, res, next) => {
  try {
    const courses = await Course.find({ track: req.params.trackId, status: "published" })
      .populate("instructorId", "firstName lastName")
      .populate("category", "name slug")
      .populate("track", "title slug")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

const getCoursesByCategory = async (req, res, next) => {
  try {
    const courses = await Course.find({ category: req.params.categoryId, status: "published" })
      .populate("instructorId", "firstName lastName")
      .populate("track", "title slug")
      .populate("category", "name slug")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

const updateCourse = async (req, res, next) => {
  try {
    const data = { ...req.body };
    delete data.instructorId;
    delete data.rating;
    delete data.status;

    const course = await Course.findById(req.params.id);
    if (!course) return next(new ApiError(404, "Course not found"));
    if (course.instructorId.toString() !== req.id.toString()) return next(new ApiError(403, "You are not allowed to update this course"));

    const categoryId = data.category || course.category;
    const trackId = data.track || course.track;
    await validateCategoryAndTrack(categoryId, trackId);

    if (data.slug && data.slug !== course.slug) {
      const existingCourse = await Course.findOne({ slug: data.slug, _id: { $ne: course._id } });
      if (existingCourse) return next(new ApiError(409, "Course slug already exists"));
    }

    Object.assign(course, data);
    await course.save();
    return res.status(200).json({ success: true, message: "Course updated successfully", data: course });
  } catch (error) { return next(error instanceof ApiError ? error : new ApiError(500, error.message)); }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(new ApiError(404, "Course not found"));
    if (course.instructorId.toString() !== req.id.toString()) return next(new ApiError(403, "You are not allowed to delete this course"));

    const [enrollmentCount, orderCount] = await Promise.all([
      Enrollment.countDocuments({ courseId: course._id }),
      Order.countDocuments({ "courses.courseId": course._id }),
    ]);

    if (enrollmentCount || orderCount) return next(new ApiError(409, "This course has purchase/enrollment history. Archive it instead of deleting it."));

    const lessons = await Lesson.find({ courseId: course._id }).select("_id videoPublicId quizId");
    const videoIds = lessons.map((lesson) => lesson.videoPublicId).filter(Boolean);
    for (const publicId of videoIds) {
      await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    }
    const quizIds = lessons.map((lesson) => lesson.quizId).filter(Boolean);

    await Promise.all([
      Quiz.deleteMany({ _id: { $in: quizIds } }),
      Lesson.deleteMany({ courseId: course._id }),
      Section.deleteMany({ courseId: course._id }),
      Review.deleteMany({ courseId: course._id }),
      Project.deleteMany({ courseId: course._id }),
      Certificate.deleteMany({ course: course._id }),
      Cart.updateMany({}, { $pull: { courses: { courseId: course._id } } }),
      Wishlist.updateMany({}, { $pull: { courses: course._id } }),
      Course.deleteOne({ _id: course._id }),
    ]);

    await Cart.updateMany({ }, [{ $set: { totalPrice: { $sum: "$courses.price" } } }]);
    return res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

const updateCourseStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["draft", "published", "archived"].includes(status)) return next(new ApiError(400, "Invalid course status"));

    const course = await Course.findById(req.params.id);
    if (!course) return next(new ApiError(404, "Course not found"));
    if (course.instructorId.toString() !== req.id.toString()) return next(new ApiError(403, "You are not allowed to change this course status"));

    if (status === "published") {
      const sections = await Section.countDocuments({ courseId: course._id });
      const lessons = await Lesson.countDocuments({ courseId: course._id });
      if (!sections || !lessons) return next(new ApiError(400, "Course must contain at least one section and one lesson before publishing"));
    }

    course.status = status;
    await course.save();
    return res.status(200).json({ message: "Course status updated successfully", data: course });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

module.exports = { createCourse, getAllCourses, getCourseById, getCoursesByTrack, getCoursesByCategory, updateCourse, updateCourseStatus, deleteCourse };

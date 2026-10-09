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

const createCourseByAdmin = async (req, res, next) => {
  try {
    const data = { ...req.body };
    const instructorId = data.instructorId;
    delete data.instructorId;
    delete data.rating;
    delete data.status;
    const instructor = await User.findOne({ _id: instructorId, role: "instructor", isActive: true });
    if (!instructor) return next(new ApiError(404, "Active instructor not found"));
    if (!data.category || !data.track) return next(new ApiError(400, "Category and track are required"));
    await validateCategoryAndTrack(data.category, data.track);
    if (await Course.findOne({ slug: data.slug })) return next(new ApiError(409, "Course slug already exists"));
    const course = await Course.create({ ...data, instructorId: instructor._id, status: "draft" });
    return res.status(201).json({ success: true, message: "Course created successfully", data: course });
  } catch (error) {
    return next(error instanceof ApiError ? error : new ApiError(500, error.message));
  }
};

const getAdminCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate("instructorId", "firstName lastName email img bio")
      .populate("category", "name slug")
      .populate("track", "title slug")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) { return next(new ApiError(500, error.message)); }
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

// Public: every published course taught by one instructor, so any visitor can
// open an instructor profile and browse their catalogue.
const getCoursesByInstructor = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructorId: req.params.instructorId, status: "published" })
      .populate("instructorId", "firstName lastName img bio")
      .populate("category", "name slug")
      .populate("track", "title slug")
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
    if (req.role !== "admin" && course.instructorId.toString() !== req.id.toString()) return next(new ApiError(403, "You are not allowed to delete this course"));

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

    await Promise.all([
      // courseId covers both lesson quizzes and section final quizzes.
      Quiz.deleteMany({ courseId: course._id }),
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

const Notification = require("../modules/dbNotification");
const Admin = require("../modules/dbAdmin");

// Which status transitions each side of the review workflow is allowed to make.
// Instructors submit drafts for review and pull them back; admins review them.
const INSTRUCTOR_TRANSITIONS = {
  draft: ["in_review"],
  changes_required: ["in_review"],
  in_review: ["draft"],
};

const ADMIN_TRANSITIONS = {
  in_review: ["published", "changes_required", "draft"],
  changes_required: ["in_review", "archived"],
  draft: ["archived"],
  published: ["archived"],
  archived: ["draft"],
};

const updateCourseStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "draft",
      "in_review",
      "changes_required",
      "published",
      "archived",
    ];

    if (!validStatuses.includes(status)) return next(new ApiError(400, "Invalid course status"));

    const course = await Course.findById(req.params.id);
    if (!course) return next(new ApiError(404, "Course not found"));
    if (course.instructorId.toString() !== req.id.toString()) return next(new ApiError(403, "You are not allowed to change this course status"));

    const allowed = INSTRUCTOR_TRANSITIONS[course.status] ?? [];
    if (!allowed.includes(status)) {
      return next(new ApiError(400, `A course in "${course.status}" cannot be changed to "${status}"`));
    }

    // A course must have at least one section and one lesson before it can be
    // sent to review, matching what the admin checks when approving it.
    if (status === "in_review") {
      const sections = await Section.countDocuments({ courseId: course._id });
      const lessons = await Lesson.countDocuments({ courseId: course._id });
      if (!sections || !lessons) return next(new ApiError(400, "Course must contain at least one section and one lesson before submitting for review"));
    }

    course.status = status;
    course.reviewMessage = null;
    course.submittedForReviewAt = status === "in_review" ? new Date() : null;

    if (status === "in_review") {
      const instructor = await User.findById(req.id).select("firstName lastName");
      const instructorName = `${instructor?.firstName ?? ""} ${instructor?.lastName ?? ""}`.trim();

      // Notifications are per-recipient, so fan the submission out to every
      // active admin account.
      const admins = await Admin.find({ isActive: true }).select("_id");

      await Notification.insertMany(
        admins.map((admin) => ({
          to: admin._id,
          from: instructorName || "Instructor",
          subject: "New course under review",
          message: `${instructorName || "An instructor"} submitted "${course.title}" for review.`,
          type: "course",
          isRead: false,
        })),
      );
    }

    await course.save();
    return res.status(200).json({ message: "Course status updated successfully", data: course });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

/** Courses waiting on an admin decision, used by the admin review queue. */
const getCoursesForReview = async (req, res, next) => {
  try {
    const courses = await Course.find({ status: "in_review" })
      .populate("instructorId", "firstName lastName email")
      .populate("category", "name slug")
      .populate("track", "title slug")
      .sort({ submittedForReviewAt: -1 });

    return res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

/**
 * Admin-side review decision: approve a course (publish it) or send it back
 * with changes, which is what the instructor sees as "changes required".
 */
const reviewCourse = async (req, res, next) => {
  try {
    const { decision, message } = req.body;

    if (!["approve", "request_changes"].includes(decision)) {
      return next(new ApiError(400, "Decision must be approve or request_changes"));
    }

    const course = await Course.findById(req.params.id);
    if (!course) return next(new ApiError(404, "Course not found"));

    if (course.status !== "in_review") {
      return next(new ApiError(409, "Only courses under review can be reviewed"));
    }

    const allowed = ADMIN_TRANSITIONS[course.status] ?? [];
    const nextStatus = decision === "approve" ? "published" : "changes_required";

    if (!allowed.includes(nextStatus)) {
      return next(new ApiError(400, `Cannot move this course to "${nextStatus}"`));
    }

    if (decision === "approve") {
      const sections = await Section.countDocuments({ courseId: course._id });
      const lessons = await Lesson.countDocuments({ courseId: course._id });
      if (!sections || !lessons) return next(new ApiError(400, "Course must contain at least one section and one lesson before publishing"));
    }

    if (decision === "request_changes" && !message?.trim()) {
      return next(new ApiError(400, "A message is required when requesting changes"));
    }

    course.status = nextStatus;
    course.reviewMessage = decision === "request_changes" ? message.trim() : null;
    course.submittedForReviewAt = null;

    await course.save();

    await Notification.create({
      to: course.instructorId,
      from: "Admin",
      subject: decision === "approve" ? "Course approved" : "Course needs changes",
      message:
        decision === "approve"
          ? `Your course "${course.title}" was approved and is now published.`
          : `Your course "${course.title}" needs changes: ${message.trim()}`,
      type: "course",
      isRead: false,
    });

    return res.status(200).json({ message: decision === "approve" ? "Course approved and published" : "Changes requested", data: course });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

module.exports = { createCourse, createCourseByAdmin, getAdminCourses, getAllCourses, getCourseById, getCoursesByTrack, getCoursesByCategory, getCoursesByInstructor, updateCourse, updateCourseStatus, reviewCourse, deleteCourse, getCoursesForReview };

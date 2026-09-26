const Order = require("../modules/Order");
const Cart = require("../modules/Cart");
const Course = require("../modules/dbCourse");
const Enrollment = require("../modules/dbEnrollement");
const ApiError = require("../utils/ApiError");

const createOrderFromCourseIds = async (userId, courseIds) => {
  const uniqueIds = [...new Set(courseIds.map(String))];
  if (!uniqueIds.length) throw new ApiError(400, "No courses selected");

  const courses = await Course.find({
    _id: { $in: uniqueIds },
    status: "published",
  });

  if (courses.length !== uniqueIds.length) {
    throw new ApiError(400, "One or more courses are not available");
  }

  const enrolled = await Enrollment.find({
    studentId: userId,
    courseId: { $in: uniqueIds },
  }).select("courseId");

  if (enrolled.length) {
    const ids = new Set(enrolled.map((item) => item.courseId.toString()));
    const titles = courses
      .filter((course) => ids.has(course._id.toString()))
      .map((course) => course.title);
    throw new ApiError(409, `Already enrolled in: ${titles.join(", ")}`);
  }

  const orderCourses = uniqueIds.map((id) => {
    const course = courses.find((item) => item._id.toString() === id);
    return { courseId: course._id, price: course.price };
  });

  const totalPrice = orderCourses.reduce((sum, item) => sum + item.price, 0);

  return Order.create({
    userId,
    courses: orderCourses,
    totalPrice,
    status: "pending",
  });
};

const createOrder = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.id });
    if (!cart || cart.courses.length === 0)
      return next(new ApiError(400, "Cart is empty"));

    const order = await createOrderFromCourseIds(
      req.id,
      cart.courses.map((item) => item.courseId),
    );
    cart.courses = [];
    cart.totalPrice = 0;
    await cart.save();

    return res.status(201).json({ message: "Order created", order });
  } catch (error) {
    return next(
      error instanceof ApiError ? error : new ApiError(500, error.message),
    );
  }
};

const buyNow = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return next(new ApiError(400, "courseId is required"));
    const order = await createOrderFromCourseIds(req.id, [courseId]);
    return res.status(201).json({ message: "Order created", order });
  } catch (error) {
    return next(
      error instanceof ApiError ? error : new ApiError(500, error.message),
    );
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.id })
      .populate("courses.courseId", "title image slug price instructorId")
      .sort({ createdAt: -1 });
    return res.status(200).json({ count: orders.length, data: orders });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.id,
    }).populate("courses.courseId", "title image slug price instructorId");
    if (!order) return next(new ApiError(404, "Order not found"));
    return res.status(200).json({ data: order });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

module.exports = { createOrder, buyNow, getOrders, getOrderById };

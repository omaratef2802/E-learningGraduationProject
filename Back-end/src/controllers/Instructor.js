const Course = require("../modules/dbCourse");
const Order = require("../modules/Order");
const User = require("../modules/dbUsers");
const ApiError = require("../utils/ApiError");

const getInstructorStudents = async (req, res, next) => {
  try {
    const instructorId = req.id;

    // Find all courses belonging to this instructor
    const courses = await Course.find({ instructorId }).select("_id title");

    if (!courses || courses.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const courseMap = new Map();
    const courseIds = courses.map((course) => {
      courseMap.set(course._id.toString(), course.title);
      return course._id;
    });

    // Find paid orders containing any course taught by this instructor
    const orders = await Order.find({
      status: "paid",
      "courses.courseId": { $in: courseIds }
    }).populate("userId", "firstName lastName email img level createdAt");

    const studentMap = new Map();

    orders.forEach((order) => {
      const student = order.userId;
      if (!student) return;

      order.courses.forEach((item) => {
        const courseIdStr = item.courseId.toString();
        if (courseMap.has(courseIdStr)) {
          const key = `${student._id}_${courseIdStr}`;
          if (!studentMap.has(key)) {
            const courseTitle = courseMap.get(courseIdStr);
            const enrolledDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })
              : "N/A";

            studentMap.set(key, {
              id: key,
              studentId: student._id,
              name: `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Unknown Student",
              email: student.email || "",
              avatarUrl:
                student.img ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
              courseTitle: courseTitle,
              progressPercent: 0,
              status: "Active",
              enrolledDate: enrolledDate,
              completedLessons: 0,
              totalLessons: 0,
              examsPassed: 0,
              totalExams: 0,
              finalAssessmentStatus: "Not Started"
            });
          }
        }
      });
    });

    const studentList = Array.from(studentMap.values());

    res.status(200).json({
      success: true,
      count: studentList.length,
      data: studentList
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

module.exports = {
  getInstructorStudents
};

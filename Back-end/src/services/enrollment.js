const Enrollment = require("../modules/dbEnrollement");
const Course = require("../modules/dbCourse");
const ApiError = require("../utils/ApiError");

const createEnrollmentForPayment = async (studentId, courseId) => {
  const course = await Course.findOne({ _id: courseId, status: "published" });
  if (!course) throw new ApiError(404, "Course not found or not published");

  let enrollment = await Enrollment.findOne({ studentId, courseId });
  if (enrollment) return { enrollment, created: false };

  try {
    enrollment = await Enrollment.create({ studentId, courseId });
    return { enrollment, created: true };
  } catch (error) {
    if (error?.code === 11000) {
      enrollment = await Enrollment.findOne({ studentId, courseId });
      return { enrollment, created: false };
    }
    throw error;
  }
};

module.exports = { createEnrollmentForPayment };

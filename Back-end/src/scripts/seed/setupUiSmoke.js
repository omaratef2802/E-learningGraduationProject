 /**
 * Creates (or reuses) a student with a known password and enrolls them in a
 * published course, then prints the credentials so a browser session can log in.
 *
 * Run with:  node src/scripts/seed/setupUiSmoke.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../../modules/dbUsers");
const Course = require("../../modules/dbCourse");
const Enrollment = require("../../modules/dbEnrollement");

const EMAIL = "ui.smoke@test.local";
const PASSWORD = "UiSmoke123!";

(async () => {
  await mongoose.connect(process.env.URL_MONGO);

  const course = await Course.findOne({ status: "published" });
  if (!course) throw new Error("No published course found.");

  let student = await User.findOne({ email: EMAIL });
  const hashed = await bcrypt.hash(PASSWORD, 10);
  if (!student) {
    student = await User.create({
      firstName: "Student",
      lastName: "Smoke",
      email: EMAIL,
      password: hashed,
      role: "student",
      isActive: true,
    });
  } else {
    student.password = hashed;
    student.isActive = true;
    await student.save();
  }

  await Enrollment.deleteOne({ studentId: student._id, courseId: course._id });
  await Enrollment.create({ studentId: student._id, courseId: course._id, completedLessons: [], progress: 0, status: "not-started" });

  console.log(JSON.stringify({ email: EMAIL, password: PASSWORD, courseId: String(course._id), courseTitle: course.title }, null, 2));
  await mongoose.disconnect();
})().catch(async (error) => {
  console.error("SETUP FAILED:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

const Course = require("../modules/dbCourse");

const createCourse = async (req, res) => {
  try {
    const data = { ...req.body };

    // Instructor creates a course for himself
    if (req.role === "instructor") {
      data.instructorId = req.id;
    }

    // Admin can choose the instructor
    if (req.role === "admin" && !data.instructorId) {
      return res.status(400).json({
        success: false,
        message: "Instructor is required",
      });
    }

    const course = await Course.create(data);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    let filter = {};

    // Instructor sees only his own courses
    if (req.role === "instructor") {
      filter.instructorId = req.id;
    }

    // Admin sees all courses
    const courses = await Course.find(filter)
      .populate("instructorId", "firstName lastName email")
      .populate("category", "name slug")
      .populate("track", "title slug");

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructorId", "firstName lastName email")
      .populate("category", "name slug")
      .populate("track", "title slug");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCoursesByTrack = async (req, res) => {
  try {
    const courses = await Course.find({
      track: req.params.trackId,
      status: "published",
    })
      .populate("instructorId", "firstName lastName")
      .populate("category", "name")
      .populate("track", "title");

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCoursesByCategory = async (req, res) => {
  try {
    const courses = await Course.find({
      category: req.params.categoryId,
      status: "published",
    })
      .populate("instructorId", "firstName lastName")
      .populate("track", "title");

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Instructor can update only his own course
    if (
      req.role === "instructor" &&
      course.instructorId.toString() !== req.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own courses",
      });
    }

    const updates = { ...req.body };

    // Instructor cannot change the course owner
    if (req.role === "instructor") {
      updates.instructorId = req.id;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("instructorId", "firstName lastName email")
      .populate("category", "name slug")
      .populate("track", "title slug");

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Instructor can delete only his own course
    if (
      req.role === "instructor" &&
      course.instructorId.toString() !== req.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own courses",
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  getCoursesByTrack,
  getCoursesByCategory,
  updateCourse,
  deleteCourse,
};

const Course = require("../modules/dbCourse");

// Create Course
const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);

    res.status(201).json({
      message: "Course created successfully",
      course
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Get All Courses
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructorId", "name email")
      .populate("category", "name")
      .populate("track", "title");

    res.status(200).json({
      courses
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Get Courses By Track
const getCoursesByTrack = async (req, res) => {
  try {
    const courses = await Course.find({
      track: req.params.trackId
    })
      .populate("instructorId", "name email")
      .populate("category", "name")
      .populate("track", "title");

    res.status(200).json({
      courses
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Get Courses By Category
const getCoursesByCategory = async (req, res) => {
  try {
    const courses = await Course.find({
      category: req.params.categoryId
    })
      .populate("instructorId", "name email")
      .populate("category", "name")
      .populate("track", "title");

    res.status(200).json({
      courses
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Get Course By ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructorId", "name email")
      .populate("category", "name")
      .populate("track", "title");

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    res.status(200).json({
      course
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Update Course
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    res.status(200).json({
      message: "Course updated successfully",
      course
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Delete Course
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    res.status(200).json({
      message: "Course deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


module.exports = {
  createCourse,
  getCourses,
  getCoursesByTrack,
  getCoursesByCategory,
  getCourseById,
  updateCourse,
  deleteCourse
};
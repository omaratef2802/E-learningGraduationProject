const Project = require("../modules/dbProjects");
const Course = require("../modules/dbCourse");
const Lesson = require("../modules/dbLesson");
const Enrollment = require("../modules/dbEnrollement");
const ProjectSubmission = require("../modules/dbProjectSumission");
const ApiError = require("../utils/ApiError");

const createProject = async (req, res, next) => {
  try {
    const instructorId = req.id;
    const {
      title,
      description,
      courseId,
      lessonId,
      deadline,
      maxScore,
      requirements,
      attachmentUrl,
      isPublished,
    } = req.body;

    if (!title || !description || !courseId) {
      return next(
        new ApiError(
          400,
          "Project title, description, and course are required",
        ),
      );
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return next(new ApiError(404, "Course not found"));
    }

    if (course.instructorId.toString() !== instructorId.toString()) {
      return next(
        new ApiError(
          403,
          "You are not allowed to create a project for this course",
        ),
      );
    }

    if (lessonId) {
      const lesson = await Lesson.findOne({
        _id: lessonId,
        courseId,
      });

      if (!lesson) {
        return next(
          new ApiError(
            404,
            "Lesson not found or does not belong to this course",
          ),
        );
      }
    }

    const project = await Project.create({
      title,
      description,
      courseId,
      lessonId: lessonId || null,
      instructorId,
      deadline: deadline || null,
      maxScore: maxScore || 100,
      requirements: requirements || [],
      attachmentUrl: attachmentUrl || null,
      isPublished: isPublished ?? false,
    });

    return res.status(201).json({
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const getProjects = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    const filter = {};

    if (courseId) {
      filter.courseId = courseId;
    }

    if (req.role === "student") {
      const enrollments = await Enrollment.find({
        studentId: req.id,
      }).select("courseId");

      const enrolledCourseIds = enrollments.map(
        (enrollment) => enrollment.courseId,
      );

      filter.courseId = courseId ? courseId : { $in: enrolledCourseIds };

      filter.isPublished = true;
    }

    if (req.role === "instructor") {
      filter.instructorId = req.id;
    }

    const projects = await Project.find(filter)
      .populate("courseId", "title")
      .populate("lessonId", "title")
      .populate("instructorId", "firstName lastName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "success",
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("courseId", "title")
      .populate("lessonId", "title")
      .populate("instructorId", "firstName lastName");

    if (!project) {
      return next(new ApiError(404, "Project not found"));
    }

    if (req.role === "student") {
      if (!project.isPublished) {
        return next(new ApiError(404, "Project not found"));
      }

      const enrollment = await Enrollment.findOne({
        studentId: req.id,
        courseId: project.courseId._id,
      });

      if (!enrollment) {
        return next(new ApiError(403, "You are not enrolled in this course"));
      }
    }

    if (req.role === "instructor") {
      if (project.instructorId._id.toString() !== req.id.toString()) {
        return next(
          new ApiError(403, "You are not allowed to access this project"),
        );
      }
    }

    return res.status(200).json({
      message: "success",
      data: project,
    });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const updateProject = async (req, res, next) => {
  try {
    const instructorId = req.id;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return next(new ApiError(404, "Project not found"));
    }

    if (project.instructorId.toString() !== instructorId.toString()) {
      return next(
        new ApiError(403, "You are not allowed to update this project"),
      );
    }

    const {
      title,
      description,
      lessonId,
      deadline,
      maxScore,
      requirements,
      attachmentUrl,
      isPublished,
    } = req.body;

    if (lessonId !== undefined) {
      if (lessonId === null) {
        project.lessonId = null;
      } else {
        const lesson = await Lesson.findOne({
          _id: lessonId,
          courseId: project.courseId,
        });

        if (!lesson) {
          return next(
            new ApiError(
              404,
              "Lesson not found or does not belong to this course",
            ),
          );
        }

        project.lessonId = lessonId;
      }
    }

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (deadline !== undefined) project.deadline = deadline;
    if (maxScore !== undefined) project.maxScore = maxScore;
    if (requirements !== undefined) project.requirements = requirements;
    if (attachmentUrl !== undefined) project.attachmentUrl = attachmentUrl;
    if (isPublished !== undefined) project.isPublished = isPublished;

    await project.save();

    return res.status(200).json({
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const instructorId = req.id;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return next(new ApiError(404, "Project not found"));
    }

    if (project.instructorId.toString() !== instructorId.toString()) {
      return next(
        new ApiError(403, "You are not allowed to delete this project"),
      );
    }

    await Project.findByIdAndDelete(projectId);
    await ProjectSubmission.deleteMany({ projectId });

    return res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};

const Project = require("../modules/dbProjects");
const Course = require("../modules/dbCourse");
const User = require("../modules/dbUsers");
const { generateCertificateForStudent } = require("./Certificate");

// Instructor or admin assigns a project to a student
exports.createProject = async (req, res) => {
  try {
    const {
      studentId,
      courseId,
      projectDescription,
      deadline,
    } = req.body;

    const instructorId = req.id;

    if (!studentId || !courseId || !projectDescription || !deadline) {
      return res.status(400).json({
        success: false,
        message:
          "studentId, courseId, projectDescription, and deadline are required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (
      req.role === "instructor" &&
      course.instructorId.toString() !== instructorId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only assign projects for your own courses",
      });
    }

    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const project = await Project.create({
      student: studentId,
      course: courseId,
      projectDescription,
      deadline,
      status: "Assigned",
      submissionDate: null,
    });

    return res.status(201).json({
      success: true,
      message: "Project assigned successfully",
      data: project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Student submits an assigned project
exports.submitProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const {
      projectDescription,
      githubRepo,
      liveDemo,
      screenshots,
    } = req.body;

    const studentId = req.id;

    if (!projectDescription || !githubRepo) {
      return res.status(400).json({
        success: false,
        message: "projectDescription and githubRepo are required",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.student.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: "You can only submit your own projects",
      });
    }

    if (
      project.status !== "Assigned" &&
      project.status !== "Request Changes"
    ) {
      return res.status(400).json({
        success: false,
        message: "This project cannot be submitted in its current status",
      });
    }

    if (new Date() > project.deadline) {
      return res.status(400).json({
        success: false,
        message: "Project deadline has passed",
      });
    }

    project.projectDescription = projectDescription;
    project.githubRepo = githubRepo;
    project.liveDemo = liveDemo || null;
    project.screenshots = screenshots || [];
    project.submissionDate = new Date();
    project.status = "Submitted";

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Project submitted successfully",
      data: project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Student views their projects
exports.getMyProjects = async (req, res) => {
  try {
    const studentId = req.id;

    const projects = await Project.find({
      student: studentId,
    })
      .populate("course", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a project by ID
exports.getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("student", "firstName lastName email")
      .populate("course", "title instructorId");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Instructor views projects waiting for review
exports.getPendingProjects = async (req, res) => {
  try {
    const instructorId = req.id;

    const projects = await Project.find({
      status: {
        $in: ["Submitted", "Under Review"],
      },
    })
      .populate("student", "firstName lastName email")
      .populate("course", "title instructorId");

    const instructorProjects = projects.filter(
      (project) =>
        project.course &&
        project.course.instructorId &&
        project.course.instructorId.toString() === instructorId
    );

    return res.status(200).json({
      success: true,
      count: instructorProjects.length,
      data: instructorProjects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Instructor reviews a project
exports.reviewProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { score, comment, status } = req.body;

    const instructorId = req.id;

    const validStatuses = [
      "Under Review",
      "Approved",
      "Rejected",
      "Request Changes",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project status",
      });
    }

    if (
      score !== undefined &&
      (score < 0 || score > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 0 and 100",
      });
    }

    const project = await Project.findById(projectId).populate(
      "course",
      "title instructorId"
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!project.course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (
      project.course.instructorId.toString() !== instructorId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only review projects from your own courses",
      });
    }

    project.status = status;

    project.instructorFeedback = {
      score: score ?? null,
      comment: comment ?? null,
      reviewedBy: instructorId,
      reviewedAt: new Date(),
    };

    await project.save();

    if (status === "Approved") {
      await generateCertificateForStudent(
        project.student,
        project.course._id
      );
    }

    return res.status(200).json({
      success: true,
      message: `Project status updated to ${status}`,
      data: project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const ProjectSubmission = require("../modules/dbProjectSumission");
const Project = require("../modules/dbProjects");
const Enrollment = require("../modules/dbEnrollement");
const ApiError = require("../utils/ApiError");

const submitProject = async (req, res, next) => {
  try {
    const studentId = req.id;
    const { projectId, submissionUrl, submissionFile, comment } = req.body;
    if (!projectId) {
      return next(new ApiError(400, "Project is required"));
    }
    if (!submissionUrl && !submissionFile) {
      return next(
        new ApiError(400, "Submission URL or submission file is required"),
      );
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return next(new ApiError(404, "Project not found"));
    }

    if (!project.isPublished) {
      return next(new ApiError(400, "Project is not available"));
    }

    const enrollment = await Enrollment.findOne({
      studentId,
      courseId: project.courseId,
    });

    if (!enrollment) {
      return next(new ApiError(403, "You are not enrolled in this course"));
    }

    const existingSubmission = await ProjectSubmission.findOne({
      projectId,
      studentId,
    });

    if (existingSubmission) {
      return next(new ApiError(400, "You have already submitted this project"));
    }

    let status = "submitted";

    if (project.deadline && new Date() > new Date(project.deadline)) {
      status = "late";
    }

    const submission = await ProjectSubmission.create({
      projectId,
      studentId,
      courseId: project.courseId,
      submissionUrl: submissionUrl || null,
      submissionFile: submissionFile || null,
      comment: comment || null,
      status,
      submittedAt: new Date(),
    });

    return res.status(201).json({
      message: "Project submitted successfully",
      data: submission,
    });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const getMyProjectSubmissions = async (req, res, next) => {
  try {
    const studentId = req.id;

    const submissions = await ProjectSubmission.find({
      studentId,
    })
      .populate("projectId")
      .populate("courseId", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "success",
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const getMyProjectSubmissionById = async (req, res, next) => {
  try {
    const studentId = req.id;
    const { submissionId } = req.params;

    const submission = await ProjectSubmission.findOne({
      _id: submissionId,
      studentId,
    })
      .populate("projectId")
      .populate("courseId", "title");

    if (!submission) {
      return next(new ApiError(404, "Project submission not found"));
    }

    return res.status(200).json({
      message: "success",
      data: submission,
    });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const getProjectSubmissions = async (req, res, next) => {
  try {
    const instructorId = req.id;
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      instructorId,
    });

    if (!project) {
      return next(
        new ApiError(
          404,
          "Project not found or you are not the project instructor",
        ),
      );
    }

    const submissions = await ProjectSubmission.find({
      projectId,
    })
      .populate("studentId", "firstName lastName email")
      .populate("projectId", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "success",
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const gradeProjectSubmission = async (req, res, next) => {
  try {
    const instructorId = req.id;
    const { submissionId } = req.params;
    const { score, feedback } = req.body;

    if (score === undefined || score === null) {
      return next(new ApiError(400, "Score is required"));
    }

    const submission =
      await ProjectSubmission.findById(submissionId).populate("projectId");

    if (!submission) {
      return next(new ApiError(404, "Project submission not found"));
    }

    const project = await Project.findOne({
      _id: submission.projectId._id,
      instructorId,
    });

    if (!project) {
      return next(
        new ApiError(403, "You are not allowed to grade this submission"),
      );
    }

    if (score < 0 || score > project.maxScore) {
      return next(
        new ApiError(400, `Score must be between 0 and ${project.maxScore}`),
      );
    }

    submission.score = score;
    submission.feedback = feedback || null;
    submission.status = "graded";
    submission.gradedAt = new Date();

    await submission.save();

    return res.status(200).json({
      message: "Project submission graded successfully",
      data: submission,
    });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

module.exports = {
  submitProject,
  getMyProjectSubmissions,
  getMyProjectSubmissionById,
  getProjectSubmissions,
  gradeProjectSubmission,
};

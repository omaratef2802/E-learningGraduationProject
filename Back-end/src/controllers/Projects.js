const Project = require("../modules/dbProjects");
const User = require("./users");
const { generateCertificate } = require("./Certificate"); 
exports.submitProject = async (req, res) => {
  try {
    const { projectId } = req.params; 
    const { courseId, projectDescription, githubRepo, liveDemo, screenshots } = req.body;
    const studentId = req.id;

    if (!courseId || !projectDescription || !githubRepo) {
      return res.status(400).json({
        success: false,
        message: "courseId, projectDescription, and githubRepo are required",
      });
    }

    const project = await Project.create({
      student: studentId,
      course: courseId,
      projectDescription,
      githubRepo,
      liveDemo,
      screenshots: screenshots || [],
      status: "Submitted",
    });

    return res.status(201).json({
      success: true,
      message: "Project submitted successfully and waiting for review.",
      data: project,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
exports.getMyProjects = async (req, res) => {
  try {
    const studentId = req.id;
    const projects = await Project.find({ student: studentId }).populate("course", "title");

    return res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
exports.getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("course", "title");
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
exports.getPendingProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: { $in: ['Submitted', 'Under Review'] } })
      .populate("student", "firstName lastName email")
      .populate("course", "title");

    return res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
exports.reviewProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { score, comment, status, skillsAwarded } = req.body;
    const instructorId = req.id;

    const validStatuses = ["Approved", "Rejected", "Request Changes"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid project status." });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    project.status = status;
    project.instructorFeedback = {
      score: score ?? null,
      comment: comment ?? null,
      reviewedBy: instructorId,
      reviewedAt: new Date(),
    };

    if (skillsAwarded) {
      project.skillsAwarded = skillsAwarded;
    }

    await project.save();
    if (status === "Approved") {
      if (project.skillsAwarded && project.skillsAwarded.length > 0) {
        await User.findByIdAndUpdate(project.student, {
          $addToSet: { verifiedSkills: { $each: project.skillsAwarded } }
        });
      }
      await generateCertificate(project.student, project.course);
    }

    return res.status(200).json({
      success: true,
      message: `Project status updated to ${status}.`,
      data: project,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
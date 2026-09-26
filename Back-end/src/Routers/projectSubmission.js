const express = require("express");
const router = express.Router();

const { auth, relasedTo } = require("../middlewares/auth");

const {
  submitProject,
  getMyProjectSubmissions,
  getMyProjectSubmissionById,
  getProjectSubmissions,
  gradeProjectSubmission,
} = require("../controllers/projectSubmission");

// Student - submit project
router.post("/submit", auth, relasedTo("student"), submitProject);

// Student - get my submissions
router.get(
  "/my-submissions",
  auth,
  relasedTo("student"),
  getMyProjectSubmissions,
);

// Student - get my submission by id
router.get(
  "/my-submissions/:submissionId",
  auth,
  relasedTo("student"),
  getMyProjectSubmissionById,
);

// Instructor - get submissions for a project
router.get(
  "/project/:projectId",
  auth,
  relasedTo("instructor"),
  getProjectSubmissions,
);

// Instructor - grade submission
router.patch(
  "/:submissionId/grade",
  auth,
  relasedTo("instructor"),
  gradeProjectSubmission,
);

module.exports = router;

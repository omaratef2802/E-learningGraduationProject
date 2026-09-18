const express = require("express");

const router = express.Router();

const projectController = require("../controllers/Projects");

const { auth, relasedTo } = require("../middlewares/auth");
router.post(
  "/assign",
  auth,
  relasedTo("admin", "instructor"),
  projectController.createProject
);

router.get(
  "/me/projects",
  auth,
  relasedTo("user"),
  projectController.getMyProjects
);

router.get(
  "/projects/:projectId",
  auth,
  projectController.getProjectById
);

router.post(
  "/projects/:projectId/submissions",
  auth,
  relasedTo("user"),
  projectController.submitProject
);

router.get(
  "/instructor/projects/pending",
  auth,
  relasedTo("instructor"),
  projectController.getPendingProjects
);

router.patch(
  "/projects/:projectId/review",
  auth,
  relasedTo("instructor"),
  projectController.reviewProject
);

module.exports = router;
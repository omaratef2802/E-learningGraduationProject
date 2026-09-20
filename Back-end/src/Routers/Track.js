const express = require("express");

const router = express.Router();

const {
  createTrack,
  getTracks,
  getTracksByCategory,
  getTrackById,
  getTrackBySlug,
  updateTrack,
  deleteTrack
} = require("../controllers/Track");

const { auth, relasedTo } = require("../middlewares/auth");

// Get all Tracks
router.get("/", auth, getTracks);

// Get Tracks by Category
router.get("/category/:categoryId", auth, getTracksByCategory);

// Get Track by ID
router.get("/id/:id", auth, getTrackById);
// Get Track by Slug
router.get("/:slug", auth, getTrackBySlug);
// Create Track - Admin 
router.post("/", auth, relasedTo("admin"), createTrack);
// Update Track 
router.put("/:id", auth, relasedTo("admin"), updateTrack);
// Delete Track - Admin 
router.delete("/:id", auth, relasedTo("admin"), deleteTrack);


module.exports = router;
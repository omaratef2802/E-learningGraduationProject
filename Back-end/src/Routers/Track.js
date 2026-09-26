const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const {
  createTrack,
  getTracks,
  getTracksByCategory,
  getTrackById,
  getTrackBySlug,
  updateTrack,
  deleteTrack,
} = require("../controllers/Track");
router.get("/", getTracks);
router.get("/category/:categoryId", getTracksByCategory);
router.get("/trackById/:id", getTrackById);
router.get("/trackBySlug/:slug", getTrackBySlug);
router.post("/AddTrack", auth, relasedTo("admin"), createTrack);
router.put("/updateTrack/:id", auth, relasedTo("admin"), updateTrack);
router.delete("/deleteTrack/:id", auth, relasedTo("admin"), deleteTrack);
module.exports = router;

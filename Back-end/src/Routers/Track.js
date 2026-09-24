const express = require("express");

const router = express.Router();

const {  createTrack,  getTracks,  getTracksByCategory,  getTracksByCategoryAndSubcategory,  getTrackById,  getTrackBySlug,  updateTrack, deleteTrack} = require("../controllers/Track");

const { auth, relasedTo } = require("../middlewares/auth");

router.get("/", auth, getTracks);

router.get("/category/:categoryId", auth, getTracksByCategory);


router.get( "/category/:categoryId/subcategory/:subcategoryId",  auth,  getTracksByCategoryAndSubcategory);

router.get("/id/:id", auth, getTrackById);

router.get("/:slug", auth, getTrackBySlug);

router.post("/", auth, relasedTo("admin"), createTrack);

router.put("/:id", auth, relasedTo("admin"), updateTrack);

router.delete("/:id", auth, relasedTo("admin"), deleteTrack);

module.exports = router;
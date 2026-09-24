const Track = require("../modules/dbTrack");

// Create Track
const createTrack = async (req, res) => {
  try {
    const track = await Track.create(req.body);

    res.status(201).json({
      message: "Track created successfully",
      track
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
const getTracks = async (req, res) => {
  try {
    const tracks = await Track.find()
      .populate("categoryId", "name slug");

    res.status(200).json({
      tracks
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getTracksByCategory = async (req, res) => {
  try {
    const tracks = await Track.find({
      categoryId: req.params.categoryId
    });

    res.status(200).json({
      tracks
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getTracksByCategoryAndSubcategory = async (req, res) => {
  try {
    const tracks = await Track.find({
      categoryId: req.params.categoryId,
      subcategoryId: req.params.subcategoryId
    }).populate("categoryId", "name slug");

    res.status(200).json({
      tracks
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
const getTrackById = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id)
      .populate("categoryId", "name slug");

    if (!track) {
      return res.status(404).json({
        message: "Track not found"
      });
    }

    res.status(200).json({
      track
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
const getTrackBySlug = async (req, res) => {
  try {
    const track = await Track.findOne({
      slug: req.params.slug
    }).populate("categoryId", "name slug");

    if (!track) {
      return res.status(404).json({
        message: "Track not found"
      });
    }

    res.status(200).json({
      track
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const updateTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!track) {
      return res.status(404).json({
        message: "Track not found"
      });
    }

    res.status(200).json({
      message: "Track updated successfully",
      track
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const deleteTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndDelete(req.params.id);

    if (!track) {
      return res.status(404).json({
        message: "Track not found"
      });
    }

    res.status(200).json({
      message: "Track deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


module.exports = {
  createTrack,
  getTracks,
  getTracksByCategory,
  getTracksByCategoryAndSubcategory,
  getTrackById,
  getTrackBySlug,
  updateTrack,
  deleteTrack
};
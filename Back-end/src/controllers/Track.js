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


// Get All Tracks
const getTracks = async (req, res) => {
  try {
    const tracks = await Track.find();

    res.status(200).json({
      tracks
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Tracks By Category
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


// Get Track By ID
const getTrackById = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);

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


// Get Track By Slug
const getTrackBySlug = async (req, res) => {
  try {
    const track = await Track.findOne({
      slug: req.params.slug
    });

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


// Update Track
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


// Delete Track
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
  getTrackById,
  getTrackBySlug,
  updateTrack,
  deleteTrack
};
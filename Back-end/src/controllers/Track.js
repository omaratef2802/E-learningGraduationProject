const Track = require("../modules/dbTrack");
const Category = require("../modules/dbCategory");
const Course = require("../modules/dbCourse");
const ApiError = require("../utils/ApiError");

const validateCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) throw new ApiError(404, "Category not found");
};

const createTrack = async (req, res, next) => {
  try {
    await validateCategory(req.body.categoryId);
    const track = await Track.create(req.body);
    return res.status(201).json({ message: "Track created successfully", data: track });
  } catch (error) { return next(error instanceof ApiError ? error : new ApiError(500, error.message)); }
};

const getTracks = async (req, res, next) => {
  try {
    const tracks = await Track.find().populate("categoryId", "name slug");
    return res.status(200).json({ tracks });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

const getTracksByCategory = async (req, res, next) => {
  try {
    const tracks = await Track.find({ categoryId: req.params.categoryId }).populate("categoryId", "name slug");
    return res.status(200).json({ tracks });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

const getTrackById = async (req, res, next) => {
  try {
    const track = await Track.findById(req.params.id).populate("categoryId", "name slug");
    if (!track) return next(new ApiError(404, "Track not found"));
    return res.status(200).json({ track });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

const getTrackBySlug = async (req, res, next) => {
  try {
    const track = await Track.findOne({ slug: req.params.slug }).populate("categoryId", "name slug");
    if (!track) return next(new ApiError(404, "Track not found"));
    return res.status(200).json({ track });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

const updateTrack = async (req, res, next) => {
  try {
    if (req.body.categoryId) await validateCategory(req.body.categoryId);
    const track = await Track.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!track) return next(new ApiError(404, "Track not found"));
    return res.status(200).json({ message: "Track updated successfully", track });
  } catch (error) { return next(error instanceof ApiError ? error : new ApiError(500, error.message)); }
};

const deleteTrack = async (req, res, next) => {
  try {
    const courseCount = await Course.countDocuments({ track: req.params.id });
    if (courseCount) return next(new ApiError(409, "Track is still used by courses"));
    const track = await Track.findByIdAndDelete(req.params.id);
    if (!track) return next(new ApiError(404, "Track not found"));
    return res.status(200).json({ message: "Track deleted successfully" });
  } catch (error) { return next(new ApiError(500, error.message)); }
};

module.exports = { createTrack, getTracks, getTracksByCategory, getTrackById, getTrackBySlug, updateTrack, deleteTrack };

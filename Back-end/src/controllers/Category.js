const Category = require("../modules/dbCategory");
const Course = require("../modules/dbCourse");
const Track = require("../modules/dbTrack");
const ApiError = require("../utils/ApiError");

const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    return res.status(201).json({ message: "Category created successfully", data: category });
  } catch (err) { return next(new ApiError(500, err.message)); }
};
const getCategories = async (req, res, next) => {
  try { return res.status(200).json({ categories: await Category.find().sort({ name: 1 }) }); }
  catch (err) { return next(new ApiError(500, err.message)); }
};
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ApiError(404, "Category not found"));
    return res.status(200).json({ category });
  } catch (err) { return next(new ApiError(500, err.message)); }
};
const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return next(new ApiError(404, "Category not found"));
    return res.status(200).json({ category });
  } catch (err) { return next(new ApiError(500, err.message)); }
};
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return next(new ApiError(404, "Category not found"));
    return res.status(200).json({ message: "Category updated successfully", data: category });
  } catch (err) { return next(new ApiError(500, err.message)); }
};
const deleteCategory = async (req, res, next) => {
  try {
    const [courseCount, trackCount] = await Promise.all([
      Course.countDocuments({ category: req.params.id }),
      Track.countDocuments({ categoryId: req.params.id }),
    ]);
    if (courseCount || trackCount) return next(new ApiError(409, "Category is still used by courses or tracks"));
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(new ApiError(404, "Category not found"));
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) { return next(new ApiError(500, err.message)); }
};
const addSubcategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ApiError(404, "Category not found"));
    if (category.subcategories.some((item) => item.slug === req.body.slug)) return next(new ApiError(409, "Subcategory slug already exists in this category"));
    category.subcategories.push(req.body);
    await category.save();
    return res.status(201).json({ message: "Subcategory added successfully", data: category });
  } catch (err) { return next(new ApiError(500, err.message)); }
};
const updateSubcategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ApiError(404, "Category not found"));
    const subcategory = category.subcategories.id(req.params.subId);
    if (!subcategory) return next(new ApiError(404, "Subcategory not found"));
    if (req.body.slug && category.subcategories.some((item) => item._id.toString() !== subcategory._id.toString() && item.slug === req.body.slug)) return next(new ApiError(409, "Subcategory slug already exists in this category"));
    Object.assign(subcategory, req.body);
    await category.save();
    return res.status(200).json({ message: "Subcategory updated successfully", data: category });
  } catch (err) { return next(new ApiError(500, err.message)); }
};
const deleteSubcategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ApiError(404, "Category not found"));
    const subcategory = category.subcategories.id(req.params.subId);
    if (!subcategory) return next(new ApiError(404, "Subcategory not found"));
    subcategory.deleteOne();
    await category.save();
    return res.status(200).json({ message: "Subcategory deleted successfully", data: category });
  } catch (err) { return next(new ApiError(500, err.message)); }
};
const getSubcategoriesByCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ApiError(404, "Category not found"));
    return res.status(200).json({ subcategories: category.subcategories });
  } catch (err) { return next(new ApiError(500, err.message)); }
};
module.exports = { createCategory, getCategories, getCategoryById, getCategoryBySlug, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory, getSubcategoriesByCategory };

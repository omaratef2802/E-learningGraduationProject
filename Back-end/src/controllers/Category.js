const Category = require("../modules/dbCategory");





// create category
const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ message: "Category created successfully",data:category });
  } catch (err) {
    res.status(500).json({ message: "Error creating category", error: err.message });
  }
};
// get all category
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({categories });
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
};
// by id
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found"});
    }
    res.status(200).json({ category });
  } catch (err) {
    res.status(500).json({ message: "Error fetching category", error: err.message });
  }
};

// by slug 
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({ message: "Category not found"});
    }
    res.status(200).json({category });
  } catch (err) {
    res.status(500).json({ message: "Error fetching category",err: err.message });
  }
};

// update category 
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate( req.params.id, req.body);
    if (!category) {
      return res.status(404).json({message: "Category not found" });
    }
    res.status(200).json({ message: "Category updated successfully",data:category });
  } catch (err) {
    res.status(500).json({  message: err.message  });
  }
};

// delete category 
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// add sub category 
const addSubcategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    category.subcategories.push(req.body);
    await category.save();
    res.status(201).json({ message: "Subcategory added successfully",data:category });
  } catch (err) {
    res.status(500).json({message: err.message });
  }
};

// update subcaregory 

const updateSubcategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({message: "Category not found" });
    }
    const subcategory = category.subcategories.id(req.params.subId);

    if (!subcategory) {
      return res.status(404).json({message: "Subcategory not found" });
    }
    Object.assign(subcategory, req.body);
    await category.save();
    res.status(200).json({ message: "Subcategory updated successfully",data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete 
const deleteSubcategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const subcategory = category.subcategories.id(req.params.subId);

    if (!subcategory) {
      return res.status(404).json({message: "Subcategory not found" });
    }

    subcategory.deleteOne();

    await category.save();

    res.status(200).json({ message: "Subcategory deleted successfully",data: category });
  } catch (error) {
    res.status(500).json({  message: error.message });
  }
};


const getSubcategoriesByCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ subcategories: category.subcategories });
  } catch (error) {
    res.status(500).json({ message: error.message});
  }
};



module.exports = { createCategory, getCategories, getCategoryById, getCategoryBySlug, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory ,getSubcategoriesByCategory};


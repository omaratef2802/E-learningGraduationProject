const express = require("express");
const router = express.Router();

const { createCategory, getCategories, getCategoryById,  getCategoryBySlug, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory, getSubcategoriesByCategory} = require("../controllers/Category");

const { auth, relasedTo } = require("../middlewares/auth");
router.post("/", auth, relasedTo("admin"), createCategory);

router.get("/",auth, getCategories);
router.get("/id/:id",auth, getCategoryById);

router.get("/:id/subcategories",auth, getSubcategoriesByCategory);

router.get("/:slug",auth, getCategoryBySlug);

router.put("/:id", auth, relasedTo("admin"), updateCategory);

router.delete("/:id", auth, relasedTo("admin"), deleteCategory);

router.post("/:id/subcategories", auth, relasedTo("admin"), addSubcategory);

router.put("/:id/subcategories/:subId", auth, relasedTo("admin"), updateSubcategory);

router.delete("/:id/subcategories/:subId", auth, relasedTo("admin"), deleteSubcategory);

module.exports = router;
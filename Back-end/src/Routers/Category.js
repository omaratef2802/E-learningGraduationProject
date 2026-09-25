const express = require("express");
const router = express.Router();
const { auth, relasedTo } = require("../middlewares/auth");
const {
  createCategory,
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getSubcategoriesByCategory,
} = require("../controllers/Category");

router.post("/AddCatogry", auth, relasedTo("admin"), createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.get("/subcategories/:id", getSubcategoriesByCategory);

router.get("/catogrybyslugs/:slug", getCategoryBySlug);

router.put("/:id", auth, relasedTo("admin"), updateCategory);
router.delete("/:id", auth, relasedTo("admin"), deleteCategory);
router.post("/:id/subcategories", auth, relasedTo("admin"), addSubcategory);

router.put(
  "/:id/subcategories/:subId",
  auth,
  relasedTo("admin"),
  updateSubcategory,
);

router.delete(
  "/:id/subcategories/:subId",
  auth,
  relasedTo("admin"),
  deleteSubcategory,
);

module.exports = router;

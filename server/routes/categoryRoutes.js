const express = require("express");

const router = express.Router();

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

// =====================================================
// APPLE BLOSSOM
// STEP 5 : CATEGORY MANAGEMENT ROUTES (DB backed)
// =====================================================

// =====================================================
// MULTER IMAGE UPLOAD (categories folder)
// =====================================================

const uploadCategory = require("../config/multerCategory");

// ==========================================
// GET ALL CATEGORIES (PUBLIC)
// GET /api/categories
// ==========================================

router.get("/", getCategories);

// ==========================================
// CREATE CATEGORY (ADMIN)
// POST /api/categories
// multipart: name + image
// ==========================================

router.post(
  "/",
  authenticate,
  authorize("admin"),
  uploadCategory.single("image"),
  createCategory
);

// ==========================================
// UPDATE CATEGORY (ADMIN)
// PUT /api/categories/:id
// multipart: name? + image?
// ==========================================

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  uploadCategory.single("image"),
  updateCategory
);

// ==========================================
// DELETE CATEGORY (ADMIN)
// DELETE /api/categories/:id
// ==========================================

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteCategory
);

module.exports = router;

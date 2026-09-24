const db = require("../config/db");

// =====================================================
// APPLE BLOSSOM
// STEP 5 : CATEGORY MANAGEMENT CONTROLLER
//
// GET    /api/categories        -> public (DB backed)
// POST   /api/categories        -> admin (image upload)
// PUT    /api/categories/:id    -> admin
// DELETE /api/categories/:id    -> admin
// =====================================================

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// =====================================================
// GET ALL CATEGORIES (PUBLIC)
// =====================================================

const getCategories = async (req, res) => {
  try {
    const categories = await query(
      `SELECT id, name, image, created_at
       FROM categories
       ORDER BY id ASC`
    );

    return res.json({
      success: true,
      categories,
      // BACKWARD COMPATIBILITY:
      // Shop.jsx "response.data.data" expect karta hai
      // (purane stub response ki wajah se)
      data: categories,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// =====================================================
// CREATE CATEGORY (ADMIN)
// POST /api/categories  (multipart: name + image)
// =====================================================

const createCategory = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Category image is required",
      });
    }

    // Duplicate name check
    const existing = await query(
      "SELECT id FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1",
      [name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Category "${name}" already exists`,
      });
    }

    const result = await query(
      "INSERT INTO categories (name, image) VALUES (?, ?)",
      [name, req.file.filename]
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: {
        id: result.insertId,
        name,
        image: req.file.filename,
      },
    });
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

// =====================================================
// UPDATE CATEGORY (ADMIN)
// PUT /api/categories/:id  (multipart: name? + image?)
// =====================================================

const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;

    const rows = await query(
      "SELECT id, name, image FROM categories WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const category = rows[0];
    const newName = req.body.name
      ? req.body.name.trim()
      : null;

    // Name update -> products me bhi category name string sync karo
    if (newName && newName !== category.name) {
      const duplicate = await query(
        "SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND id != ? LIMIT 1",
        [newName, id]
      );

      if (duplicate.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Category "${newName}" already exists`,
        });
      }

      // Products linked via category_id + unlinked via name string
      await query(
        "UPDATE products SET category = ? WHERE category_id = ?",
        [newName, id]
      );

      await query(
        "UPDATE products SET category = ? WHERE category = ?",
        [newName, category.name]
      );
    }

    const finalName = newName || category.name;
    const finalImage = req.file
      ? req.file.filename
      : category.image;

    await query(
      "UPDATE categories SET name = ?, image = ? WHERE id = ?",
      [finalName, finalImage, id]
    );

    return res.json({
      success: true,
      message: "Category updated successfully",
      category: {
        id: Number(id),
        name: finalName,
        image: finalImage,
      },
    });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

// =====================================================
// DELETE CATEGORY (ADMIN)
// DELETE /api/categories/:id
// =====================================================

const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;

    const rows = await query(
      "SELECT id, name FROM categories WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await query("DELETE FROM categories WHERE id = ?", [id]);

    // Products ka category_id clear kar do
    // (name string chhupta rehta hai, isliye product safe hai)
    await query(
      "UPDATE products SET category_id = NULL WHERE category_id = ?",
      [id]
    );

    return res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

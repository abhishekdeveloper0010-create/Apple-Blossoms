const db = require("../config/db");

// =====================================================
// GET ALL PRODUCTS
// =====================================================

const getProducts = (callback) => {
  const sql = `
    SELECT *
    FROM products
    ORDER BY id DESC
  `;

  db.query(sql, callback);
};

// =====================================================
// GET PRODUCTS PAGINATED + SEARCH + CATEGORY ID
// =====================================================

const getProductsPaginated = (
  page = 1,
  limit = 8,
  search = "",
  categoryId = null,
  callback
) => {
  page = Math.max(
    1,
    parseInt(page, 10) || 1
  );

  limit = Math.max(
    1,
    parseInt(limit, 10) || 8
  );

  const offset = (page - 1) * limit;

  let where = "";
  const values = [];

  // ===================================================
  // SEARCH
  // ===================================================

  if (search) {
    where = `
      WHERE
        p.name LIKE ?
        OR p.description LIKE ?
        OR p.category LIKE ?
        OR p.category IN (
          SELECT name FROM categories WHERE LOWER(name) LIKE LOWER(?)
        )
        OR p.category_id IN (
          SELECT id FROM categories WHERE LOWER(name) LIKE LOWER(?)
        )
    `;

    const searchValue = `%${search}%`;

    values.push(
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue
    );
  }

  // ===================================================
  // CATEGORY ID
  // ===================================================

  if (
    categoryId !== null &&
    categoryId !== "" &&
    Number.isInteger(Number(categoryId))
  ) {
    if (where) {
      where += `
          AND p.category_id = ?
        `;
    } else {
      where = `
          WHERE p.category_id = ?
        `;
    }

    values.push(Number(categoryId));
  }

  // ===================================================
  // COUNT
  // ===================================================

  const countSql = `
    SELECT COUNT(*) AS total
    FROM products p
    ${where}
  `;

  db.query(
    countSql,
    values,
    (countErr, countResults) => {
      if (countErr) {
        console.error(
          "COUNT PRODUCTS ERROR:",
          countErr
        );

        return callback(countErr);
      }

      const total = Number(
        countResults?.[0]?.total || 0
      );

      // =================================================
      // PRODUCTS
      // =================================================

      const safeLimit = Number(limit);
      const safeOffset = Number(offset);

      const sql = `
        SELECT
          p.*
        FROM products p
        ${where}
        ORDER BY p.id DESC
        LIMIT ${safeLimit}
        OFFSET ${safeOffset}
      `;

      db.query(
        sql,
        values,
        (err, results) => {
          if (err) {
            console.error(
              "GET PRODUCTS ERROR:",
              err
            );

            return callback(err);
          }

          return callback(null, {
            results: results || [],
            total,
          });
        }
      );
    }
  );
};

// =====================================================
// GET PRODUCT BY ID
// =====================================================

const getProductById = (id, callback) => {
  const sql = `
    SELECT *
    FROM products
    WHERE id = ?
  `;

  db.query(sql, [id], callback);
};

// =====================================================
// CREATE PRODUCT
// =====================================================

const createProduct = (productData, callback) => {
  const sql = `
    INSERT INTO products
    (
      name,
      description,
      price,
      old_price,
      offer,
      category,
      category_id,
      image,
      size,
      stock
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      productData.name,
      productData.description,
      productData.price,
      productData.old_price,
      productData.offer,
      productData.category,
      productData.category_id || null,
      productData.image,
      productData.size,
      productData.stock,
    ],
    callback,
  );
};

// =====================================================
// UPDATE PRODUCT
// =====================================================

const updateProduct = (id, productData, callback) => {
  const sql = `
    UPDATE products
    SET
      name = ?,
      description = ?,
      price = ?,
      old_price = ?,
      offer = ?,
      category = ?,
      image = ?,
      size = ?,
      stock = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      productData.name,
      productData.description,
      productData.price,
      productData.old_price,
      productData.offer,
      productData.category,
      productData.image,
      productData.size,
      productData.stock,
      id,
    ],
    callback,
  );
};

// =====================================================
// DELETE PRODUCT
// =====================================================

const deleteProduct = (id, callback) => {
  const sql = `
    DELETE FROM products
    WHERE id = ?
  `;

  db.query(sql, [id], callback);
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getProducts,
  getProductsPaginated,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
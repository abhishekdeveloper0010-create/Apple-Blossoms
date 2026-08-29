const db = require("../config/db");

// =========================
// GET USER WISHLIST
// =========================

const getWishlistByUser = (userId, callback) => {
  const sql = `
    SELECT
      p.*
    FROM wishlist w
    INNER JOIN products p
      ON w.product_id = p.id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
  `;

  db.query(sql, [userId], callback);
};

// =========================
// ADD TO WISHLIST
// =========================

const addToWishlist = (userId, productId, callback) => {
  const sql = `
    INSERT INTO wishlist (user_id, product_id)
    VALUES (?, ?)
  `;

  db.query(sql, [userId, productId], callback);
};

// =========================
// REMOVE FROM WISHLIST
// =========================

const removeFromWishlist = (userId, productId, callback) => {
  const sql = `
    DELETE FROM wishlist
    WHERE user_id = ?
      AND product_id = ?
  `;

  db.query(sql, [userId, productId], callback);
};

// =========================
// CLEAR USER WISHLIST
// =========================

const clearWishlist = (userId, callback) => {
  const sql = `
    DELETE FROM wishlist
    WHERE user_id = ?
  `;

  db.query(sql, [userId], callback);
};

// =========================
// CHECK PRODUCT
// =========================

const checkWishlist = (userId, productId, callback) => {
  const sql = `
    SELECT id
    FROM wishlist
    WHERE user_id = ?
      AND product_id = ?
    LIMIT 1
  `;

  db.query(sql, [userId, productId], callback);
};

module.exports = {
  getWishlistByUser,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist,
};
const Wishlist = require("../models/wishlistModel");

// =========================
// GET WISHLIST
// =========================

const getWishlist = (req, res) => {
  const userId = req.user.id;

  Wishlist.getWishlistByUser(userId, (err, results) => {
    if (err) {
      console.error("Get wishlist error:", err);

      return res.status(500).json({
        message: "Failed to load wishlist",
      });
    }

    res.json({
      success: true,
      wishlist: results,
    });
  });
};

// =========================
// ADD WISHLIST
// =========================

const addWishlist = (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({
      message: "Product ID is required",
    });
  }

  Wishlist.addToWishlist(userId, product_id, (err) => {
    if (err) {
      // Duplicate product
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Product already in wishlist",
        });
      }

      console.error("Add wishlist error:", err);

      return res.status(500).json({
        message: "Failed to add product to wishlist",
      });
    }

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
    });
  });
};

// =========================
// REMOVE WISHLIST
// =========================

const removeWishlist = (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  Wishlist.removeFromWishlist(
    userId,
    productId,
    (err, result) => {
      if (err) {
        console.error("Remove wishlist error:", err);

        return res.status(500).json({
          message: "Failed to remove product",
        });
      }

      res.json({
        success: true,
        message: "Product removed from wishlist",
      });
    }
  );
};

// =========================
// CLEAR WISHLIST
// =========================

const deleteWishlist = (req, res) => {
  const userId = req.user.id;

  Wishlist.clearWishlist(userId, (err) => {
    if (err) {
      console.error("Clear wishlist error:", err);

      return res.status(500).json({
        message: "Failed to clear wishlist",
      });
    }

    res.json({
      success: true,
      message: "Wishlist cleared",
    });
  });
};

// =========================
// CHECK WISHLIST
// =========================

const checkWishlist = (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  Wishlist.checkWishlist(
    userId,
    productId,
    (err, results) => {
      if (err) {
        console.error("Check wishlist error:", err);

        return res.status(500).json({
          message: "Failed to check wishlist",
        });
      }

      res.json({
        success: true,
        isWishlisted: results.length > 0,
      });
    }
  );
};

module.exports = {
  getWishlist,
  addWishlist,
  removeWishlist,
  deleteWishlist,
  checkWishlist,
};
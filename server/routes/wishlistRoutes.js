const express = require("express");

const router = express.Router();

const {
  authenticate,
} = require("../middleware/authMiddleware");

const {
  getWishlist,
  addWishlist,
  removeWishlist,
  deleteWishlist,
  checkWishlist,
} = require("../controllers/wishlistController");

// =====================================================
// GET USER WISHLIST
// =====================================================

router.get("/", authenticate, getWishlist);

// =====================================================
// ADD PRODUCT TO WISHLIST
// =====================================================

router.post("/", authenticate, addWishlist);

// =====================================================
// CHECK PRODUCT WISHLIST
// =====================================================

router.get(
  "/check/:productId",
  authenticate,
  checkWishlist
);

// =====================================================
// REMOVE PRODUCT FROM WISHLIST
// =====================================================

router.delete(
  "/:productId",
  authenticate,
  removeWishlist
);

// =====================================================
// CLEAR ALL WISHLIST
// =====================================================

router.delete(
  "/",
  authenticate,
  deleteWishlist
);

module.exports = router;
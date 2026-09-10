const express = require("express");

const router = express.Router();

const reviewController =
  require("../controllers/reviewController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

// =====================================================
// PUBLIC — GET PRODUCT REVIEWS
// =====================================================

router.get(
  "/product/:productId",
  reviewController.getProductReviews
);

// =====================================================
// USER — ADD REVIEW
// =====================================================

router.post(
  "/",
  authenticate,
  reviewController.addReview
);

// =====================================================
// USER — UPDATE OWN REVIEW
// =====================================================

router.put(
  "/:id",
  authenticate,
  reviewController.updateReview
);

// =====================================================
// USER — DELETE OWN REVIEW
// =====================================================

router.delete(
  "/:id",
  authenticate,
  reviewController.deleteReview
);

// =====================================================
// ADMIN — GET ALL REVIEWS
// =====================================================

router.get(
  "/admin/all",
  authenticate,
  authorize("admin"),
  reviewController.getAllReviews
);

// =====================================================
// ADMIN — UPDATE STATUS
// =====================================================

router.patch(
  "/admin/:id/status",
  authenticate,
  authorize("admin"),
  reviewController.updateReviewStatus
);

// =====================================================
// ADMIN — DELETE REVIEW
// =====================================================

router.delete(
  "/admin/:id",
  authenticate,
  authorize("admin"),
  reviewController.adminDeleteReview
);

module.exports = router;
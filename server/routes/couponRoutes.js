const express = require("express");

const router = express.Router();

const {
  validateCoupon,
  getAllCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  toggleCoupon,
  deleteCoupon,
} = require("../controllers/couponController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

// =====================================================
// CUSTOMER
// =====================================================

// Validate coupon
router.post(
  "/validate",
  authenticate,
  validateCoupon
);

// =====================================================
// ADMIN
// =====================================================

router.get(
  "/",
  authenticate,
  authorize("admin"),
  getAllCoupons
);

router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  getCoupon
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  createCoupon
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  updateCoupon
);

router.patch(
  "/:id/toggle",
  authenticate,
  authorize("admin"),
  toggleCoupon
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteCoupon
);

module.exports = router;
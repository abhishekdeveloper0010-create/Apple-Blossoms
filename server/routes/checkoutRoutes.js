const express = require("express");

const router = express.Router();

const checkoutController = require(
  "../controllers/checkoutController"
);

const { authenticate } = require(
  "../middleware/authMiddleware"
);

// =====================================================
// APPLE BLOSSOM
// STEP 6 : CHECKOUT ROUTES
// =====================================================

// PUBLIC : PINCODE SERVICEABILITY
// GET /api/checkout/pincode/:pin

router.get(
  "/pincode/:pin",
  checkoutController.checkPincode
);

// USER : SHIPPING + GST QUOTE
// POST /api/checkout/quote

router.post(
  "/quote",
  authenticate,
  checkoutController.getQuote
);

module.exports = router;

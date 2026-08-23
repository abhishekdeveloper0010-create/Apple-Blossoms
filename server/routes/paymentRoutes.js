const express = require("express");

const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
} = require("../controllers/paymentController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

// ==========================================
// CREATE RAZORPAY ORDER
// POST /api/payments/create-order
// ==========================================

router.post(
  "/create-order",
  authenticate,
  createPaymentOrder
);

// ==========================================
// VERIFY RAZORPAY PAYMENT
// POST /api/payments/verify
// ==========================================

router.post(
  "/verify",
  authenticate,
  verifyPayment
);

module.exports = router;
const express = require("express");

const router = express.Router();

const returnController = require("../controllers/returnController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

// =====================================================
// USER ROUTES
// =====================================================

// Apne return requests
router.get(
  "/my",
  authenticate,
  returnController.getMyReturns
);

// Return settings (window, refund methods)
router.get(
  "/settings",
  authenticate,
  returnController.getReturnSettings
);

// Naya return request
router.post(
  "/",
  authenticate,
  returnController.createReturn
);

// =====================================================
// ADMIN ROUTES
// =====================================================

// Saare returns (?status=Pending)
router.get(
  "/",
  authenticate,
  authorize("admin"),
  returnController.getAllReturns
);

// Approve
router.patch(
  "/:id/approve",
  authenticate,
  authorize("admin"),
  returnController.approveReturn
);

// Reject
router.patch(
  "/:id/reject",
  authenticate,
  authorize("admin"),
  returnController.rejectReturn
);

// Pickup done
router.patch(
  "/:id/picked-up",
  authenticate,
  authorize("admin"),
  returnController.markReturnPickedUp
);

// Actual refund (wallet / razorpay / manual / cod)
router.post(
  "/:id/refund",
  authenticate,
  authorize("admin"),
  returnController.processReturnRefund
);

module.exports = router;
const express = require("express");

const router = express.Router();

const shippingController = require("../controllers/shippingController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

// =====================================================
// PUBLIC
// =====================================================

// AWB se tracking
router.get(
  "/track/:awb",
  shippingController.trackByAwb
);

// =====================================================
// USER
// =====================================================

// Apne order ka tracking
router.get(
  "/order/:orderId",
  authenticate,
  shippingController.getOrderTracking
);

// =====================================================
// ADMIN
// =====================================================

// Shipping provider info
router.get(
  "/config",
  authenticate,
  authorize("admin"),
  shippingController.getShippingConfig
);

// Saare shipments
router.get(
  "/",
  authenticate,
  authorize("admin"),
  shippingController.getAllShipments
);

// Shipment banao (manual ya shiprocket)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  shippingController.createShipment
);

// Manual tracking update (courier + AWB)
router.patch(
  "/:orderId/tracking",
  authenticate,
  authorize("admin"),
  shippingController.updateTracking
);

// Courier se tracking sync
router.post(
  "/:orderId/sync",
  authenticate,
  authorize("admin"),
  shippingController.syncTracking
);

module.exports = router;
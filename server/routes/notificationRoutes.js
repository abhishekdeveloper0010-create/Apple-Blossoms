const express = require("express");

const router = express.Router();

const notificationController = require("../controllers/notificationController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

// =====================================================
// ADMIN : NOTIFICATION LOG
// GET /api/notifications
// =====================================================

router.get(
  "/",
  authenticate,
  authorize("admin"),
  notificationController.getNotifications
);

// =====================================================
// ADMIN : CHANNELS STATUS
// GET /api/notifications/status
// =====================================================

router.get(
  "/status",
  authenticate,
  authorize("admin"),
  notificationController.getStatus
);

// =====================================================
// ADMIN : TEST MESSAGE
// POST /api/notifications/test
// =====================================================

router.post(
  "/test",
  authenticate,
  authorize("admin"),
  notificationController.sendTest
);

// =====================================================
// ADMIN : SCHEDULE NOTIFICATION
// POST /api/notifications/schedule
// =====================================================

router.post(
  "/schedule",
  authenticate,
  authorize("admin"),
  notificationController.scheduleNotification
);

module.exports = router;
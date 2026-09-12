const express = require("express");

const router = express.Router();

const {
  createGiftCard,
  getAllGiftCards,
  getGiftCard,
  updateGiftCard,
  deleteGiftCard,
  claimGiftCard,
  getMyGiftCards,
} = require("../controllers/giftCardController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

// =====================================================
// USER ROUTES
// =====================================================

// Claim gift card
router.post("/claim", authenticate, claimGiftCard);

// Get my gift cards
router.get("/my", authenticate, getMyGiftCards);

// =====================================================
// ADMIN ROUTES
// =====================================================

// Get all gift cards
router.get("/", authenticate, authorize("admin"), getAllGiftCards);

// Get single gift card
router.get("/:id", authenticate, authorize("admin"), getGiftCard);

// Create gift card
router.post("/", authenticate, authorize("admin"), createGiftCard);

// Update gift card
router.put("/:id", authenticate, authorize("admin"), updateGiftCard);

// Delete gift card
router.delete("/:id", authenticate, authorize("admin"), deleteGiftCard);

module.exports = router;

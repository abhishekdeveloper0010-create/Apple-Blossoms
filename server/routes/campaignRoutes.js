const express = require("express");

const router = express.Router();

const {
  createCampaign,
  getAllCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  getActiveCampaigns,
  toggleCampaign,
} = require("../controllers/campaignController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

// =====================================================
// PUBLIC ROUTES
// =====================================================

// Get active campaigns (for homepage/banners)
router.get("/active", getActiveCampaigns);

// =====================================================
// ADMIN ROUTES
// =====================================================

// Get all campaigns
router.get("/", authenticate, authorize("admin"), getAllCampaigns);

// Get single campaign
router.get("/:id", authenticate, authorize("admin"), getCampaign);

// Create campaign
router.post("/", authenticate, authorize("admin"), createCampaign);

// Update campaign
router.put("/:id", authenticate, authorize("admin"), updateCampaign);

// Toggle campaign active/inactive
router.patch("/:id/toggle", authenticate, authorize("admin"), toggleCampaign);

// Delete campaign
router.delete("/:id", authenticate, authorize("admin"), deleteCampaign);

module.exports = router;

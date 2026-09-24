const express = require("express");

const router = express.Router();

const {
  getDashboard,
  getRevenueReports,
  getTopProducts,
  getCustomers,
  getCustomerDetail,
  getPayments,
  listImages,
  deleteImage,
} = require("../controllers/adminController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

// =====================================================
// APPLE BLOSSOM
// STEP 5 : ADMIN PANEL ROUTES
// Sab routes admin-only hain (authenticate + authorize)
// =====================================================

// router.use(authenticate, authorize("admin")) bhi chal
// sakta hai, lekin har route me explicit rakha hai
// taaki error messages clear rahein.

// ==========================================
// SALES DASHBOARD
// GET /api/admin/dashboard
// ==========================================

router.get(
  "/dashboard",
  authenticate,
  authorize("admin"),
  getDashboard
);

// ==========================================
// REVENUE REPORTS
// GET /api/admin/reports/revenue?group=day|month&days=30
// ==========================================

router.get(
  "/reports/revenue",
  authenticate,
  authorize("admin"),
  getRevenueReports
);

// ==========================================
// TOP SELLING PRODUCTS
// GET /api/admin/reports/top-products?limit=8
// ==========================================

router.get(
  "/reports/top-products",
  authenticate,
  authorize("admin"),
  getTopProducts
);

// ==========================================
// CUSTOMER MANAGEMENT
// GET /api/admin/customers?search=
// GET /api/admin/customers/:id
// ==========================================

router.get(
  "/customers",
  authenticate,
  authorize("admin"),
  getCustomers
);

router.get(
  "/customers/:id",
  authenticate,
  authorize("admin"),
  getCustomerDetail
);

// ==========================================
// PAYMENT DETAILS LEDGER
// GET /api/admin/payments?method=&status=
// ==========================================

router.get(
  "/payments",
  authenticate,
  authorize("admin"),
  getPayments
);

// ==========================================
// IMAGE MANAGEMENT
// GET    /api/admin/images
// DELETE /api/admin/images/:folder/:file
// ==========================================

router.get(
  "/images",
  authenticate,
  authorize("admin"),
  listImages
);

router.delete(
  "/images/:folder/:file",
  authenticate,
  authorize("admin"),
  deleteImage
);

module.exports = router;

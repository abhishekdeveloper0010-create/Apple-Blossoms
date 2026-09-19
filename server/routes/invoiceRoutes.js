const express = require("express");

const router = express.Router();

const invoiceController = require("../controllers/invoiceController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

// =====================================================
// INVOICE JSON
// GET /api/invoices/order/:orderId
// (owner ya admin)
// =====================================================

router.get(
  "/order/:orderId",
  authenticate,
  invoiceController.getInvoice
);

// =====================================================
// PRINTABLE INVOICE
// GET /api/invoices/order/:orderId/html
// Browser me kholo -> Print -> Save as PDF
// =====================================================

router.get(
  "/order/:orderId/html",
  authenticate,
  invoiceController.getInvoiceHtml
);

// =====================================================
// EMAIL INVOICE
// POST /api/invoices/order/:orderId/email
// =====================================================

router.post(
  "/order/:orderId/email",
  authenticate,
  invoiceController.emailInvoice
);

module.exports = router;
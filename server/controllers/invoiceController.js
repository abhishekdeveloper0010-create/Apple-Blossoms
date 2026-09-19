// =====================================================
// APPLE BLOSSOM
// INVOICE CONTROLLER  (Feature 6)
//
//   GET  /api/invoices/order/:orderId        -> invoice JSON
//   GET  /api/invoices/order/:orderId/html   -> printable invoice
//   POST /api/invoices/order/:orderId/email  -> email invoice
// =====================================================

const {
  buildInvoice,
  renderInvoiceHtml,
} = require("../services/invoiceService");

const {
  notifySafe,
} = require("../services/notificationService");

const {
  getOrderWithDetails,
} = require("../models/orderOpsModel");

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?.user_id ||
    req.user?.userId ||
    null
  );
};

const isAdmin = (req) => {
  return (
    String(
      req.user?.role || req.user?.userRole || ""
    ).toLowerCase() === "admin"
  );
};

// =====================================================
// HELPER : ORDER + PERMISSION
// =====================================================

const loadOrderForInvoice = async (req) => {
  const orderId = Number(req.params.orderId);

  if (!orderId || Number.isNaN(orderId)) {
    return { error: "Invalid order id", code: 400 };
  }

  const order = await getOrderWithDetails(orderId);

  if (!order) {
    return { error: "Order not found", code: 404 };
  }

  const userId = getUserId(req);

  if (order.user_id !== userId && !isAdmin(req)) {
    return { error: "Access denied", code: 403 };
  }

  return { order };
};

// =====================================================
// INVOICE JSON
// GET /api/invoices/order/:orderId
// =====================================================

exports.getInvoice = async (req, res) => {
  try {
    const { order, error, code } =
      await loadOrderForInvoice(req);

    if (error) {
      return res.status(code).json({
        success: false,
        message: error,
      });
    }

    const invoice = buildInvoice(order);

    return res.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("GET INVOICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to build invoice",
    });
  }
};

// =====================================================
// PRINTABLE INVOICE HTML
// GET /api/invoices/order/:orderId/html
// Browser me kholo -> Print -> Save as PDF
// =====================================================

exports.getInvoiceHtml = async (req, res) => {
  try {
    const { order, error, code } =
      await loadOrderForInvoice(req);

    if (error) {
      return res.status(code).send(error);
    }

    const invoice = buildInvoice(order);

    res.setHeader("Content-Type", "text/html");

    return res.send(renderInvoiceHtml(invoice));
  } catch (error) {
    console.error("GET INVOICE HTML ERROR:", error);

    return res
      .status(500)
      .send("Failed to generate invoice");
  }
};

// =====================================================
// EMAIL INVOICE
// POST /api/invoices/order/:orderId/email
// =====================================================

exports.emailInvoice = async (req, res) => {
  try {
    const { order, error, code } =
      await loadOrderForInvoice(req);

    if (error) {
      return res.status(code).json({
        success: false,
        message: error,
      });
    }

    const to =
      req.body?.email ||
      order.customer_email ||
      order.address?.email;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: "Customer email is not available",
      });
    }

    const result = await notifySafe({
      event: "invoice",
      order,
      user: {
        id: order.user_id,
        email: to,
        phone:
          order.customer_phone ||
          order.address?.phone,
      },
      channels: ["email"],
    });

    const emailResult = (result.results || [])[0] || {};

    if (emailResult.status !== "sent") {
      return res.status(400).json({
        success: false,
        message:
          emailResult.error ||
          emailResult.reason ||
          "Invoice email could not be sent",
        result: emailResult,
      });
    }

    return res.json({
      success: true,
      message: `Invoice emailed to ${to}`,
      to,
      result: emailResult,
    });
  } catch (error) {
    console.error("EMAIL INVOICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to email invoice",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getInvoice: exports.getInvoice,
  getInvoiceHtml: exports.getInvoiceHtml,
  emailInvoice: exports.emailInvoice,
};
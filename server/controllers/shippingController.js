// =====================================================
// APPLE BLOSSOM
// SHIPPING CONTROLLER  (Feature 4 & 5)
//
// ADMIN
//   POST  /api/shipments                  -> shipment banao
//   PATCH /api/shipments/:orderId/tracking -> tracking update
//   POST  /api/shipments/:orderId/sync     -> courier se refresh
//   GET   /api/shipments                   -> saare shipments
//   GET   /api/shipments/config            -> provider info
//
// USER
//   GET   /api/shipments/order/:orderId    -> apne order ka tracking
//   GET   /api/shipments/track/:awb        -> AWB se tracking
// =====================================================

const {
  notifySafe,
} = require("../services/notificationService");

const {
  shippingConfig,
  isShiprocketEnabled,
} = require("../config/shipping");

const {
  buildManualShipment,
  createShiprocketShipment,
  saveShipment,
  syncShipmentTracking,
  getTrackingForOrder,
  getShipmentByOrderId,
  buildTrackingUrl,
} = require("../services/shippingService");

const {
  getOrderWithDetails,
  addOrderStatusHistory,
} = require("../models/orderOpsModel");

const db = require("../config/db");

const promiseDb = () => db.promise();

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
// HELPER : SHIPMENT KE BAAD ORDER UPDATE + NOTIFY
// =====================================================

const markOrderShipped = async ({
  order,
  shipmentData,
  user,
}) => {
  const conn = promiseDb();

  const newStatus = "Shipped";

  await conn.execute(
    `
      UPDATE orders
      SET
        status = ?,
        shipped_at = COALESCE(shipped_at, NOW()),
        updated_at = NOW()
      WHERE id = ?
    `,
    [newStatus, order.id]
  );

  await conn.execute(
    `
      UPDATE order_items
      SET status = ?
      WHERE order_id = ?
        AND status NOT IN ('Cancelled', 'Returned', 'Delivered')
    `,
    [newStatus, order.id]
  );

  await addOrderStatusHistory(conn, {
    orderId: order.id,
    status: newStatus,
    message: `Order shipped via ${
      shipmentData.courierName || "courier"
    }. Tracking number: ${
      shipmentData.awbNumber || "-"
    }`,
  });

  await notifySafe({
    event: "order_shipped",
    order: {
      ...order,
      courier_name: shipmentData.courierName,
      tracking_number: shipmentData.awbNumber,
      tracking_url: shipmentData.trackingUrl,
    },
    user,
  });
};

// =====================================================
// ADMIN : SHIPMENT CREATE
// POST /api/shipments
//
// body: {
//   orderId,
//   provider: "manual" | "shiprocket",
//   courierName, awbNumber, trackingUrl,
//   weightGrams, estimatedDelivery, notify
// }
// =====================================================

exports.createShipment = async (req, res) => {
  try {
    const orderId = Number(
      req.body?.orderId || req.body?.order_id
    );

    if (!orderId || Number.isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Order id is required",
      });
    }

    const order = await getOrderWithDetails(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled order ka shipment nahi ban sakta",
      });
    }

    const requestedProvider = String(
      req.body?.provider ||
        shippingConfig.provider ||
        "manual"
    ).toLowerCase();

    const isCod = String(
      order.payment_method || "COD"
    )
      .toUpperCase()
      .includes("COD");

    let shipmentData = null;
    let providerMessage = null;

    // -------------------------------
    // SHIPROCKET SE AUTO
    // -------------------------------

    if (
      requestedProvider === "shiprocket" &&
      isShiprocketEnabled()
    ) {
      try {
        shipmentData = await createShiprocketShipment({
          order,
          items: order.items || [],
          address: order.address || {},
        });
      } catch (error) {
        providerMessage =
          error.response?.data?.message ||
          error.message;

        console.error(
          "SHIPROCKET CREATE ERROR:",
          providerMessage
        );
      }
    }

    // -------------------------------
    // MANUAL / FALLBACK
    // -------------------------------

    if (!shipmentData) {
      shipmentData = buildManualShipment({
        courierName: req.body?.courierName,
        awbNumber: req.body?.awbNumber,
        trackingUrl: req.body?.trackingUrl,
        weightGrams: req.body?.weightGrams,
        estimatedDelivery: req.body?.estimatedDelivery,
      });

      if (providerMessage) {
        shipmentData.providerMessage = `Shiprocket fallback (${providerMessage})`;
      }
    }

    shipmentData.paymentMode = isCod
      ? shippingConfig.codPaymentMode
      : shippingConfig.prepaidPaymentMode;

    // -------------------------------
    // SAVE
    // -------------------------------

    const shipmentId = await saveShipment(null, {
      orderId: order.id,
      userId: order.user_id,
      shipment: shipmentData,
    });

    // -------------------------------
    // ORDER STATUS + NOTIFY
    // -------------------------------

    if (String(req.body?.notify ?? "true") !== "false") {
      await markOrderShipped({
        order,
        shipmentData,
        user: {
          id: order.user_id,
          email: order.customer_email,
          phone:
            order.customer_phone ||
            order.address?.phone,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: shipmentData.awbNumber
        ? "Shipment created with tracking number"
        : "Shipment created (tracking number pending)",
      shipmentId,
      shipment: shipmentData,
      providerMessage,
    });
  } catch (error) {
    console.error("CREATE SHIPMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to create shipment",
    });
  }
};

// =====================================================
// ADMIN : MANUAL TRACKING UPDATE
// PATCH /api/shipments/:orderId/tracking
//
// body: { courierName, awbNumber, trackingUrl, status }
// =====================================================

exports.updateTracking = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);

    if (!orderId || Number.isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order id",
      });
    }

    const order = await getOrderWithDetails(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const existing = await getShipmentByOrderId(orderId);

    const courierName =
      req.body?.courierName ||
      existing?.courier_name ||
      shippingConfig.defaultCourierName;

    const awbNumber =
      req.body?.awbNumber ||
      existing?.awb_number ||
      null;

    const trackingUrl =
      req.body?.trackingUrl ||
      existing?.tracking_url ||
      buildTrackingUrl(awbNumber, courierName);

    const shipmentData = {
      provider: existing?.provider || "manual",
      providerOrderId: existing?.provider_order_id,
      providerShipmentId:
        existing?.provider_shipment_id,
      courierName,
      courierCode:
        existing?.courier_code ||
        String(courierName)
          .toLowerCase()
          .replace(/\s+/g, ""),
      awbNumber,
      trackingUrl,
      status:
        req.body?.status ||
        existing?.status ||
        "Created",
      weightGrams: existing?.weight_grams,
      shippingCost: existing?.shipping_cost,
      paymentMode: existing?.payment_mode,
      labelUrl: existing?.label_url,
      estimatedDelivery:
        req.body?.estimatedDelivery ||
        existing?.estimated_delivery,
      raw: null,
    };

    const shipmentId = await saveShipment(null, {
      orderId,
      userId: order.user_id,
      shipment: shipmentData,
    });

    await addOrderStatusHistory(null, {
      orderId,
      status: "Tracking Updated",
      message: `Courier: ${courierName}, Tracking: ${
        awbNumber || "-"
      }`,
    });

    return res.json({
      success: true,
      message: "Tracking details updated",
      shipmentId,
      shipment: shipmentData,
    });
  } catch (error) {
    console.error("UPDATE TRACKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to update tracking",
    });
  }
};

// =====================================================
// ADMIN : COURIER SE TRACKING SYNC
// POST /api/shipments/:orderId/sync
// =====================================================

exports.syncTracking = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);

    if (!orderId || Number.isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order id",
      });
    }

    const result = await syncShipmentTracking({
      orderId,
    });

    return res.json({
      success: true,
      message: result.statusChanged
        ? `Order status updated to ${result.orderStatus}`
        : "Tracking refreshed",
      shipment: result.shipment,
      events: result.events,
      orderStatus: result.orderStatus,
      statusChanged: result.statusChanged,
      providerMessage: result.providerMessage,
    });
  } catch (error) {
    console.error("SYNC TRACKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to sync tracking",
    });
  }
};

// =====================================================
// ADMIN : SAARE SHIPMENTS
// GET /api/shipments
// =====================================================

exports.getAllShipments = async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(Number(req.query?.limit) || 200, 1),
      500
    );

    const [shipments] = await promiseDb().execute(
      `
        SELECT
          s.*,
          o.order_number,
          o.status AS order_status,
          o.payment_method,
          u.name AS customer_name,
          u.email AS customer_email
        FROM shipments s

        INNER JOIN orders o
          ON o.id = s.order_id

        LEFT JOIN users u
          ON u.id = o.user_id

        ORDER BY s.created_at DESC
        LIMIT ${limit}
      `
    );

    return res.json({
      success: true,
      shipments,
    });
  } catch (error) {
    console.error("GET ALL SHIPMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load shipments",
    });
  }
};

// =====================================================
// USER : ORDER KA TRACKING
// GET /api/shipments/order/:orderId
// =====================================================

exports.getOrderTracking = async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    const userId = getUserId(req);

    if (!orderId || Number.isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order id",
      });
    }

    const order = await getOrderWithDetails(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Sirf maalik ya admin dekh sakta hai
    if (
      order.user_id !== userId &&
      !isAdmin(req)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const { shipment, events } =
      await getTrackingForOrder(orderId);

    return res.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        expected_delivery_date:
          order.expected_delivery_date,
        courier_name: order.courier_name,
        tracking_number: order.tracking_number,
        tracking_url: order.tracking_url,
      },
      shipment,
      events,
    });
  } catch (error) {
    console.error("GET ORDER TRACKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load tracking",
    });
  }
};

// =====================================================
// PUBLIC : AWB SE TRACKING
// GET /api/shipments/track/:awb
// =====================================================

exports.trackByAwb = async (req, res) => {
  try {
    const awb = String(req.params.awb || "").trim();

    if (!awb) {
      return res.status(400).json({
        success: false,
        message: "Tracking number is required",
      });
    }

    const [rows] = await promiseDb().execute(
      `
        SELECT
          s.id,
          s.order_id,
          s.courier_name,
          s.awb_number,
          s.tracking_url,
          s.status,
          s.estimated_delivery,
          s.shipped_at,
          s.delivered_at,
          o.order_number
        FROM shipments s

        INNER JOIN orders o
          ON o.id = s.order_id

        WHERE s.awb_number = ?
        LIMIT 1
      `,
      [awb]
    );

    const shipment = rows[0];

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "No shipment found for this tracking number",
      });
    }

    const [events] = await promiseDb().execute(
      `
        SELECT
          status,
          location,
          message,
          event_time,
          created_at
        FROM shipment_tracking_events
        WHERE shipment_id = ?
        ORDER BY
          COALESCE(event_time, created_at) DESC,
          id DESC
      `,
      [shipment.id]
    );

    return res.json({
      success: true,
      shipment: {
        order_number: shipment.order_number,
        courier_name: shipment.courier_name,
        tracking_number: shipment.awb_number,
        tracking_url: shipment.tracking_url,
        status: shipment.status,
        estimated_delivery:
          shipment.estimated_delivery,
        shipped_at: shipment.shipped_at,
        delivered_at: shipment.delivered_at,
      },
      events,
    });
  } catch (error) {
    console.error("TRACK BY AWB ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to track shipment",
    });
  }
};

// =====================================================
// ADMIN : SHIPPING CONFIG
// GET /api/shipments/config
// =====================================================

exports.getShippingConfig = async (req, res) => {
  return res.json({
    success: true,
    config: {
      provider: shippingConfig.provider,
      shiprocketEnabled: isShiprocketEnabled(),
      defaultCourier:
        shippingConfig.defaultCourierName,
      statuses: [
        "Created",
        "Picked Up",
        "In Transit",
        "Out for Delivery",
        "Delivered",
        "RTO",
        "Cancelled",
      ],
    },
  });
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createShipment: exports.createShipment,
  updateTracking: exports.updateTracking,
  syncTracking: exports.syncTracking,
  getAllShipments: exports.getAllShipments,
  getOrderTracking: exports.getOrderTracking,
  trackByAwb: exports.trackByAwb,
  getShippingConfig: exports.getShippingConfig,
};
// =====================================================
// APPLE BLOSSOM
// SHIPPING SERVICE  (Feature 4 & 5)
//
// provider = manual     -> admin khud courier + AWB daalta hai
// provider = shiprocket -> API se AWB auto generate
//
// Dono case me tracking number + tracking URL milega
// aur "shipments" table me record save hoga.
// =====================================================

const axios = require("axios");

const db = require("../config/db");

const {
  shippingConfig,
  isShiprocketEnabled,
} = require("../config/shipping");

const promiseDb = () => db.promise();

// =====================================================
// COURIER KE PUBLIC TRACKING LINK
// =====================================================

const courierTrackingBase = {
  delhivery:
    "https://www.delhivery.com/track/package/",
  bluedart:
    "https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo=",
  dtdc:
    "https://www.dtdc.in/tracking/tracking_results.asp?strCnno=",
  ekart:
    "https://ekartlogistics.com/shipmenttrack/",
  xpressbees:
    "https://www.xpressbees.com/track?awb=",
  shadowfax: "https://www.shadowfax.in/track/",
  shiprocket: "https://shiprocket.co/tracking/",
};

// =====================================================
// TRACKING URL BANAO
// =====================================================

const buildTrackingUrl = (awb, courierName) => {
  if (!awb) return null;

  // .env me fixed base ho to wahi use karo
  if (shippingConfig.publicTrackingBase) {
    return `${shippingConfig.publicTrackingBase}${awb}`;
  }

  const key = String(courierName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  if (courierTrackingBase[key]) {
    return `${courierTrackingBase[key]}${awb}`;
  }

  return `${courierTrackingBase.shiprocket}${awb}`;
};

// =====================================================
// SHIPROCKET TOKEN (CACHE KE SAATH)
// =====================================================

let shiprocketToken = null;
let shiprocketTokenTime = 0;

const getShiprocketToken = async () => {
  const nineDays = 9 * 24 * 60 * 60 * 1000;

  if (
    shiprocketToken &&
    Date.now() - shiprocketTokenTime < nineDays
  ) {
    return shiprocketToken;
  }

  const response = await axios.post(
    `${shippingConfig.shiprocket.baseUrl}/auth/login`,
    {
      email: shippingConfig.shiprocket.email,
      password: shippingConfig.shiprocket.password,
    },
    { timeout: 20000 }
  );

  shiprocketToken = response.data?.token;

  if (!shiprocketToken) {
    throw new Error(
      "Shiprocket login failed - token not received"
    );
  }

  shiprocketTokenTime = Date.now();

  return shiprocketToken;
};

// =====================================================
// SHIPROCKET : AUTHORIZED REQUEST
// =====================================================

const shiprocketRequest = async (
  method,
  path,
  data = null
) => {
  const token = await getShiprocketToken();

  const response = await axios({
    method,
    url: `${shippingConfig.shiprocket.baseUrl}${path}`,
    data,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  return response.data;
};

// =====================================================
// ORDER + ADDRESS SE SHIPROCKET PACKAGE BANAO
// =====================================================

const buildShiprocketOrderPayload = ({
  order,
  items = [],
  address = {},
}) => {
  const subTotal = items.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0
  );

  const isCod = String(
    order.payment_method || "COD"
  )
    .toUpperCase()
    .includes("COD");

  return {
    order_id: order.order_number,

    order_date: new Date()
      .toISOString()
      .slice(0, 10),

    pickup_location:
      shippingConfig.shiprocket.pickupLocation,

    billing_customer_name:
      address.full_name || order.customer_name || "Customer",

    billing_address:
      address.address_line || "Address not provided",

    billing_city: address.city || "-",
    billing_pincode: address.pincode || "-",
    billing_state: address.state || "-",
    billing_country: address.country || "India",
    billing_email:
      address.email || order.customer_email || "",
    billing_phone: String(address.phone || "0000000000"),

    shipping_is_billing: true,

    order_items: items.map((item) => ({
      name: item.product_name || "Product",
      sku: `SKU-${item.product_id || item.id}`,
      units: Number(item.quantity || 1),
      selling_price: Number(item.price || 0),
    })),

    payment_method: isCod ? "COD" : "Prepaid",

    sub_total: subTotal,

    length: Number(process.env.PACKAGE_LENGTH_CM || 20),
    breadth: Number(process.env.PACKAGE_BREADTH_CM || 15),
    height: Number(process.env.PACKAGE_HEIGHT_CM || 10),
    weight: Number(
      process.env.DEFAULT_PACKAGE_WEIGHT_KG || 0.5
    ),
  };
};

// =====================================================
// SHIPROCKET : SHIPMENT CREATE + AWB ASSIGN
// =====================================================

const createShiprocketShipment = async ({
  order,
  items,
  address,
}) => {
  const payload = buildShiprocketOrderPayload({
    order,
    items,
    address,
  });

  const created = await shiprocketRequest(
    "post",
    "/orders/create/adhoc",
    payload
  );

  const shipmentId = created?.shipment_id;
  const providerOrderId = created?.order_id;

  let awb = null;
  let courierName = null;
  let labelUrl = null;
  let shippingCost = null;

  // -------------------------------
  // AWB ASSIGN
  // -------------------------------

  try {
    const awbResponse = await shiprocketRequest(
      "post",
      "/courier/assign/awb",
      { shipment_id: shipmentId }
    );

    const awbData = awbResponse?.response?.data;

    awb = awbData?.awb_code || null;
    courierName = awbData?.courier_name || null;
    labelUrl = awbData?.label_url || null;
    shippingCost = awbData?.charges?.rate || null;
  } catch (awbError) {
    console.error(
      "SHIPROCKET AWB ERROR:",
      awbError.response?.data || awbError.message
    );
  }

  const finalCourier =
    courierName || shippingConfig.defaultCourierName;

  return {
    provider: "shiprocket",

    providerOrderId:
      providerOrderId !== undefined
        ? String(providerOrderId)
        : null,

    providerShipmentId:
      shipmentId !== undefined
        ? String(shipmentId)
        : null,

    awbNumber: awb,

    courierName: finalCourier,

    courierCode:
      String(finalCourier)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "") ||
      shippingConfig.defaultCourierCode,

    trackingUrl: buildTrackingUrl(awb, finalCourier),

    labelUrl,
    shippingCost,

    status: awb ? "Created" : "Pending",

    raw: { created },
  };
};

// =====================================================
// MANUAL SHIPMENT (jab provider = manual)
// Admin khud courier + AWB + tracking link deta hai
// =====================================================

const buildManualShipment = ({
  supplier = {},
  courierName,
  awbNumber,
  trackingUrl,
  weightGrams,
  estimatedDelivery,
}) => {
  const finalCourier =
    courierName ||
    supplier.courierName ||
    shippingConfig.defaultCourierName;

  const finalAwb =
    awbNumber || supplier.awbNumber || null;

  return {
    provider: "manual",

    providerOrderId: null,
    providerShipmentId: null,

    courierName: finalCourier,

    courierCode:
      String(finalCourier)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "") ||
      shippingConfig.defaultCourierCode,

    awbNumber: finalAwb,

    trackingUrl:
      trackingUrl ||
      buildTrackingUrl(finalAwb, finalCourier),

    labelUrl: null,
    shippingCost: null,

    weightGrams:
      weightGrams ||
      shippingConfig.defaultWeightGrams,

    status: finalAwb
      ? supplier.status || "Created"
      : "Pending",

    estimatedDelivery:
      estimatedDelivery || null,

    raw: null,
  };
};

// =====================================================
// ORDER TABLE ME TRACKING DETAILS SAVE KARO
// =====================================================

const updateOrderTrackingColumns = async (
  connection,
  orderId,
  shipment
) => {
  const conn =
    connection &&
    typeof connection.execute === "function"
      ? connection
      : promiseDb();

  await conn.execute(
    `
      UPDATE orders
      SET
        courier_name = ?,
        tracking_number = ?,
        tracking_url = ?,
        shipped_at = COALESCE(shipped_at, NOW()),
        updated_at = NOW()
      WHERE id = ?
    `,
    [
      shipment.courierName || null,
      shipment.awbNumber || null,
      shipment.trackingUrl || null,
      orderId,
    ]
  );
};

// =====================================================
// SHIPMENT SAVE (INSERT YA UPDATE)
// =====================================================

const saveShipment = async (
  connection,
  { orderId, userId = null, shipment }
) => {
  const conn =
    connection &&
    typeof connection.execute === "function"
      ? connection
      : promiseDb();

  // ================================
  // PEHLE SE SHIPMENT HAI KYA?
  // ================================

  const [existing] = await conn.execute(
    `
      SELECT id
      FROM shipments
      WHERE order_id = ?
      ORDER BY id DESC
      LIMIT 1
    `,
    [orderId]
  );

  const values = [
    shipment.provider || "manual",
    shipment.providerOrderId || null,
    shipment.providerShipmentId || null,
    shipment.courierName || null,
    shipment.courierCode || null,
    shipment.awbNumber || null,
    shipment.trackingUrl || null,
    shipment.status || "Created",
    shipment.weightGrams ||
      shippingConfig.defaultWeightGrams,
    shipment.shippingCost || null,
    shipment.paymentMode || null,
    shipment.labelUrl || null,
    shipment.estimatedDelivery || null,
  ];

  let shipmentId;

  if (existing.length) {
    shipmentId = existing[0].id;

    await conn.execute(
      `
        UPDATE shipments
        SET
          provider = ?,
          provider_order_id = ?,
          provider_shipment_id = ?,
          courier_name = ?,
          courier_code = ?,
          awb_number = ?,
          tracking_url = ?,
          status = ?,
          weight_grams = ?,
          shipping_cost = ?,
          payment_mode = ?,
          label_url = ?,
          estimated_delivery = ?,
          provider_response = ?,
          updated_at = NOW()
        WHERE id = ?
      `,
      [
        ...values,
        shipment.raw
          ? JSON.stringify(shipment.raw)
          : null,
        shipmentId,
      ]
    );
  } else {
    const [result] = await conn.execute(
      `
        INSERT INTO shipments
        (
          order_id,
          user_id,
          provider,
          provider_order_id,
          provider_shipment_id,
          courier_name,
          courier_code,
          awb_number,
          tracking_url,
          status,
          weight_grams,
          shipping_cost,
          payment_mode,
          label_url,
          estimated_delivery,
          shipped_at,
          provider_response
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
      `,
      [
        orderId,
        userId,
        ...values,
        shipment.raw
          ? JSON.stringify(shipment.raw)
          : null,
      ]
    );

    shipmentId = result.insertId;
  }

  await updateOrderTrackingColumns(
    conn,
    orderId,
    shipment
  );

  return shipmentId;
};

// =====================================================
// SHIPROCKET : TRACKING DATA
// =====================================================

const fetchShiprocketTracking = async (awb) => {
  if (!awb || !isShiprocketEnabled()) {
    return null;
  }

  const data = await shiprocketRequest(
    "get",
    `/courier/track/awb/${awb}`
  );

  const trackingData = data?.tracking_data || {};

  const trackInfo =
    trackingData.shipment_track?.[0] || {};

  const activities =
    trackingData.shipment_track_activities || [];

  return {
    currentStatus:
      trackInfo.current_status ||
      trackInfo.shipment_status ||
      null,

    courierName: trackInfo.courier_name || null,
    awbNumber: trackInfo.awb_code || awb,
    destination: trackInfo.destination || null,
    estimatedDelivery:
      trackInfo.edd || null,

    deliveredDate: trackInfo.delivered_date || null,

    activities: activities.map((activity) => ({
      status: activity.status || null,
      message: activity.activity || null,
      location: activity.location || null,
      eventTime: activity.date || null,
      raw: activity,
    })),
  };
};

// =====================================================
// COURIER STATUS -> ORDER STATUS
// =====================================================

const mapToOrderStatus = (courierStatus) => {
  const status = String(courierStatus || "")
    .trim()
    .toLowerCase();

  if (!status) return null;

  if (status.includes("delivered")) {
    return "Delivered";
  }

  if (
    status.includes("out for delivery") ||
    status.includes("out-for-delivery")
  ) {
    return "Out for Delivery";
  }

  if (
    status.includes("rto") ||
    status.includes("return") ||
    status.includes("undelivered")
  ) {
    return "Return In Transit";
  }

  if (
    status.includes("transit") ||
    status.includes("shipped") ||
    status.includes("picked") ||
    status.includes("dispatched")
  ) {
    return "Shipped";
  }

  return null;
};

// =====================================================
// SHIPMENT STATUS NORMALIZE
// =====================================================

const mapToShipmentStatus = (courierStatus) => {
  const status = String(courierStatus || "")
    .trim()
    .toLowerCase();

  if (!status) return "Created";

  if (status.includes("delivered")) {
    return "Delivered";
  }

  if (status.includes("out for delivery")) {
    return "Out for Delivery";
  }

  if (status.includes("rto")) {
    return "RTO";
  }

  if (status.includes("cancelled")) {
    return "Cancelled";
  }

  if (status.includes("picked")) {
    return "Picked Up";
  }

  if (status.includes("transit")) {
    return "In Transit";
  }

  return "Created";
};

// =====================================================
// SHIPMENT NIKALO
// =====================================================

const getShipmentByOrderId = async (orderId) => {
  const [rows] = await promiseDb().execute(
    `
      SELECT *
      FROM shipments
      WHERE order_id = ?
      ORDER BY id DESC
      LIMIT 1
    `,
    [orderId]
  );

  return rows[0] || null;
};

// =====================================================
// TRACKING EVENTS
// =====================================================

const getTrackingEvents = async (shipmentId) => {
  const [rows] = await promiseDb().execute(
    `
      SELECT
        id,
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
    [shipmentId]
  );

  return rows;
};

// =====================================================
// TRACKING SYNC
//
// Courier se latest status laao, events save karo
// aur order status update karo.
//
// Return:
//   { shipment, events, orderStatus, statusChanged }
// =====================================================

const syncShipmentTracking = async ({
  orderId,
  shipmentId = null,
}) => {
  const conn = promiseDb();

  // ================================
  // SHIPMENT DHOONDO
  // ================================

  const [shipmentRows] = await conn.execute(
    shipmentId
      ? `SELECT * FROM shipments WHERE id = ? LIMIT 1`
      : `SELECT * FROM shipments WHERE order_id = ? ORDER BY id DESC LIMIT 1`,
    [shipmentId || orderId]
  );

  const shipment = shipmentRows[0];

  if (!shipment) {
    throw new Error("Shipment not found");
  }

  const result = {
    shipment,
    events: [],
    orderStatus: null,
    statusChanged: false,
    providerMessage: null,
  };

  // ================================
  // COURIER SE TRACKING LAO
  // ================================

  let tracking = null;

  if (
    shipment.provider === "shiprocket" &&
    shipment.awb_number
  ) {
    try {
      tracking = await fetchShiprocketTracking(
        shipment.awb_number
      );
    } catch (error) {
      result.providerMessage =
        error.response?.data?.message ||
        error.message;

      console.error(
        "TRACKING FETCH ERROR:",
        result.providerMessage
      );
    }
  }

  // Manual shipment me tracking API nahi hoti,
  // isliye sirf shipment record return hoga.

  if (!tracking) {
    result.events = await getTrackingEvents(
      shipment.id
    );

    return result;
  }

  // ================================
  // NAYE EVENTS SAVE KARO
  // ================================

  for (const activity of tracking.activities) {
    const eventTime = activity.eventTime
      ? new Date(activity.eventTime)
      : null;

    const [already] = await conn.execute(
      `
        SELECT id
        FROM shipment_tracking_events
        WHERE
          shipment_id = ?
          AND COALESCE(status, '') = COALESCE(?, '')
          AND COALESCE(message, '') = COALESCE(?, '')
          AND (
            (event_time IS NULL AND ? IS NULL)
            OR event_time = ?
          )
        LIMIT 1
      `,
      [
        shipment.id,
        activity.status,
        activity.message,
        eventTime,
        eventTime,
      ]
    );

    if (already.length) continue;

    await conn.execute(
      `
        INSERT INTO shipment_tracking_events
        (
          shipment_id,
          order_id,
          status,
          location,
          message,
          event_time,
          raw
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        shipment.id,
        shipment.order_id,
        activity.status,
        activity.location,
        activity.message,
        eventTime,
        activity.raw
          ? JSON.stringify(activity.raw)
          : null,
      ]
    );
  }

  // ================================
  // SHIPMENT UPDATE
  // ================================

  const shipmentStatus = mapToShipmentStatus(
    tracking.currentStatus
  );

  const isDelivered =
    shipmentStatus === "Delivered";

  await conn.execute(
    `
      UPDATE shipments
      SET
        status = ?,
        courier_name = COALESCE(?, courier_name),
        last_tracked_at = NOW(),
        delivered_at = ${
          isDelivered
            ? "COALESCE(delivered_at, NOW())"
            : "delivered_at"
        }
      WHERE id = ?
    `,
    [
      shipmentStatus,
      tracking.courierName,
      shipment.id,
    ]
  );

  // ================================
  // ORDER STATUS UPDATE
  // ================================

  const mappedOrderStatus = mapToOrderStatus(
    tracking.currentStatus
  );

  if (mappedOrderStatus) {
    const [orderRows] = await conn.execute(
      `SELECT id, status FROM orders WHERE id = ? LIMIT 1`,
      [shipment.order_id]
    );

    const currentOrder = orderRows[0];

    if (
      currentOrder &&
      currentOrder.status !== mappedOrderStatus &&
      currentOrder.status !== "Cancelled"
    ) {
      await conn.execute(
        `
          UPDATE orders
          SET
            status = ?,
            delivered_at = ${
              mappedOrderStatus === "Delivered"
                ? "COALESCE(delivered_at, NOW())"
                : "delivered_at"
            },
            updated_at = NOW()
          WHERE id = ?
        `,
        [mappedOrderStatus, shipment.order_id]
      );

      // order items bhi update karo
      await conn.execute(
        `
          UPDATE order_items
          SET status = ?
          WHERE order_id = ?
            AND status NOT IN ('Cancelled', 'Returned')
        `,
        [mappedOrderStatus, shipment.order_id]
      );

      await conn.execute(
        `
          INSERT INTO order_status_history
          (order_id, status, message)
          VALUES (?, ?, ?)
        `,
        [
          shipment.order_id,
          mappedOrderStatus,
          `Courier update: ${
            tracking.currentStatus ||
            mappedOrderStatus
          }`,
        ]
      );

      result.orderStatus = mappedOrderStatus;
      result.statusChanged = true;
    }
  }

  // ================================
  // FINAL DATA
  // ================================

  const [updatedRows] = await conn.execute(
    `SELECT * FROM shipments WHERE id = ? LIMIT 1`,
    [shipment.id]
  );

  result.shipment = updatedRows[0] || shipment;

  result.events = await getTrackingEvents(
    shipment.id
  );

  return result;
};

// =====================================================
// USER KE LIYE TRACKING (shipment + events)
// =====================================================

const getTrackingForOrder = async (orderId) => {
  const shipment = await getShipmentByOrderId(
    orderId
  );

  if (!shipment) {
    return {
      shipment: null,
      events: [],
    };
  }

  const events = await getTrackingEvents(
    shipment.id
  );

  return { shipment, events };
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  buildTrackingUrl,
  buildManualShipment,
  createShiprocketShipment,
  saveShipment,
  updateOrderTrackingColumns,
  fetchShiprocketTracking,
  syncShipmentTracking,
  getShipmentByOrderId,
  getTrackingEvents,
  getTrackingForOrder,
  mapToOrderStatus,
  mapToShipmentStatus,
  isShiprocketEnabled,
};
// =====================================================
// APPLE BLOSSOM
// ORDER OPERATIONS MODEL (Step 4)
//
// Return / Refund / Shipment / Invoice ke liye
// read + write queries ek jagah.
// =====================================================

const db = require("../config/db");

const promiseDb = () => db.promise();

const connFrom = (connection) => {
  return connection &&
    typeof connection.execute === "function"
    ? connection
    : promiseDb();
};

// =====================================================
// ORDER + USER + ADDRESS + ITEMS
// Invoice / Shipping / Refund sab ise use karte hain
// =====================================================

const getOrderWithDetails = async (orderId) => {
  const conn = promiseDb();

  const [orderRows] = await conn.execute(
    `
      SELECT
        o.*,
        u.name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone,

        a.full_name AS address_full_name,
        a.phone AS address_phone,
        a.email AS address_email,
        a.address_line,
        a.city,
        a.state,
        a.pincode,
        a.country

      FROM orders o

      LEFT JOIN users u
        ON u.id = o.user_id

      LEFT JOIN addresses a
        ON a.id = o.address_id

      WHERE o.id = ?

      LIMIT 1
    `,
    [orderId]
  );

  const order = orderRows[0];

  if (!order) return null;

  const [items] = await conn.execute(
    `
      SELECT
        id,
        product_id,
        product_name,
        product_image,
        price,
        quantity,
        size,
        color,
        status,
        rma_requested,
        rma_reason,
        rma_status,
        rma_requested_at,
        refund_amount
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC
    `,
    [orderId]
  );

  // DISCOUNT: DB me column nahi hai,
  // isliye subtotal + delivery - total se nikalte hain

  const subtotal = Number(order.subtotal || 0);
  const delivery = Number(order.delivery_charge || 0);
  const total = Number(order.total_amount || 0);

  const couponDiscount = Math.max(
    0,
    Number((subtotal + delivery - total).toFixed(2))
  );

  return {
    ...order,

    subtotal,
    delivery_charge: delivery,
    total_amount: total,
    coupon_discount: couponDiscount,

    items,

    address: {
      full_name: order.address_full_name,
      phone: order.address_phone,
      email: order.address_email,
      address_line: order.address_line,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      country: order.country,
    },
  };
};

// -----------------------------------------------------
// ORDER ITEM STATUS UPDATE
// -----------------------------------------------------

const updateOrderItemStatus = async (
  connection,
  {
    itemId,
    orderId,
    status,
    rmaStatus = null,
    adminNote = null,
    adminId = null,
  }
) => {
  const conn = connFrom(connection);

  await conn.execute(
    `
      UPDATE order_items
      SET
        status = ?,
        rma_status = COALESCE(?, rma_status),
        rma_admin_note = COALESCE(?, rma_admin_note),
        rma_reviewed_by = COALESCE(?, rma_reviewed_by),
        rma_reviewed_at = NOW()
      WHERE id = ?
        AND order_id = ?
    `,
    [status, rmaStatus, adminNote, adminId, itemId, orderId]
  );
};

// =====================================================
// RETURN REQUESTS : USER KE
// =====================================================

const getUserReturnRequests = async (userId) => {
  const [rows] = await promiseDb().execute(
    `
      SELECT
        r.*,
        o.order_number,
        o.status AS order_status,
        o.total_amount
      FROM order_returns r

      INNER JOIN orders o
        ON o.id = r.order_id

      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `,
    [userId]
  );

  return rows;
};

// =====================================================
// RETURN REQUESTS : SAARE (ADMIN)
// =====================================================

const getAllReturnRequests = async ({
  status = null,
  limit = 100,
} = {}) => {
  const conditions = ["1 = 1"];
  const values = [];

  if (status) {
    conditions.push("r.status = ?");
    values.push(status);
  }

  const safeLimit = Math.min(
    Math.max(Number(limit) || 100, 1),
    500
  );

  const [rows] = await promiseDb().execute(
    `
      SELECT
        r.*,
        o.order_number,
        o.status AS order_status,
        o.payment_method,
        o.payment_status,
        o.total_amount,
        o.user_id AS order_user_id,

        u.name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone

      FROM order_returns r

      INNER JOIN orders o
        ON o.id = r.order_id

      LEFT JOIN users u
        ON u.id = r.user_id

      WHERE ${conditions.join(" AND ")}

      ORDER BY
        FIELD(r.status, 'Pending', 'Approved', 'Picked Up', 'Refunded', 'Rejected'),
        r.created_at DESC

      LIMIT ${safeLimit}
    `,
    values
  );

  return rows;
};

// =====================================================
// RETURN REQUEST : EK ROW
// =====================================================

const getReturnById = async (returnId) => {
  const [rows] = await promiseDb().execute(
    `
      SELECT
        r.*,
        o.order_number,
        o.status AS order_status,
        o.payment_method,
        o.payment_status,
        o.total_amount,

        u.name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone

      FROM order_returns r

      INNER JOIN orders o
        ON o.id = r.order_id

      LEFT JOIN users u
        ON u.id = r.user_id

      WHERE r.id = ?
      LIMIT 1
    `,
    [returnId]
  );

  return rows[0] || null;
};

// =====================================================
// RETURN REQUEST : ORDER ITEM KE HISAB SE
// =====================================================

const getReturnByItemId = async (orderItemId) => {
  const [rows] = await promiseDb().execute(
    `
      SELECT *
      FROM order_returns
      WHERE order_item_id = ?
      ORDER BY id DESC
      LIMIT 1
    `,
    [orderItemId]
  );

  return rows[0] || null;
};

// =====================================================
// RETURN REQUEST : NAYA BANAO
// =====================================================

const createReturnRequest = async (
  connection,
  {
    orderId,
    orderItemId,
    userId,
    productId = null,
    productName = null,
    quantity = 1,
    reason,
    customerNote = null,
    image = null,
  }
) => {
  const conn = connFrom(connection);

  const [result] = await conn.execute(
    `
      INSERT INTO order_returns
      (
        order_id,
        order_item_id,
        user_id,
        product_id,
        product_name,
        quantity,
        reason,
        customer_note,
        image,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `,
    [
      orderId,
      orderItemId,
      userId,
      productId,
      productName,
      quantity,
      reason,
      customerNote,
      image,
    ]
  );

  return result.insertId;
};

// =====================================================
// RETURN REQUEST : STATUS UPDATE
// =====================================================

const updateReturnStatus = async (
  connection,
  {
    returnId,
    status,
    adminNote = null,
    adminId = null,
    pickupDate = null,
    pickedUp = false,
    refundAmount = null,
    refundMethod = null,
  }
) => {
  const conn = connFrom(connection);

  await conn.execute(
    `
      UPDATE order_returns
      SET
        status = ?,
        admin_note = COALESCE(?, admin_note),
        reviewed_by = COALESCE(?, reviewed_by),
        reviewed_at = NOW(),
        pickup_date = COALESCE(?, pickup_date),
        picked_up_at = ${
          pickedUp ? "COALESCE(picked_up_at, NOW())" : "picked_up_at"
        },
        refund_amount = COALESCE(?, refund_amount),
        refund_method = COALESCE(?, refund_method),
        updated_at = NOW()
      WHERE id = ?
    `,
    [
      status,
      adminNote,
      adminId,
      pickupDate,
      refundAmount,
      refundMethod,
      returnId,
    ]
  );
};

// =====================================================
// ORDER STATUS HISTORY
// =====================================================

const addOrderStatusHistory = async (
  connection,
  { orderId, status, message }
) => {
  const conn = connFrom(connection);

  await conn.execute(
    `
      INSERT INTO order_status_history
      (order_id, status, message)
      VALUES (?, ?, ?)
    `,
    [orderId, status, message]
  );
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getOrderWithDetails,
  updateOrderItemStatus,
  getUserReturnRequests,
  getAllReturnRequests,
  getReturnById,
  getReturnByItemId,
  createReturnRequest,
  updateReturnStatus,
  addOrderStatusHistory,
};
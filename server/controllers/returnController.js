// =====================================================
// APPLE BLOSSOM
// RETURN CONTROLLER  (Feature 1 & 2)
//
// USER
//   POST /api/returns                -> return request
//   GET  /api/returns/my             -> apne returns
//
// ADMIN
//   GET   /api/returns               -> saare returns
//   PATCH /api/returns/:id/approve   -> approve
//   PATCH /api/returns/:id/reject    -> reject
//   PATCH /api/returns/:id/picked-up -> pickup done
//   POST  /api/returns/:id/refund    -> refund (Feature 3)
// =====================================================

const db = require("../config/db");

const {
  notifySafe,
} = require("../services/notificationService");

const {
  processRefund,
  REFUND_METHODS,
} = require("../services/refundService");

const {
  getOrderWithDetails,
  getUserReturnRequests,
  getAllReturnRequests,
  getReturnById,
  createReturnRequest,
  updateReturnStatus,
  addOrderStatusHistory,
} = require("../models/orderOpsModel");

const promiseDb = () => db.promise();

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?.user_id ||
    req.user?.userId ||
    null
  );
};

const adminIdOf = (req) => getUserId(req);

const RETURN_WINDOW_DAYS = Number(
  process.env.RETURN_WINDOW_DAYS || 7
);

// =====================================================
// HELPER : ORDER ITEM
// =====================================================

const getOrderItem = async (orderId, itemId) => {
  const [rows] = await promiseDb().execute(
    `
      SELECT *
      FROM order_items
      WHERE id = ?
        AND order_id = ?
      LIMIT 1
    `,
    [itemId, orderId]
  );

  return rows[0] || null;
};

// =====================================================
// HELPER : RETURNABLE OR NOT
// =====================================================

const checkReturnable = ({ order, item }) => {
  if (!order) {
    return "Order not found";
  }

  if (!item) {
    return "Order item not found";
  }

  if (item.status !== "Delivered") {
    return "Only delivered products can be returned";
  }

  if (
    Number(item.rma_requested) === 1 ||
    item.rma_status
  ) {
    return "Return request already submitted for this product";
  }

  // Return window check
  const deliveredAt = order.delivered_at
    ? new Date(order.delivered_at)
    : new Date(order.updated_at || order.created_at);

  const daysPassed =
    (Date.now() - deliveredAt.getTime()) /
    (1000 * 60 * 60 * 24);

  if (daysPassed > RETURN_WINDOW_DAYS) {
    return `Return window of ${RETURN_WINDOW_DAYS} days is over`;
  }

  return null;
};

// =====================================================
// HELPER : REFUND AMOUNT CALCULATE
// =====================================================

const calculateRefundAmount = ({
  itemPrice = 0,
  quantity = 1,
  orderTotal = 0,
}) => {
  const price = Number(itemPrice || 0);
  const qty = Number(quantity || 1);

  if (price > 0) {
    return Number((price * qty).toFixed(2));
  }

  return Number(Number(orderTotal || 0).toFixed(2));
};

// =====================================================
// USER : RETURN REQUEST BANAO
// POST /api/returns
// =====================================================

exports.createReturn = async (req, res) => {
  let connection;

  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const orderId = Number(
      req.body?.orderId || req.body?.order_id
    );

    const itemId = Number(
      req.body?.itemId ||
        req.body?.item_id ||
        req.body?.orderItemId
    );

    const reason = String(
      req.body?.reason || ""
    ).trim();

    const note = req.body?.note
      ? String(req.body.note).trim()
      : null;

    const quantity = Number(req.body?.quantity || 1);

    if (
      !orderId ||
      Number.isNaN(orderId) ||
      !itemId ||
      Number.isNaN(itemId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Order id and item id are required",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Return reason is required",
      });
    }

    // -------------------------------
    // ORDER USER KA HAI?
    // -------------------------------

    const order = await getOrderWithDetails(orderId);

    if (!order || order.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const item = await getOrderItem(orderId, itemId);

    const notReturnable = checkReturnable({
      order,
      item,
    });

    if (notReturnable) {
      return res.status(400).json({
        success: false,
        message: notReturnable,
      });
    }

    // -------------------------------
    // DB WORK (TRANSACTION)
    // -------------------------------

    connection = promiseDb();

    await connection.beginTransaction();

    const returnId = await createReturnRequest(
      connection,
      {
        orderId,
        orderItemId: item.id,
        userId,
        productId: item.product_id,
        productName: item.product_name,
        quantity:
          quantity > 0
            ? Math.min(quantity, item.quantity)
            : 1,
        reason,
        customerNote: note,
      }
    );

    await connection.execute(
      `
        UPDATE order_items
        SET
          rma_requested = 1,
          rma_reason = ?,
          rma_status = 'Requested',
          rma_requested_at = NOW(),
          rma_quantity = ?
        WHERE id = ?
      `,
      [reason, quantity || 1, item.id]
    );

    await addOrderStatusHistory(connection, {
      orderId,
      status: "Return Requested",
      message: `Return requested for ${item.product_name}. Reason: ${reason}`,
    });

    await connection.commit();

    // -------------------------------
    // CUSTOMER KO NOTIFY
    // -------------------------------

    await notifySafe({
      event: "return_requested",
      order,
      user: {
        id: userId,
        email: order.customer_email,
        phone:
          order.customer_phone ||
          order.address?.phone,
      },
      returnId,
    });

    return res.status(201).json({
      success: true,
      message: "Return request submitted successfully",
      returnId,
      returnRequest: {
        id: returnId,
        orderId,
        itemId: item.id,
        productName: item.product_name,
        status: "Pending",
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "ROLLBACK ERROR:",
          rollbackError.message
        );
      }
    }

    console.error("CREATE RETURN ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create return request",
    });
  }
};

// =====================================================
// USER : APNE RETURNS
// GET /api/returns/my
// =====================================================

exports.getMyReturns = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const returns = await getUserReturnRequests(userId);

    return res.json({
      success: true,
      returns,
    });
  } catch (error) {
    console.error("GET MY RETURNS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load returns",
    });
  }
};

// =====================================================
// ADMIN : SAARE RETURNS
// GET /api/returns?status=Pending
// =====================================================

exports.getAllReturns = async (req, res) => {
  try {
    const returns = await getAllReturnRequests({
      status: req.query?.status || null,
      limit: req.query?.limit || 100,
    });

    return res.json({
      success: true,
      returns,
    });
  } catch (error) {
    console.error("GET ALL RETURNS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load return requests",
    });
  }
};

// =====================================================
// ADMIN : RETURN APPROVE
// PATCH /api/returns/:id/approve
//
// body: { adminNote, refundAmount, refundMethod, pickupDate }
// =====================================================

exports.approveReturn = async (req, res) => {
  try {
    const returnId = Number(req.params.id);
    const adminId = adminIdOf(req);

    const returnRow = await getReturnById(returnId);

    if (!returnRow) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    if (
      !["Pending", "Approved"].includes(returnRow.status)
    ) {
      return res.status(400).json({
        success: false,
        message: `Return request is already ${returnRow.status}`,
      });
    }

    const order = await getOrderWithDetails(
      returnRow.order_id
    );

    const item = (order?.items || []).find(
      (row) => row.id === returnRow.order_item_id
    );

    const refundAmount =
      req.body?.refundAmount !== undefined
        ? Number(req.body.refundAmount)
        : calculateRefundAmount({
            itemPrice: item?.price,
            quantity: returnRow.quantity,
            orderTotal: order?.total_amount,
          });

    // -------------------------------
    // RETURN STATUS UPDATE
    // -------------------------------

    await updateReturnStatus(null, {
      returnId,
      status: "Approved",
      adminNote: req.body?.adminNote || null,
      adminId,
      pickupDate: req.body?.pickupDate || null,
      refundAmount,
      refundMethod: req.body?.refundMethod || null,
    });

    // -------------------------------
    // ORDER ITEM UPDATE
    // -------------------------------

    await promiseDb().execute(
      `
        UPDATE order_items
        SET
          rma_status = 'Approved',
          rma_admin_note = ?,
          rma_reviewed_by = ?,
          rma_reviewed_at = NOW(),
          return_pickup_date = ?
        WHERE id = ?
      `,
      [
        req.body?.adminNote || null,
        adminId,
        req.body?.pickupDate || null,
        returnRow.order_item_id,
      ]
    );

    // -------------------------------
    // STATUS HISTORY
    // -------------------------------

    await addOrderStatusHistory(null, {
      orderId: returnRow.order_id,
      status: "Return Approved",
      message: `Return approved for ${returnRow.product_name}. Refund amount Rs ${Number(
        refundAmount
      ).toFixed(2)}`,
    });

    // -------------------------------
    // CUSTOMER KO NOTIFY
    // -------------------------------

    await notifySafe({
      event: "return_approved",
      order,
      user: {
        id: returnRow.user_id,
        email:
          order?.customer_email ||
          returnRow.customer_email,
        phone:
          order?.customer_phone ||
          returnRow.customer_phone,
      },
      extra: {
        refundAmount,
        refundMethod: req.body?.refundMethod || null,
        adminNote: req.body?.adminNote || null,
      },
      returnId,
    });

    return res.json({
      success: true,
      message: "Return request approved",
      returnId,
      refundAmount,
    });
  } catch (error) {
    console.error("APPROVE RETURN ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to approve return",
    });
  }
};

// =====================================================
// ADMIN : RETURN REJECT
// PATCH /api/returns/:id/reject
// body: { adminNote / reason }
// =====================================================

exports.rejectReturn = async (req, res) => {
  try {
    const returnId = Number(req.params.id);
    const adminId = adminIdOf(req);

    const reason = String(
      req.body?.adminNote || req.body?.reason || ""
    ).trim();

    const returnRow = await getReturnById(returnId);

    if (!returnRow) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    if (returnRow.status === "Refunded") {
      return res.status(400).json({
        success: false,
        message:
          "Refund is already completed for this return",
      });
    }

    await updateReturnStatus(null, {
      returnId,
      status: "Rejected",
      adminNote: reason || "Rejected by admin",
      adminId,
    });

    // item wapas normal karo (RMA hatado)
    await promiseDb().execute(
      `
        UPDATE order_items
        SET
          rma_requested = 0,
          rma_status = 'Rejected',
          rma_admin_note = ?,
          rma_reviewed_by = ?,
          rma_reviewed_at = NOW()
        WHERE id = ?
      `,
      [
        reason || "Rejected by admin",
        adminId,
        returnRow.order_item_id,
      ]
    );

    await addOrderStatusHistory(null, {
      orderId: returnRow.order_id,
      status: "Return Rejected",
      message: `Return rejected for ${returnRow.product_name}. ${reason}`,
    });

    const order = await getOrderWithDetails(
      returnRow.order_id
    );

    await notifySafe({
      event: "return_rejected",
      order,
      user: {
        id: returnRow.user_id,
        email:
          order?.customer_email ||
          returnRow.customer_email,
        phone:
          order?.customer_phone ||
          returnRow.customer_phone,
      },
      extra: { adminNote: reason },
      returnId,
    });

    return res.json({
      success: true,
      message: "Return request rejected",
      returnId,
    });
  } catch (error) {
    console.error("REJECT RETURN ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to reject return",
    });
  }
};

// =====================================================
// ADMIN : PICKUP DONE
// PATCH /api/returns/:id/picked-up
// =====================================================

exports.markReturnPickedUp = async (req, res) => {
  try {
    const returnId = Number(req.params.id);
    const adminId = adminIdOf(req);

    const returnRow = await getReturnById(returnId);

    if (!returnRow) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    if (
      !["Approved", "Pending"].includes(returnRow.status)
    ) {
      return res.status(400).json({
        success: false,
        message: `Return is already ${returnRow.status}`,
      });
    }

    await updateReturnStatus(null, {
      returnId,
      status: "Picked Up",
      adminNote: req.body?.adminNote || null,
      adminId,
      pickedUp: true,
    });

    await promiseDb().execute(
      `
        UPDATE order_items
        SET
          rma_status = 'Picked Up',
          rma_admin_note = COALESCE(?, rma_admin_note),
          rma_reviewed_by = ?,
          rma_reviewed_at = NOW()
        WHERE id = ?
      `,
      [
        req.body?.adminNote || null,
        adminId,
        returnRow.order_item_id,
      ]
    );

    await addOrderStatusHistory(null, {
      orderId: returnRow.order_id,
      status: "Return Picked Up",
      message: `Returned item picked up for ${returnRow.product_name}`,
    });

    const order = await getOrderWithDetails(
      returnRow.order_id
    );

    await notifySafe({
      event: "return_picked_up",
      order,
      user: {
        id: returnRow.user_id,
        email:
          order?.customer_email ||
          returnRow.customer_email,
        phone:
          order?.customer_phone ||
          returnRow.customer_phone,
      },
      returnId,
    });

    return res.json({
      success: true,
      message: "Return marked as picked up",
      returnId,
    });
  } catch (error) {
    console.error("PICKUP RETURN ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to update pickup",
    });
  }
};

// =====================================================
// ADMIN : ACTUAL REFUND
// POST /api/returns/:id/refund
//
// body: {
//   method: wallet | razorpay | manual | cod
//   referenceId (manual ke liye UTR)
//   amount (optional - default approved amount)
//   notes
// }
// =====================================================

exports.processReturnRefund = async (req, res) => {
  try {
    const returnId = Number(req.params.id);
    const adminId = adminIdOf(req);

    const returnRow = await getReturnById(returnId);

    if (!returnRow) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    if (returnRow.status === "Rejected") {
      return res.status(400).json({
        success: false,
        message:
          "Rejected return cannot be refunded",
      });
    }

    if (returnRow.status === "Refunded") {
      return res.status(400).json({
        success: false,
        message: "Refund already completed",
      });
    }

    // -------------------------------
    // ORDER + ITEM
    // -------------------------------

    const order = await getOrderWithDetails(
      returnRow.order_id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const item = (order.items || []).find(
      (row) => row.id === returnRow.order_item_id
    );

    // -------------------------------
    // AMOUNT
    // -------------------------------

    const amount =
      req.body?.amount !== undefined
        ? Number(req.body.amount)
        : Number(returnRow.refund_amount) > 0
          ? Number(returnRow.refund_amount)
          : calculateRefundAmount({
              itemPrice: item?.price,
              quantity: returnRow.quantity,
              orderTotal: order.total_amount,
            });

    // -------------------------------
    // METHOD
    // -------------------------------

    const method = String(
      req.body?.method || REFUND_METHODS.wallet
    ).toLowerCase();

    const allowedMethods = Object.values(
      REFUND_METHODS
    );

    if (!allowedMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid refund method. Allowed: ${allowedMethods.join(
          ", "
        )}`,
      });
    }

    // -------------------------------
    // REFUND
    // -------------------------------

    const refundResult = await processRefund({
      order,
      user: {
        id: returnRow.user_id,
        email:
          order.customer_email ||
          returnRow.customer_email,
        phone:
          order.customer_phone ||
          returnRow.customer_phone,
      },
      returnRow,
      items: item ? [item] : [],
      amount,
      method,
      adminId,
      referenceId: req.body?.referenceId || null,
      notes:
        req.body?.notes ||
        `Return #${returnId} refund`,
    });

    return res.json({
      success: true,
      message: `Refund of Rs ${Number(amount).toFixed(
        2
      )} processed via ${method}`,
      returnId,
      ...refundResult,
    });
  } catch (error) {
    console.error("RETURN REFUND ERROR:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Refund failed",
      refundId: error.refundId || null,
    });
  }
};

// =====================================================
// RETURN SETTINGS
// GET /api/returns/settings
// =====================================================

exports.getReturnSettings = async (req, res) => {
  return res.json({
    success: true,
    settings: {
      returnWindowDays: RETURN_WINDOW_DAYS,
      refundMethods: Object.values(REFUND_METHODS),
    },
  });
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createReturn: exports.createReturn,
  getMyReturns: exports.getMyReturns,
  getAllReturns: exports.getAllReturns,
  approveReturn: exports.approveReturn,
  rejectReturn: exports.rejectReturn,
  markReturnPickedUp: exports.markReturnPickedUp,
  processReturnRefund: exports.processReturnRefund,
  getReturnSettings: exports.getReturnSettings,
  checkReturnable,
  calculateRefundAmount,
  RETURN_WINDOW_DAYS,
};
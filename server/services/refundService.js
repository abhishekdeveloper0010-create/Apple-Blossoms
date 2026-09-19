// =====================================================
// APPLE BLOSSOM
// REFUND SERVICE  (Feature 3)
//
// method = wallet   -> user ke wallet me credit
// method = razorpay -> Razorpay Refund API
// method = manual   -> admin UTR / reference daalta hai
// method = cod      -> cash / bank transfer record
//
// Har refund "refunds" table me permanent save hota hai.
// =====================================================

const db = require("../config/db");
const razorpay = require("../config/razorpay");

const {
  notifySafe,
} = require("./notificationService");

const promiseDb = () => db.promise();

const REFUND_METHODS = {
  wallet: "wallet",
  razorpay: "razorpay",
  manual: "manual",
  cod: "cod",
};

// =====================================================
// ORDER KA CAPTURED RAZORPAY PAYMENT
// =====================================================

const getCapturedPayment = async (orderId) => {
  const [rows] = await promiseDb().execute(
    `
      SELECT
        id,
        razorpay_payment_id,
        amount,
        status
      FROM payments
      WHERE
        order_id = ?
        AND razorpay_payment_id IS NOT NULL
      ORDER BY id DESC
      LIMIT 1
    `,
    [orderId]
  );

  return rows[0] || null;
};

// =====================================================
// WALLET ME REFUND CREDIT
// =====================================================

const creditWallet = async (
  connection,
  {
    userId,
    amount,
    description,
    referenceId = null,
  }
) => {
  const conn =
    connection &&
    typeof connection.execute === "function"
      ? connection
      : promiseDb();

  const refundAmount = Number(amount);

  // -------------------------------
  // WALLET ROW BANAO / UPDATE KARO
  // -------------------------------

  await conn.execute(
    `
      INSERT INTO wallet
        (user_id, balance, total_credited)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        balance = balance + VALUES(balance),
        total_credited =
          total_credited + VALUES(total_credited)
    `,
    [userId, refundAmount, refundAmount]
  );

  // -------------------------------
  // TRANSACTION ENTRY
  // -------------------------------

  await conn.execute(
    `
      INSERT INTO wallet_transactions
      (
        user_id,
        type,
        amount,
        description,
        reference_type,
        reference_id,
        balance_after
      )
      VALUES (
        ?,
        'credit',
        ?,
        ?,
        'refund',
        ?,
        (SELECT balance FROM wallet WHERE user_id = ?)
      )
    `,
    [
      userId,
      refundAmount,
      description || "Refund credited to wallet",
      referenceId,
      userId,
    ]
  );

  const [walletRows] = await conn.execute(
    `SELECT balance FROM wallet WHERE user_id = ?`,
    [userId]
  );

  return {
    balance: walletRows[0]?.balance || 0,
  };
};

// =====================================================
// RAZORPAY REFUND (GATEWAY API)
// =====================================================

const createRazorpayRefund = async ({
  paymentId,
  amount,
  notes = {},
}) => {
  if (!paymentId) {
    throw new Error(
      "Razorpay payment id is not available for this order"
    );
  }

  const refund = await razorpay.payments.refund(
    paymentId,
    {
      amount: Math.round(Number(amount) * 100),
      speed: "normal",
      notes,
    }
  );

  return {
    id: refund.id,
    status: refund.status,
    amount: Number(refund.amount || 0) / 100,
    raw: refund,
  };
};

// =====================================================
// REFUND RECORD : CREATE
// =====================================================

const createRefundRecord = async (
  connection,
  {
    orderId,
    returnId = null,
    userId,
    amount,
    method,
    notes = null,
    processedBy = null,
  }
) => {
  const conn =
    connection &&
    typeof connection.execute === "function"
      ? connection
      : promiseDb();

  const [result] = await conn.execute(
    `
      INSERT INTO refunds
      (
        order_id,
        return_id,
        user_id,
        amount,
        method,
        status,
        notes,
        processed_by,
        processed_at
      )
      VALUES (?, ?, ?, ?, ?, 'Processing', ?, ?, NOW())
    `,
    [
      orderId,
      returnId,
      userId,
      Number(amount),
      method,
      notes,
      processedBy,
    ]
  );

  return result.insertId;
};

// =====================================================
// REFUND RECORD : UPDATE
// =====================================================

const updateRefundRecord = async (
  refundId,
  {
    status,
    referenceId = null,
    razorpayPaymentId = null,
    razorpayRefundId = null,
    errorMessage = null,
  }
) => {
  await promiseDb().execute(
    `
      UPDATE refunds
      SET
        status = ?,
        reference_id = COALESCE(?, reference_id),
        razorpay_payment_id =
          COALESCE(?, razorpay_payment_id),
        razorpay_refund_id =
          COALESCE(?, razorpay_refund_id),
        error_message = ?,
        updated_at = NOW()
      WHERE id = ?
    `,
    [
      status,
      referenceId,
      razorpayPaymentId,
      razorpayRefundId,
      errorMessage,
      refundId,
    ]
  );
};

// =====================================================
// STOCK WAPAS ADD KARO (return / cancellation par)
// =====================================================

const restoreStock = async (
  connection,
  items = []
) => {
  const conn =
    connection &&
    typeof connection.execute === "function"
      ? connection
      : promiseDb();

  for (const item of items) {
    const productId =
      item.product_id || item.productId;

    const quantity = Number(
      item.quantity || item.rma_quantity || 1
    );

    if (!productId || quantity <= 0) continue;

    await conn.execute(
      `
        UPDATE products
        SET stock = stock + ?
        WHERE id = ?
      `,
      [quantity, productId]
    );
  }
};

// =====================================================
// REFUND KE BAAAD KE SAARE DB UPDATES
// =====================================================

const applyRefundEffects = async ({
  order,
  returnRow,
  items = [],
  amount,
  method,
  referenceId,
  adminId,
}) => {
  const conn = promiseDb();

  const refundAmount = Number(amount);

  // ================================
  // RETURN ROW UPDATE
  // ================================

  if (returnRow?.id) {
    await conn.execute(
      `
        UPDATE order_returns
        SET
          status = 'Refunded',
          refund_amount = ?,
          refund_method = ?,
          refund_status = 'Completed',
          refund_reference = ?,
          refunded_at = NOW(),
          updated_at = NOW()
        WHERE id = ?
      `,
      [
        refundAmount,
        method,
        referenceId || null,
        returnRow.id,
      ]
    );
  }

  // ================================
  // ORDER ITEMS UPDATE
  // ================================

  const itemIds = items
    .map((item) => item.id)
    .filter(Boolean);

  if (itemIds.length) {
    const perItem = refundAmount / itemIds.length;

    await conn.execute(
      `
        UPDATE order_items
        SET
          status = 'Returned',
          rma_status = 'Refunded',
          refund_amount = ?,
          returned_at = NOW()
        WHERE id IN (${itemIds.map(() => "?").join(",")})
      `,
      [perItem, ...itemIds]
    );
  }

  // ================================
  // ORDER REFUND SUMMARY
  // ================================

  await conn.execute(
    `
      UPDATE orders
      SET
        refund_amount = refund_amount + ?,
        refund_status = 'Completed',
        updated_at = NOW()
      WHERE id = ?
    `,
    [refundAmount, order.id]
  );

  // ================================
  // STOCK WAPAS
  // ================================

  await restoreStock(conn, items);

  // ================================
  // STATUS HISTORY
  // ================================

  await conn.execute(
    `
      INSERT INTO order_status_history
      (order_id, status, message)
      VALUES (?, ?, ?)
    `,
    [
      order.id,
      "Refund Completed",
      `Refund of Rs ${refundAmount.toFixed(2)} completed via ${method}${
        adminId ? ` (admin #${adminId})` : ""
      }`,
    ]
  );

  return true;
};

// =====================================================
// MAIN : REFUND PROCESS
//
// method = wallet | razorpay | manual | cod
// =====================================================

const processRefund = async ({
  order,
  user = {},
  returnRow = null,
  items = [],
  amount,
  method = REFUND_METHODS.wallet,
  adminId = null,
  referenceId = null,
  notes = null,
  notify = true,
}) => {
  const refundAmount = Number(amount);

  if (!order?.id) {
    throw new Error("Order is required for refund");
  }

  if (!refundAmount || refundAmount <= 0) {
    throw new Error(
      "Refund amount must be greater than 0"
    );
  }

  const userId = order.user_id;
  const conn = promiseDb();

  // ================================
  // REFUND RECORD BANAO
  // ================================

  const refundId = await createRefundRecord(conn, {
    orderId: order.id,
    returnId: returnRow?.id || null,
    userId,
    amount: refundAmount,
    method,
    notes,
    processedBy: adminId,
  });

  let finalStatus = "Completed";
  let finalReference = referenceId || null;
  let razorpayRefundId = null;
  let razorpayPaymentId = null;
  let walletBalance = null;

  // ================================
  // METHOD KE HISAB SE REFUND
  // ================================

  try {
    // -------------------------------
    // WALLET
    // -------------------------------

    if (method === REFUND_METHODS.wallet) {
      const wallet = await creditWallet(conn, {
        userId,
        amount: refundAmount,
        description: `Refund for order ${order.order_number}`,
        referenceId: returnRow?.id || order.id,
      });

      walletBalance = wallet.balance;

      finalReference =
        finalReference ||
        `WALLET-${order.order_number}`;
    }

    // -------------------------------
    // RAZORPAY
    // -------------------------------

    else if (method === REFUND_METHODS.razorpay) {
      const payment = await getCapturedPayment(order.id);

      razorpayPaymentId =
        payment?.razorpay_payment_id || null;

      const refund = await createRazorpayRefund({
        paymentId: razorpayPaymentId,
        amount: refundAmount,
        notes: {
          orderNumber: order.order_number,
          returnId: returnRow?.id || null,
          reason: notes || "Return refund",
        },
      });

      razorpayRefundId = refund.id;

      finalReference = finalReference || refund.id;

      finalStatus =
        String(refund.status).toLowerCase() ===
        "processed"
          ? "Completed"
          : "Processing";
    }

    // -------------------------------
    // MANUAL / COD / UPI
    // -------------------------------

    else {
      if (!finalReference) {
        throw new Error(
          "Reference / UTR number is required for manual refund"
        );
      }

      finalStatus = "Completed";
    }
  } catch (error) {
    await updateRefundRecord(refundId, {
      status: "Failed",
      errorMessage: error.message,
    });

    const failedError = new Error(
      error.message || "Refund failed"
    );

    failedError.refundId = refundId;

    throw failedError;
  }

  // ================================
  // REFUND RECORD UPDATE
  // ================================

  await updateRefundRecord(refundId, {
    status: finalStatus,
    referenceId: finalReference,
    razorpayPaymentId,
    razorpayRefundId,
  });

  // ================================
  // BAAKI DB UPDATES
  // ================================

  await applyRefundEffects({
    order,
    returnRow,
    items,
    amount: refundAmount,
    method,
    referenceId: finalReference,
    adminId,
  });

  // ================================
  // CUSTOMER KO NOTIFY
  // ================================

  if (notify) {
    await notifySafe({
      event: "refund_completed",
      order: {
        ...order,
        refund_amount: refundAmount,
        refund_method: method,
        refund_reference: finalReference,
      },
      user,
      returnId: returnRow?.id || null,
    });
  }

  return {
    success: true,
    refundId,
    amount: refundAmount,
    method,
    status: finalStatus,
    reference: finalReference,
    razorpayPaymentId,
    razorpayRefundId,
    walletBalance,
  };
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  REFUND_METHODS,
  processRefund,
  creditWallet,
  createRazorpayRefund,
  getCapturedPayment,
  createRefundRecord,
  updateRefundRecord,
  restoreStock,
  applyRefundEffects,
};
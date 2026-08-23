const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const db = require("../config/db");

// ==========================================
// CREATE RAZORPAY PAYMENT ORDER
// ==========================================

const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user?.id;

    const { orderId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // --------------------------------------
    // GET ORDER
    // --------------------------------------

    const [orders] = await db.query(
      `
      SELECT *
      FROM orders
      WHERE id = ?
      AND user_id = ?
      LIMIT 1
      `,
      [orderId, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orders[0];

    // --------------------------------------
    // ALREADY PAID CHECK
    // --------------------------------------

    if (order.payment_status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    // --------------------------------------
    // DATABASE AMOUNT
    // --------------------------------------

    const amount = Number(order.total_amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    // --------------------------------------
    // CREATE RAZORPAY ORDER
    // --------------------------------------

    const razorpayOrder =
      await razorpay.orders.create({
        amount: Math.round(amount * 100),

        currency: "INR",

        receipt: `AB-${order.order_number}`,

        notes: {
          appleBlossomOrderId:
            String(order.id),

          orderNumber:
            order.order_number,

          userId:
            String(userId),
        },
      });

    // --------------------------------------
    // UPDATE APPLE BLOSSOM ORDER
    // --------------------------------------

    await db.query(
      `
      UPDATE orders
      SET
        payment_method = 'upi',
        payment_status = 'pending',
        razorpay_order_id = ?
      WHERE id = ?
      AND user_id = ?
      `,
      [
        razorpayOrder.id,
        order.id,
        userId,
      ]
    );

    // --------------------------------------
    // CREATE PAYMENT RECORD
    // --------------------------------------

    await db.query(
      `
      INSERT INTO payments
      (
        order_id,
        razorpay_order_id,
        amount,
        currency,
        method,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        order.id,
        razorpayOrder.id,
        amount,
        "INR",
        "upi",
        "created",
      ]
    );

    // --------------------------------------
    // RESPONSE
    // --------------------------------------

    return res.status(200).json({
      success: true,

      key: process.env.RAZORPAY_KEY_ID,

      razorpayOrderId:
        razorpayOrder.id,

      amount:
        razorpayOrder.amount,

      currency:
        razorpayOrder.currency,

      orderId:
        order.id,

      orderNumber:
        order.order_number,
    });

  } catch (error) {
    console.error(
      "CREATE PAYMENT ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create payment order",
    });
  }
};


// ==========================================
// VERIFY PAYMENT
// ==========================================

const verifyPayment = async (req, res) => {
  try {
    const userId = req.user?.id;

    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Incomplete payment information",
      });
    }

    // --------------------------------------
    // GET ORDER
    // --------------------------------------

    const [orders] = await db.query(
      `
      SELECT *
      FROM orders
      WHERE id = ?
      AND user_id = ?
      LIMIT 1
      `,
      [
        orderId,
        userId,
      ]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orders[0];

    // --------------------------------------
    // CHECK RAZORPAY ORDER ID
    // --------------------------------------

    if (
      order.razorpay_order_id !==
      razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Razorpay order",
      });
    }

    // --------------------------------------
    // ALREADY PAID
    // --------------------------------------

    if (
      order.payment_status === "paid"
    ) {
      return res.json({
        success: true,

        alreadyPaid: true,

        message:
          "Payment already verified",
      });
    }

    // --------------------------------------
    // CREATE SIGNATURE
    // --------------------------------------

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    // --------------------------------------
    // COMPARE SIGNATURE
    // --------------------------------------

    const generatedBuffer = Buffer.from(
  generatedSignature,
  "utf8"
);

const receivedBuffer = Buffer.from(
  razorpay_signature,
  "utf8"
);

if (generatedBuffer.length !== receivedBuffer.length) {
  return res.status(400).json({
    success: false,
    message: "Payment verification failed",
  });
}

const validSignature = crypto.timingSafeEqual(
  generatedBuffer,
  receivedBuffer
);
    // --------------------------------------
    // UPDATE PAYMENT
    // --------------------------------------

    await db.query(
      `
      UPDATE payments
      SET
        razorpay_payment_id = ?,
        razorpay_signature = ?,
        status = 'captured'
      WHERE razorpay_order_id = ?
      `,
      [
        razorpay_payment_id,
        razorpay_signature,
        razorpay_order_id,
      ]
    );

    // --------------------------------------
    // UPDATE ORDER
    // --------------------------------------

    await db.query(
      `
      UPDATE orders
      SET
        payment_status = 'paid',
        status = 'Confirmed'
      WHERE id = ?
      AND user_id = ?
      `,
      [
        order.id,
        userId,
      ]
    );

    // --------------------------------------
    // STATUS HISTORY
    // --------------------------------------

    await db.query(
      `
      INSERT INTO order_status_history
      (
        order_id,
        status,
        message
      )
      VALUES (?, ?, ?)
      `,
      [
        order.id,
        "Confirmed",
        "UPI payment received successfully",
      ]
    );

    return res.json({
      success: true,

      message:
        "Payment verified successfully",

      orderId:
        order.id,

      orderNumber:
        order.order_number,

      paymentStatus:
        "paid",

      orderStatus:
        "Confirmed",
    });

  } catch (error) {
    console.error(
      "VERIFY PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Payment verification failed",
    });
  }
};


module.exports = {
  createPaymentOrder,
  verifyPayment,
};
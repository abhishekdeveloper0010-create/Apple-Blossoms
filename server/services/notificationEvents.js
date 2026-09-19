// =====================================================
// APPLE BLOSSOM
// ORDER NOTIFICATION EVENTS
// Har event ka subject / email body / sms / whatsapp
// =====================================================

const {
  money,
  customerName,
  orderLines,
  trackingBlock,
} = require("./notificationTemplates");

const { notifyConfig } = require("../config/notify");

const storeUrl = notifyConfig.storeUrl;

// =====================================================
// EVENTS
// =====================================================

const events = {
  // ===================================================
  // ORDER PLACED
  // ===================================================

  order_placed: {
    subject: (order) =>
      `Order Confirmed - ${order.order_number}`,

    sms: (order) =>
      `Apple Blossom: Order ${order.order_number} placed successfully. Amount ${money(order.total_amount)}. Thank you!`,

    whatsapp: (order) =>
      `Apple Blossom\nOrder *${order.order_number}* placed successfully.\nAmount: ${money(order.total_amount)}\nWe will notify you when it ships.`,

    body: (order, user) => `
      <p>Hi ${customerName(user, order)},</p>
      <p>Your order has been placed successfully.</p>
      <p>
        <strong>Order Number:</strong> ${order.order_number}<br>
        <strong>Total Amount:</strong> ${money(order.total_amount)}<br>
        <strong>Payment:</strong> ${order.payment_method || "COD"}
      </p>
      ${orderLines(order)}
    `,

    buttonText: "Track Order",
    buttonUrl: () => `${storeUrl}/orders`,
  },

  // ===================================================
  // CONFIRMED
  // ===================================================

  order_confirmed: {
    subject: (order) =>
      `Order ${order.order_number} Confirmed`,

    sms: (order) =>
      `Apple Blossom: Order ${order.order_number} is confirmed and being prepared.`,

    whatsapp: (order) =>
      `Order *${order.order_number}* confirmed. We are preparing your parcel.`,

    body: (order, user) => `
      <p>Hi ${customerName(user, order)},</p>
      <p>Good news! Your order is confirmed and our team is preparing it.</p>
      <p><strong>Order Number:</strong> ${order.order_number}</p>
    `,

    buttonText: "View Order",
    buttonUrl: () => `${storeUrl}/orders`,
  },

  // ===================================================
  // PACKED
  // ===================================================

  order_packed: {
    subject: (order) =>
      `Order ${order.order_number} Packed`,

    sms: (order) =>
      `Apple Blossom: Order ${order.order_number} is packed and ready to ship.`,

    whatsapp: (order) =>
      `Order *${order.order_number}* is packed and ready to ship.`,

    body: (order, user) => `
      <p>Hi ${customerName(user, order)},</p>
      <p>Your order is packed and will be handed over to the courier soon.</p>
    `,
  },

  // ===================================================
  // SHIPPED (tracking number ke saath)
  // ===================================================

  order_shipped: {
    subject: (order) =>
      `Order ${order.order_number} Shipped`,

    sms: (order) =>
      `Apple Blossom: Order ${order.order_number} shipped via ${order.courier_name || "courier"}. Tracking: ${order.tracking_number || "-"}`,

    whatsapp: (order) =>
      `Order *${order.order_number}* has been shipped.\nCourier: ${order.courier_name || "-"}\nTracking No: ${order.tracking_number || "-"}`,

    body: (order, user) => `
      <p>Hi ${customerName(user, order)},</p>
      <p>Your order is on the way!</p>
      <p><strong>Order Number:</strong> ${order.order_number}</p>
      ${trackingBlock(order)}
    `,

    buttonText: "Track Parcel",
    buttonUrl: (order) =>
      order.tracking_url || `${storeUrl}/orders`,
  },

  // ===================================================
  // OUT FOR DELIVERY
  // ===================================================

  out_for_delivery: {
    subject: (order) =>
      `Order ${order.order_number} Out for Delivery`,

    sms: (order) =>
      `Apple Blossom: Order ${order.order_number} is out for delivery today.`,

    whatsapp: (order) =>
      `Order *${order.order_number}* is out for delivery today. Please keep your phone reachable.`,

    body: (order, user) => `
      <p>Hi ${customerName(user, order)},</p>
      <p>Your parcel is out for delivery today.</p>
      ${trackingBlock(order)}
    `,
  },

  // ===================================================
  // DELIVERED
  // ===================================================

  delivered: {
    subject: (order) =>
      `Order ${order.order_number} Delivered`,

    sms: (order) =>
      `Apple Blossom: Order ${order.order_number} delivered. Thank you for shopping with us!`,

    whatsapp: (order) =>
      `Order *${order.order_number}* delivered. Thank you for shopping with Apple Blossom!\nYou can request a return from your orders page if needed.`,

    body: (order, user) => `
      <p>Hi ${customerName(user, order)},</p>
      <p>Your order has been delivered.</p>
      <p>We hope you love it! You can request a return within the
      return window from your orders page.</p>
    `,

    buttonText: "My Orders",
    buttonUrl: () => `${storeUrl}/orders`,
  },

  // ===================================================
  // CANCELLED
  // ===================================================

  cancelled: {
    subject: (order) =>
      `Order ${order.order_number} Cancelled`,

    sms: (order) =>
      `Apple Blossom: Order ${order.order_number} has been cancelled.`,

    whatsapp: (order) =>
      `Order *${order.order_number}* has been cancelled.`,

    body: (order, user) => `
      <p>Hi ${customerName(user, order)},</p>
      <p>Your order has been cancelled.</p>
      <p><strong>Reason:</strong> ${
        order.cancellation_reason || "Not specified"
      }</p>
    `,
  },

  // ===================================================
  // RETURN REQUESTED
  // ===================================================

  return_requested: {
    subject: (order) =>
      `Return Request Received - ${order.order_number}`,

    sms: (order) =>
      `Apple Blossom: Return request received for order ${order.order_number}. Our team will review it shortly.`,

    whatsapp: (order) =>
      `Return request received for order *${order.order_number}*. Our team will review it shortly.`,

    body: (order, user) => `
      <p>Hi ${customerName(user, order)},</p>
      <p>We have received your return request.</p>
      <p><strong>Order Number:</strong> ${order.order_number}</p>
      <p>Our team will review it and update you soon.</p>
    `,
  },

  // ===================================================
  // RETURN APPROVED
  // ===================================================

  return_approved: {
    subject: (order) =>
      `Return Approved - ${order.order_number}`,

    sms: (order) =>
      `Apple Blossom: Return approved for order ${order.order_number}. Pickup will be scheduled soon.`,

    whatsapp: (order) =>
      `Return approved for order *${order.order_number}*. Pickup will be scheduled soon.`,

    body: (order, user, extra) => `
      <p>Hi ${customerName(user, order)},</p>
      <p>Your return request has been approved.</p>
      <p>
        <strong>Refund Amount:</strong> ${money(
          extra?.refundAmount || 0
        )}<br>
        <strong>Refund Mode:</strong> ${
          extra?.refundMethod || "As per policy"
        }
      </p>
      ${
        extra?.adminNote
          ? `<p><strong>Note:</strong> ${extra.adminNote}</p>`
          : ""
      }
    `,
  },

  // ===================================================
  // RETURN REJECTED
  // ===================================================

  return_rejected: {
    subject: (order) =>
      `Return Request Update - ${order.order_number}`,

    sms: (order) =>
      `Apple Blossom: Return request for order ${order.order_number} could not be approved.`,

    whatsapp: (order) =>
      `Return request for order *${order.order_number}* could not be approved.`,

    body: (order, user, extra) => `
      <p>Hi ${customerName(user, order)},</p>
      <p>After review, your return request could not be approved.</p>
      ${
        extra?.adminNote
          ? `<p><strong>Reason:</strong> ${extra.adminNote}</p>`
          : ""
      }
      <p>For help please contact ${notifyConfig.supportEmail}.</p>
    `,
  },

  // ===================================================
  // RETURN PICKED UP
  // ===================================================

  return_picked_up: {
    subject: (order) =>
      `Return Picked Up - ${order.order_number}`,

    sms: (order) =>
      `Apple Blossom: Returned item picked up for order ${order.order_number}.`,

    whatsapp: (order) =>
      `Returned item picked up for order *${order.order_number}*. Refund will be processed after quality check.`,

    body: (order, user) => `
      <p>Hi ${customerName(user, order)},</p>
      <p>The returned item has been picked up.</p>
      <p>Refund will be processed after our quality check.</p>
    `,
  },

  // ===================================================
  // REFUND INITIATED
  // ===================================================

  refund_initiated: {
    subject: (order) =>
      `Refund Initiated - ${order.order_number}`,

    sms: (order) =>
      `Apple Blossom: Refund of ${money(order.refund_amount)} initiated for order ${order.order_number}.`,

    whatsapp: (order) =>
      `Refund of ${money(order.refund_amount)} initiated for order *${order.order_number}*.`,

    body: (order, user) => `
      <p>Hi ${customerName(user, order)},</p>
      <p>Your refund has been initiated.</p>
      <p>
        <strong>Amount:</strong> ${money(order.refund_amount)}<br>
        <strong>Mode:</strong> ${order.refund_method || "-"}
      </p>
      <p>Bank refunds usually take 5-7 working days.</p>
    `,
  },

  // ===================================================
  // REFUND COMPLETED
  // ===================================================

  refund_completed: {
    subject: (order) =>
      `Refund Completed - ${order.order_number}`,

    sms: (order) =>
      `Apple Blossom: Refund of ${money(order.refund_amount)} completed for order ${order.order_number}.`,

    whatsapp: (order) =>
      `Refund of ${money(order.refund_amount)} completed for order *${order.order_number}*.`,

    body: (order, user) => `
      <p>Hi ${customerName(user, order)},</p>
      <p>Your refund is completed.</p>
      <p>
        <strong>Amount:</strong> ${money(order.refund_amount)}<br>
        <strong>Mode:</strong> ${order.refund_method || "-"}<br>
        <strong>Reference:</strong> ${order.refund_reference || "-"}
      </p>
    `,
  },

  // ===================================================
  // INVOICE EMAIL
  // ===================================================

  invoice: {
    subject: (order) =>
      `Invoice for Order ${order.order_number}`,

    sms: (order) =>
      `Apple Blossom: Invoice for order ${order.order_number} is ready.`,

    whatsapp: (order) =>
      `Invoice for order *${order.order_number}* is ready.`,

    body: (order, user) => `
      <p>Hi ${customerName(user, order)},</p>
      <p>Please find your invoice details below.</p>
      <p>
        <strong>Invoice No:</strong> INV-${order.order_number}<br>
        <strong>Subtotal:</strong> ${money(order.subtotal)}<br>
        <strong>Delivery:</strong> ${money(order.delivery_charge)}<br>
        <strong>Discount:</strong> ${money(order.coupon_discount)}<br>
        <strong>Total:</strong> ${money(order.total_amount)}
      </p>
      ${orderLines(order)}
    `,

    buttonText: "Open Printable Invoice",
    buttonUrl: (order) =>
      `${storeUrl}/orders/${order.id}/invoice`,
  },
};

// =====================================================
// HELPERS
// =====================================================

const getNotificationEvent = (eventName) => {
  return events[eventName] || null;
};

const listNotificationEvents = () => {
  return Object.keys(events);
};

module.exports = {
  getNotificationEvent,
  listNotificationEvents,
};

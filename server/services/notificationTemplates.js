// =====================================================
// APPLE BLOSSOM
// NOTIFICATION TEMPLATES
// Har event ka Email (HTML) + SMS + WhatsApp text
// =====================================================

const { notifyConfig } = require("../config/notify");

const money = (value) => {
  return `Rs ${Number(value || 0).toFixed(2)}`;
};

// =====================================================
// COMMON EMAIL WRAPPER
// =====================================================

const emailWrapper = ({
  title,
  body,
  buttonText,
  buttonUrl,
}) => {
  const button =
    buttonText && buttonUrl
      ? `
        <p style="margin:26px 0;">
          <a href="${buttonUrl}" style="
            background:#0e7490;
            color:#ffffff;
            padding:12px 26px;
            border-radius:8px;
            text-decoration:none;
            font-weight:bold;
            display:inline-block;
          ">${buttonText}</a>
        </p>`
      : "";

  return `
    <div style="
      font-family:Arial,Helvetica,sans-serif;
      max-width:620px;
      margin:auto;
      padding:28px;
      background:#ffffff;
      border:1px solid #e5e7eb;
      border-radius:12px;
    ">
      <h1 style="
        color:#0f172a;
        font-size:22px;
        margin:0 0 6px;
      ">Apple Blossom</h1>

      <p style="
        color:#64748b;
        font-size:13px;
        margin:0 0 22px;
      ">${notifyConfig.storeName} Order Update</p>

      <h2 style="
        color:#0f172a;
        font-size:18px;
        margin:0 0 14px;
      ">${title}</h2>

      <div style="
        color:#475569;
        font-size:15px;
        line-height:1.7;
      ">${body}</div>

      ${button}

      <hr style="
        border:none;
        border-top:1px solid #e5e7eb;
        margin:24px 0;
      ">

      <p style="color:#94a3b8;font-size:12px;margin:0;">
        Support: ${notifyConfig.supportEmail}<br>
        Thank you for shopping with Apple Blossom.
      </p>
    </div>
  `;
};

// =====================================================
// HELPERS
// =====================================================

const customerName = (user, order) => {
  return (
    user?.name ||
    order?.customer_name ||
    order?.address?.full_name ||
    "Customer"
  );
};

const orderLines = (order) => {
  const items =
    order?.items || order?.order_items || [];

  if (!items.length) return "";

  return `
    <table style="
      width:100%;
      border-collapse:collapse;
      font-size:14px;
      margin:10px 0;
    ">
      <tr style="background:#f8fafc;">
        <th style="text-align:left;padding:8px;">Product</th>
        <th style="text-align:center;padding:8px;">Qty</th>
        <th style="text-align:right;padding:8px;">Price</th>
      </tr>
      ${items
        .map(
          (item) => `
      <tr>
        <td style="padding:8px;border-top:1px solid #f1f5f9;">
          ${item.product_name || item.productName || "-"}
        </td>
        <td style="padding:8px;text-align:center;border-top:1px solid #f1f5f9;">
          ${item.quantity || 1}
        </td>
        <td style="padding:8px;text-align:right;border-top:1px solid #f1f5f9;">
          ${money(item.price)}
        </td>
      </tr>`
        )
        .join("")}
    </table>
  `;
};

const trackingBlock = (order) => {
  const courier =
    order?.courier_name || order?.courierName;

  const awb =
    order?.tracking_number || order?.trackingNumber;

  const link =
    order?.tracking_url || order?.trackingUrl;

  if (!courier && !awb) return "";

  return `
    <div style="
      background:#f0fdfa;
      border:1px solid #99f6e4;
      border-radius:10px;
      padding:14px;
      margin:14px 0;
      font-size:14px;
      color:#0f766e;
    ">
      <strong>Courier:</strong> ${courier || "-"}<br>
      <strong>Tracking Number:</strong> ${awb || "-"}
      ${
        link
          ? `<br><a href="${link}" style="color:#0e7490;">Track your parcel</a>`
          : ""
      }
    </div>
  `;
};

module.exports = {
  money,
  emailWrapper,
  customerName,
  orderLines,
  trackingBlock,
};
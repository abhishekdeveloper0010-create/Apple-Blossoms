// =====================================================
// APPLE BLOSSOM
// INVOICE SERVICE  (Feature 6)
//
// Invoice ka data + printable HTML.
// PDF ke liye browser ka "Save as PDF" use hota hai.
// Yahi HTML email me bhi jaata hai.
// =====================================================

const { notifyConfig } = require("../config/notify");

// =====================================================
// COMPANY DETAILS (.env se)
// =====================================================

const company = {
  name: process.env.STORE_NAME || "Apple Blossom",
  address: process.env.STORE_ADDRESS || "Main Market",
  city: process.env.STORE_CITY || "Abohar",
  state: process.env.STORE_STATE || "Punjab",
  pincode: process.env.STORE_PINCODE || "152128",
  country: process.env.STORE_COUNTRY || "India",
  phone: process.env.STORE_PHONE || "0000000000",
  email:
    process.env.SUPPORT_EMAIL ||
    process.env.EMAIL_USER ||
    "",
  gstin: process.env.STORE_GSTIN || "",
  website:
    process.env.STORE_WEBSITE || notifyConfig.storeUrl,
};

const money = (value) => {
  return `Rs ${Number(value || 0).toFixed(2)}`;
};

// =====================================================
// INVOICE DATA BANAO
// =====================================================

const buildInvoice = (order) => {
  const items = (order.items || []).map((item) => {
    const price = Number(item.price || 0);
    const quantity = Number(item.quantity || 1);

    return {
      id: item.id,
      productName: item.product_name,
      productImage: item.product_image,
      size: item.size,
      color: item.color,
      price,
      quantity,
      lineTotal: Number(
        (price * quantity).toFixed(2)
      ),
      status: item.status,
    };
  });

  const subtotal = Number(order.subtotal || 0);
  const deliveryCharge = Number(
    order.delivery_charge || 0
  );
  const discount = Number(order.coupon_discount || 0);
  const total = Number(order.total_amount || 0);

  // =====================================================
  // STEP 6 : GST BREAKDOWN
  // =====================================================

  const cgstAmount = Number(order.cgst_amount || 0);
  const sgstAmount = Number(order.sgst_amount || 0);
  const igstAmount = Number(order.igst_amount || 0);
  const taxAmount = Number(order.tax_amount || 0);
  const codCharge = Number(order.cod_charge || 0);

  const isPaid =
    String(
      order.payment_status || ""
    ).toLowerCase() === "paid";

  const paidAmount = isPaid ? total : 0;

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const orderDate = order.created_at
    ? new Date(order.created_at)
    : new Date();

  return {
    invoiceNumber: `INV-${order.order_number}`,
    invoiceDate: orderDate,
    invoiceDateText: orderDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ),

    orderNumber: order.order_number,
    orderStatus: order.status,
    paymentMethod: order.payment_method || "COD",
    paymentStatus: order.payment_status || "pending",
    transactionId: order.razorpay_payment_id || null,

    customer: {
      name:
        order.customer_name ||
        order.address?.full_name ||
        "Customer",
      email: order.customer_email || "",
      phone:
        order.customer_phone ||
        order.address?.phone ||
        "",
    },

    shippingAddress: {
      full_name:
        order.address?.full_name ||
        order.customer_name ||
        "",
      phone: order.address?.phone || "",
      address_line:
        order.address?.address_line || "",
      city: order.address?.city || "",
      state: order.address?.state || "",
      pincode: order.address?.pincode || "",
      country: order.address?.country || "India",
    },

    items,

    summary: {
      totalQuantity,
      subtotal,
      deliveryCharge,
      codCharge,
      discount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      taxAmount,
      total,
      paidAmount,
      balanceDue: Number(
        (total - paidAmount).toFixed(2)
      ),
      refundAmount: Number(order.refund_amount || 0),
    },

    company,
  };
};

// =====================================================
// HTML ESCAPE
// =====================================================

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// =====================================================
// INVOICE ITEM ROWS
// =====================================================

const renderItemRows = (items) => {
  return items
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <strong>${escapeHtml(item.productName)}</strong>
            ${item.size ? `<br><small>Size: ${escapeHtml(item.size)}</small>` : ""}
            ${item.color ? ` <small>Color: ${escapeHtml(item.color)}</small>` : ""}
          </td>
          <td style="text-align:center;">${item.quantity}</td>
          <td style="text-align:right;">${money(item.price)}</td>
          <td style="text-align:right;">${money(item.lineTotal)}</td>
        </tr>
      `
    )
    .join("");
};

// =====================================================
// PRINTABLE INVOICE HTML
// =====================================================

const renderInvoiceHtml = (invoice) => {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(invoice.invoiceNumber)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    background: #f8fafc;
    margin: 0;
    padding: 24px;
    color: #0f172a;
  }
  .sheet {
    background: #fff;
    max-width: 800px;
    margin: auto;
    padding: 32px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
  }
  .top {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    border-bottom: 2px solid #0e7490;
    padding-bottom: 16px;
  }
  .brand { font-size: 22px; font-weight: bold; color: #0e7490; }
  .muted { color: #64748b; font-size: 13px; }
  .box { display: flex; gap: 20px; margin: 20px 0; flex-wrap: wrap; }
  .box > div { flex: 1; min-width: 220px; }
  h3 {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: #0e7490;
    margin: 0 0 8px;
  }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td {
    padding: 10px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
  }
  th {
    background: #f8fafc;
    text-align: left;
    font-size: 12px;
    text-transform: uppercase;
    color: #475569;
  }
  .totals { margin-top: 18px; width: 100%; max-width: 340px; margin-left: auto; }
  .totals div {
    display: flex;
    justify-content: space-between;
    padding: 7px 0;
    font-size: 14px;
  }
  .totals .grand {
    border-top: 2px solid #0f172a;
    font-weight: bold;
    font-size: 17px;
    padding-top: 12px;
  }
  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: bold;
  }
  .paid { background: #dcfce7; color: #15803d; }
  .due { background: #fef3c7; color: #b45309; }
  .footer {
    margin-top: 28px;
    border-top: 1px solid #e2e8f0;
    padding-top: 14px;
    font-size: 12px;
    color: #94a3b8;
    text-align: center;
  }
  .print-btn {
    display: block;
    width: 100%;
    max-width: 800px;
    margin: 0 auto 18px;
    padding: 14px;
    background: #0e7490;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
  }
  @media print {
    body { background: #fff; padding: 0; }
    .sheet { border: none; border-radius: 0; padding: 0; }
    .print-btn { display: none; }
  }
</style>
</head>
<body>

<button class="print-btn" onclick="window.print()">
  Print / Save as PDF
</button>

<div class="sheet">

  <div class="top">
    <div>
      <div class="brand">${escapeHtml(invoice.company.name)}</div>
      <div class="muted">
        ${escapeHtml(invoice.company.address)},
        ${escapeHtml(invoice.company.city)},
        ${escapeHtml(invoice.company.state)}
        - ${escapeHtml(invoice.company.pincode)}<br>
        Phone: ${escapeHtml(invoice.company.phone)}<br>
        Email: ${escapeHtml(invoice.company.email)}
        ${
          invoice.company.gstin
            ? `<br>GSTIN: ${escapeHtml(invoice.company.gstin)}`
            : ""
        }
      </div>
    </div>

    <div style="text-align:right;">
      <div style="font-size:20px;font-weight:bold;">
        TAX INVOICE
      </div>
      <div class="muted">
        Invoice No:
        <strong>${escapeHtml(invoice.invoiceNumber)}</strong><br>
        Invoice Date: ${escapeHtml(invoice.invoiceDateText)}<br>
        Order No: ${escapeHtml(invoice.orderNumber)}
      </div>
    </div>
  </div>

  <div class="box">
    <div>
      <h3>Billed To</h3>
      <div class="muted">
        <strong style="color:#0f172a;">${escapeHtml(
          invoice.customer.name
        )}</strong><br>
        ${escapeHtml(invoice.shippingAddress.address_line)}<br>
        ${escapeHtml(invoice.shippingAddress.city)},
        ${escapeHtml(invoice.shippingAddress.state)}
        - ${escapeHtml(invoice.shippingAddress.pincode)}<br>
        ${escapeHtml(invoice.shippingAddress.country)}<br>
        Phone: ${escapeHtml(invoice.customer.phone)}<br>
        ${escapeHtml(invoice.customer.email)}
      </div>
    </div>

    <div>
      <h3>Payment</h3>
      <div class="muted">
        Method:
        <strong>${escapeHtml(invoice.paymentMethod)}</strong><br>
        Status:
        <span class="badge ${
          invoice.summary.balanceDue > 0 ? "due" : "paid"
        }">
          ${escapeHtml(
            invoice.summary.balanceDue > 0
              ? "Payment Due"
              : "Paid"
          )}
        </span>
        ${
          invoice.transactionId
            ? `<br>Txn: ${escapeHtml(invoice.transactionId)}`
            : ""
        }
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Product</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Price</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${renderItemRows(invoice.items)}
    </tbody>
  </table>

  <div class="totals">
    <div>
      <span>Subtotal</span>
      <span>${money(invoice.summary.subtotal)}</span>
    </div>
    <div>
      <span>Delivery Charge</span>
      <span>${money(invoice.summary.deliveryCharge)}</span>
    </div>
    ${
      invoice.summary.codCharge > 0
        ? `<div>
            <span>COD Handling Fee</span>
            <span>${money(invoice.summary.codCharge)}</span>
          </div>`
        : ""
    }
    ${
      invoice.summary.igstAmount > 0
        ? `<div>
            <span>IGST</span>
            <span>${money(invoice.summary.igstAmount)}</span>
          </div>`
        : ""
    }
    ${
      invoice.summary.cgstAmount > 0
        ? `<div>
            <span>CGST</span>
            <span>${money(invoice.summary.cgstAmount)}</span>
          </div>`
        : ""
    }
    ${
      invoice.summary.sgstAmount > 0
        ? `<div>
            <span>SGST</span>
            <span>${money(invoice.summary.sgstAmount)}</span>
          </div>`
        : ""
    }
    ${
      invoice.summary.discount > 0
        ? `<div>
            <span>Discount</span>
            <span>- ${money(invoice.summary.discount)}</span>
          </div>`
        : ""
    }
    <div class="grand">
      <span>Total</span>
      <span>${money(invoice.summary.total)}</span>
    </div>
    ${
      invoice.summary.paidAmount > 0
        ? `<div>
            <span>Paid</span>
            <span>${money(invoice.summary.paidAmount)}</span>
          </div>`
        : ""
    }
    ${
      invoice.summary.refundAmount > 0
        ? `<div>
            <span>Refunded</span>
            <span>${money(invoice.summary.refundAmount)}</span>
          </div>`
        : ""
    }
    <div>
      <span>Balance Due</span>
      <span>${money(invoice.summary.balanceDue)}</span>
    </div>
  </div>

  <div class="footer">
    This is a computer generated invoice.
    Thank you for shopping with
    ${escapeHtml(invoice.company.name)}.
  </div>

</div>

</body>
</html>`;
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  buildInvoice,
  renderInvoiceHtml,
  company,
  money,
};
const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// =====================================================
// APPLE BLOSSOM
// STEP 5 : ADMIN PANEL CONTROLLER
//
// GET    /api/admin/dashboard            -> sales dashboard
// GET    /api/admin/reports/revenue      -> revenue reports
// GET    /api/admin/reports/top-products -> top selling products
// GET    /api/admin/customers            -> customer list
// GET    /api/admin/customers/:id        -> customer detail + orders
// GET    /api/admin/payments             -> payment ledger
// GET    /api/admin/images               -> uploaded images list
// DELETE /api/admin/images/:folder/:file -> delete unused image
// =====================================================

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// =====================================================
// SALES DASHBOARD
// GET /api/admin/dashboard
// =====================================================

const getDashboard = async (req, res) => {
  try {
    const [
      totals,
      ordersByStatus,
      paymentMethods,
      recentOrders,
      last7Rows,
      lowStock,
      pendingReturns,
      refundSummary,
    ] = await Promise.all([
      // Overall totals
      query(
        `SELECT
           COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total_amount ELSE 0 END), 0) AS total_revenue,
           COALESCE(SUM(CASE WHEN status != 'Cancelled' AND DATE(created_at) = CURDATE() THEN total_amount ELSE 0 END), 0) AS today_revenue,
           COUNT(*) AS total_orders,
           SUM(CASE WHEN status != 'Cancelled' THEN 1 ELSE 0 END) AS active_orders,
           SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) AS today_orders
         FROM orders`
      ),

      // Orders by status
      query(
        `SELECT status, COUNT(*) AS total,
                COALESCE(SUM(total_amount), 0) AS amount
         FROM orders GROUP BY status ORDER BY total DESC`
      ),

      // Payment method breakdown
      query(
        `SELECT COALESCE(NULLIF(payment_method, ''), 'Unknown') AS method,
                COUNT(*) AS total,
                COALESCE(SUM(total_amount), 0) AS amount
         FROM orders GROUP BY method ORDER BY amount DESC`
      ),

      // Recent orders
      query(
        `SELECT o.id, o.order_number, o.total_amount, o.status,
                o.payment_method, o.payment_status, o.created_at,
                u.name AS customer_name, u.email AS customer_email
         FROM orders o
         LEFT JOIN users u ON u.id = o.user_id
         ORDER BY o.created_at DESC
         LIMIT 8`
      ),

      // Last 7 days revenue series
      query(
        `SELECT DATE(created_at) AS day,
                COUNT(*) AS orders,
                COALESCE(SUM(total_amount), 0) AS revenue
         FROM orders
         WHERE status != 'Cancelled'
           AND created_at >= CURDATE() - INTERVAL 6 DAY
         GROUP BY DATE(created_at)
         ORDER BY day ASC`
      ),

      // Product + low stock stats
      query(
        `SELECT COUNT(*) AS total_products,
                SUM(CASE WHEN stock <= 5 THEN 1 ELSE 0 END) AS low_stock
         FROM products`
      ),

      // Pending returns
      query(
        `SELECT COUNT(*) AS pending_returns
         FROM order_returns
         WHERE status = 'Pending'`
      ),

      // Refund summary
      query(
        `SELECT COALESCE(SUM(refund_amount), 0) AS total_refunds,
                SUM(CASE WHEN refund_status IS NOT NULL AND refund_status != '' THEN 1 ELSE 0 END) AS refunded_orders
         FROM orders
         WHERE status != 'Cancelled'`
      ),
    ]);

    const customers = await query(
      `SELECT COUNT(*) AS total_customers,
              SUM(CASE WHEN created_at >= DATE_FORMAT(NOW(), '%Y-%m-01') THEN 1 ELSE 0 END) AS new_this_month
       FROM users WHERE role = 'user'`
    );

    // Missing days fill karo (continuous chart ke liye)
    const series = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);

      const row = last7Rows.find(
        (r) =>
          new Date(r.day).toISOString().slice(0, 10) === key
      );

      series.push({
        day: key,
        orders: row ? Number(row.orders) : 0,
        revenue: row ? Number(row.revenue) : 0,
      });
    }

    return res.json({
      success: true,
      dashboard: {
        total_revenue: Number(totals[0].total_revenue) || 0,
        today_revenue: Number(totals[0].today_revenue) || 0,
        total_orders: Number(totals[0].total_orders) || 0,
        active_orders: Number(totals[0].active_orders) || 0,
        today_orders: Number(totals[0].today_orders) || 0,
        total_customers:
          Number(customers[0].total_customers) || 0,
        new_customers_this_month:
          Number(customers[0].new_this_month) || 0,
        total_products: Number(lowStock[0].total_products) || 0,
        low_stock: Number(lowStock[0].low_stock) || 0,
        pending_returns:
          Number(pendingReturns[0].pending_returns) || 0,
        total_refunds:
          Number(refundSummary[0].total_refunds) || 0,
        refunded_orders:
          Number(refundSummary[0].refunded_orders) || 0,
      },
      orders_by_status: ordersByStatus.map((r) => ({
        status: r.status,
        total: Number(r.total),
        amount: Number(r.amount),
      })),
      payment_methods: paymentMethods.map((r) => ({
        method: r.method,
        total: Number(r.total),
        amount: Number(r.amount),
      })),
      last7_days: series,
      recent_orders: recentOrders,
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};

// =====================================================
// REVENUE REPORTS
// GET /api/admin/reports/revenue?group=day|month&days=7|30|90|all
// =====================================================

const getRevenueReports = async (req, res) => {
  try {
    const group =
      req.query.group === "month" ? "month" : "day";

    const daysParam = req.query.days;
    const hasDays =
      daysParam &&
      daysParam !== "all" &&
      Number(daysParam) > 0;

    const selectExpr =
      group === "month"
        ? "DATE_FORMAT(created_at, '%Y-%m')"
        : "DATE(created_at)";

    const params = [];
    let where = "WHERE status != 'Cancelled'";

    if (hasDays) {
      where += " AND created_at >= CURDATE() - INTERVAL ? DAY";
      params.push(Number(daysParam));
    }

    const series = await query(
      `SELECT ${selectExpr} AS period,
              COUNT(*) AS orders,
              COALESCE(SUM(total_amount), 0) AS revenue,
              COALESCE(SUM(refund_amount), 0) AS refunds
       FROM orders
       ${where}
       GROUP BY period
       ORDER BY period ASC`,
      params
    );

    const summary = series.reduce(
      (acc, row) => {
        acc.total_orders += Number(row.orders);
        acc.total_revenue += Number(row.revenue);
        acc.total_refunds += Number(row.refunds);
        return acc;
      },
      { total_orders: 0, total_revenue: 0, total_refunds: 0 }
    );

    summary.avg_order_value = summary.total_orders
      ? summary.total_revenue / summary.total_orders
      : 0;

    return res.json({
      success: true,
      group,
      summary: {
        total_orders: summary.total_orders,
        total_revenue: Number(
          summary.total_revenue.toFixed(2)
        ),
        total_refunds: Number(
          summary.total_refunds.toFixed(2)
        ),
        avg_order_value: Number(
          summary.avg_order_value.toFixed(2)
        ),
      },
      series: series.map((r) => ({
        period: r.period,
        orders: Number(r.orders),
        revenue: Number(r.revenue),
        refunds: Number(r.refunds),
      })),
    });
  } catch (error) {
    console.error("REVENUE REPORTS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load revenue reports",
    });
  }
};

// =====================================================
// TOP SELLING PRODUCTS
// GET /api/admin/reports/top-products?limit=8
// =====================================================

const getTopProducts = async (req, res) => {
  try {
    const limit = Math.min(
      Number(req.query.limit) || 8,
      50
    );

    const rows = await query(
      `SELECT oi.product_name, oi.product_image,
              SUM(oi.quantity) AS total_qty,
              COALESCE(SUM(oi.quantity * oi.price), 0) AS total_revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status != 'Cancelled'
       GROUP BY oi.product_name, oi.product_image
       ORDER BY total_qty DESC
       LIMIT ?`,
      [limit]
    );

    return res.json({
      success: true,
      products: rows.map((r) => ({
        product_name: r.product_name,
        product_image: r.product_image,
        total_qty: Number(r.total_qty),
        total_revenue: Number(r.total_revenue),
      })),
    });
  } catch (error) {
    console.error("TOP PRODUCTS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load top products",
    });
  }
};

// =====================================================
// CUSTOMER MANAGEMENT
// GET /api/admin/customers?search=
// =====================================================

const getCustomers = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();

    const params = [];
    let where = "u.role = 'user'";

    if (search) {
      where +=
        " AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const rows = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.created_at,
              COUNT(o.id) AS total_orders,
              COALESCE(SUM(CASE WHEN o.status != 'Cancelled'
                     THEN o.total_amount ELSE 0 END), 0) AS total_spent,
              MAX(o.created_at) AS last_order_at
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.id
       WHERE ${where}
       GROUP BY u.id
       ORDER BY u.created_at DESC`,
      params
    );

    return res.json({
      success: true,
      customers: rows.map((r) => ({
        ...r,
        total_orders: Number(r.total_orders),
        total_spent: Number(r.total_spent),
      })),
    });
  } catch (error) {
    console.error("CUSTOMERS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load customers",
    });
  }
};

// =====================================================
// CUSTOMER DETAIL + THEIR ORDERS
// GET /api/admin/customers/:id
// =====================================================

const getCustomerDetail = async (req, res) => {
  try {
    const id = req.params.id;

    const users = await query(
      `SELECT id, name, email, phone, role, created_at,
              phone_verified
       FROM users
       WHERE id = ? LIMIT 1`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const orders = await query(
      `SELECT id, order_number, status, total_amount,
              payment_method, payment_status, created_at,
              refund_amount, refund_status
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [id]
    );

    const addresses = await query(
      `SELECT id, full_name, phone, address_line, city,
              state, pincode, is_default
       FROM addresses
       WHERE user_id = ?
       ORDER BY is_default DESC`,
      [id]
    );

    return res.json({
      success: true,
      customer: users[0],
      orders,
      addresses,
    });
  } catch (error) {
    console.error("CUSTOMER DETAIL ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load customer detail",
    });
  }
};

// =====================================================
// PAYMENT DETAILS LEDGER
// GET /api/admin/payments?method=&status=
// =====================================================

const getPayments = async (req, res) => {
  try {
    const method = (req.query.method || "").trim();
    const status = (req.query.status || "").trim();

    const params = [];
    const where = [];

    if (method) {
      where.push("o.payment_method LIKE ?");
      params.push(`%${method}%`);
    }

    if (status) {
      where.push("o.payment_status = ?");
      params.push(status);
    }

    const rows = await query(
      `SELECT o.id AS order_id, o.order_number,
              o.payment_method, o.payment_status,
              o.total_amount, o.razorpay_order_id,
              o.razorpay_payment_id, o.created_at,
              u.name AS customer_name, u.email AS customer_email,
              p.status AS razorpay_status, p.method AS razorpay_method
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       LEFT JOIN payments p
              ON p.razorpay_order_id = o.razorpay_order_id
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY o.created_at DESC
       LIMIT 300`,
      params
    );

    // Summary
    const summary = await query(
      `SELECT
         COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) AS paid_amount,
         COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END), 0) AS pending_amount,
         COALESCE(SUM(CASE WHEN payment_status = 'failed' THEN total_amount ELSE 0 END), 0) AS failed_amount,
         COUNT(*) AS total_records
       FROM orders`
    );

    return res.json({
      success: true,
      summary: {
        paid_amount: Number(summary[0].paid_amount) || 0,
        pending_amount:
          Number(summary[0].pending_amount) || 0,
        failed_amount:
          Number(summary[0].failed_amount) || 0,
        total_records:
          Number(summary[0].total_records) || 0,
      },
      payments: rows,
    });
  } catch (error) {
    console.error("PAYMENTS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load payments",
    });
  }
};

// =====================================================
// IMAGE MANAGEMENT - LIST
// GET /api/admin/images
// =====================================================

const UPLOADS_DIR = path.join(__dirname, "../uploads");

const listImages = async (req, res) => {
  try {
    const imageRegex = /\.(jpe?g|png|webp|gif)$/i;

    const productRows = await query(
      `SELECT image, GROUP_CONCAT(name SEPARATOR ', ') AS used_by
       FROM products
       WHERE image IS NOT NULL AND image != ''
       GROUP BY image`
    );

    const categoryRows = await query(
      `SELECT image, GROUP_CONCAT(name SEPARATOR ', ') AS used_by
       FROM categories
       WHERE image IS NOT NULL AND image != ''
       GROUP BY image`
    );

    const productMap = {};
    productRows.forEach((r) => {
      productMap[r.image] = r.used_by;
    });

    const categoryMap = {};
    categoryRows.forEach((r) => {
      categoryMap[r.image] = r.used_by;
    });

    const buildList = (folder, urlBase, usageMap) => {
      const dir = path.join(UPLOADS_DIR, folder);

      if (!fs.existsSync(dir)) return [];

      return fs
        .readdirSync(dir)
        .filter((f) => imageRegex.test(f))
        .map((f) => {
          let size = 0;
          try {
            size = fs.statSync(path.join(dir, f)).size;
          } catch (e) {
            size = 0;
          }

          return {
            file: f,
            url: `${urlBase}/${encodeURIComponent(f)}`,
            size,
            used_by: usageMap[f] || null,
          };
        })
        .sort(
          (a, b) =>
            (a.used_by ? 1 : 0) - (b.used_by ? 1 : 0)
        );
    };

    return res.json({
      success: true,
      products: buildList(
        "products",
        "/images",
        productMap
      ),
      categories: buildList(
        "categories",
        "/category-images",
        categoryMap
      ),
    });
  } catch (error) {
    console.error("IMAGES LIST ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load images",
    });
  }
};

// =====================================================
// IMAGE MANAGEMENT - DELETE (only if unused)
// DELETE /api/admin/images/:folder/:file
// =====================================================

const deleteImage = async (req, res) => {
  try {
    const folder = req.params.folder;
    const file = path.basename(req.params.file);

    if (
      !["products", "categories"].includes(folder) ||
      !file ||
      file.includes("..")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid image path",
      });
    }

    const fullPath = path.join(UPLOADS_DIR, folder, file);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // In-use check
    let used = [];

    if (folder === "products") {
      used = await query(
        "SELECT name FROM products WHERE image = ? LIMIT 1",
        [file]
      );
    } else {
      used = await query(
        "SELECT name FROM categories WHERE image = ? LIMIT 1",
        [file]
      );
    }

    if (used.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Image is in use by: ${used
          .map((r) => r.name)
          .join(", ")}`,
      });
    }

    fs.unlinkSync(fullPath);

    return res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("IMAGE DELETE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete image",
    });
  }
};

module.exports = {
  getDashboard,
  getRevenueReports,
  getTopProducts,
  getCustomers,
  getCustomerDetail,
  getPayments,
  listImages,
  deleteImage,
};

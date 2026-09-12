const db = require("../config/db");

const normalizeCode = (code) => {
  return String(code || "")
    .trim()
    .toUpperCase();
};

const calculateDiscount = (coupon, subtotal) => {
  let discount = 0;
  if (coupon.discount_type === "percentage") {
    discount = (Number(subtotal) * Number(coupon.discount_value)) / 100;
    if (coupon.max_discount !== null && coupon.max_discount !== undefined) {
      discount = Math.min(discount, Number(coupon.max_discount));
    }
  }
  if (coupon.discount_type === "fixed") {
    discount = Number(coupon.discount_value);
  }
  discount = Math.min(Math.max(discount, 0), Number(subtotal));
  return Number(discount.toFixed(2));
};

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const validateCoupon = async (req, res) => {
  try {
    const code = normalizeCode(req.body.code);
    const subtotal = Number(req.body.subtotal);
    if (!code)
      return res
        .status(400)
        .json({ success: false, message: "Coupon code is required" });
    if (Number.isNaN(subtotal) || subtotal < 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid subtotal" });
    const rows = await query(`SELECT * FROM coupons WHERE code = ? LIMIT 1`, [
      code,
    ]);
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Invalid coupon code" });
    const coupon = rows[0];
    if (!coupon.is_active)
      return res
        .status(400)
        .json({ success: false, message: "This coupon is inactive" });
    if (coupon.start_at && new Date() < new Date(coupon.start_at))
      return res
        .status(400)
        .json({ success: false, message: "This coupon is not active yet" });
    if (coupon.end_at && new Date() > new Date(coupon.end_at))
      return res
        .status(400)
        .json({ success: false, message: "This coupon has expired" });
    if (
      coupon.usage_limit !== null &&
      Number(coupon.used_count) >= Number(coupon.usage_limit)
    )
      return res
        .status(400)
        .json({
          success: false,
          message: "This coupon usage limit has been reached",
        });
    if (subtotal < Number(coupon.min_order_amount || 0))
      return res
        .status(400)
        .json({
          success: false,
          message: `Minimum order amount is ₹${Number(coupon.min_order_amount).toFixed(0)}`,
        });
    const discount = calculateDiscount(coupon, subtotal);
    return res.json({
      success: true,
      message: "Coupon applied successfully",
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
      discount,
      finalAmount: Number(subtotal) - discount,
    });
  } catch (error) {
    console.error("Validate Coupon Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to validate coupon" });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const rows = await query(`SELECT * FROM coupons ORDER BY created_at DESC`);
    return res.json({ success: true, coupons: rows });
  } catch (error) {
    console.error("Get Coupons Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch coupons" });
  }
};

const getCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query(`SELECT * FROM coupons WHERE id = ? LIMIT 1`, [
      id,
    ]);
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    return res.json({ success: true, coupon: rows[0] });
  } catch (error) {
    console.error("Get Coupon Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch coupon" });
  }
};

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      max_discount,
      min_order_amount,
      usage_limit,
      start_at,
      end_at,
      is_active,
    } = req.body;
    const normalizedCode = normalizeCode(code);
    if (!normalizedCode)
      return res
        .status(400)
        .json({ success: false, message: "Coupon code is required" });
    if (!discount_type || !discount_value)
      return res
        .status(400)
        .json({
          success: false,
          message: "Discount type and value are required",
        });
    const existing = await query(
      `SELECT id FROM coupons WHERE code = ? LIMIT 1`,
      [normalizedCode],
    );
    if (existing.length)
      return res
        .status(400)
        .json({ success: false, message: "Coupon code already exists" });
    const result = await query(
      `INSERT INTO coupons (code, discount_type, discount_value, max_discount, min_order_amount, usage_limit, start_at, end_at, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        normalizedCode,
        discount_type,
        discount_value,
        max_discount || null,
        min_order_amount || 0,
        usage_limit || null,
        start_at || null,
        end_at || null,
        is_active === false ? false : true,
      ],
    );
    return res
      .status(201)
      .json({
        success: true,
        message: "Coupon created successfully",
        coupon: { id: result.insertId, code: normalizedCode },
      });
  } catch (error) {
    console.error("Create Coupon Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create coupon" });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      discount_type,
      discount_value,
      max_discount,
      min_order_amount,
      usage_limit,
      start_at,
      end_at,
      is_active,
    } = req.body;
    const normalizedCode = normalizeCode(code);
    const rows = await query(`SELECT id FROM coupons WHERE id = ? LIMIT 1`, [
      id,
    ]);
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    const duplicate = await query(
      `SELECT id FROM coupons WHERE code = ? AND id != ? LIMIT 1`,
      [normalizedCode, id],
    );
    if (duplicate.length)
      return res
        .status(400)
        .json({ success: false, message: "Coupon code already exists" });
    await query(
      `UPDATE coupons SET code = ?, discount_type = ?, discount_value = ?, max_discount = ?, min_order_amount = ?, usage_limit = ?, start_at = ?, end_at = ?, is_active = ? WHERE id = ?`,
      [
        normalizedCode,
        discount_type,
        discount_value,
        max_discount || null,
        min_order_amount || 0,
        usage_limit || null,
        start_at || null,
        end_at || null,
        is_active === false ? false : true,
        id,
      ],
    );
    return res.json({ success: true, message: "Coupon updated successfully" });
  } catch (error) {
    console.error("Update Coupon Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update coupon" });
  }
};

const toggleCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query(
      `SELECT is_active FROM coupons WHERE id = ? LIMIT 1`,
      [id],
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    const newStatus = !Boolean(rows[0].is_active);
    await query(`UPDATE coupons SET is_active = ? WHERE id = ?`, [
      newStatus,
      id,
    ]);
    return res.json({
      success: true,
      message: newStatus ? "Coupon activated" : "Coupon deactivated",
      is_active: newStatus,
    });
  } catch (error) {
    console.error("Toggle Coupon Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update coupon status" });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM coupons WHERE id = ?`, [id]);
    if (!result.affectedRows)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    return res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Delete Coupon Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete coupon" });
  }
};

module.exports = {
  validateCoupon,
  getAllCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  toggleCoupon,
  deleteCoupon,
};

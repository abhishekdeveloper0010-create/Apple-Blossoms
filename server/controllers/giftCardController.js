const db = require("../config/db");
const crypto = require("crypto");

// =====================================================
// HELPERS
// =====================================================

const generateCode = () => {
  return "GB-" + crypto.randomBytes(4).toString("hex").toUpperCase();
};

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// =====================================================
// CREATE GIFT CARD (Admin)
// POST /api/gift-cards
// =====================================================

const createGiftCard = async (req, res) => {
  try {
    const { amount, receiver_email, receiver_name, message, expiry_date, usage_limit } = req.body;
    const senderId = req.user.id;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    const code = generateCode();

    const result = await query(
      `INSERT INTO gift_cards (code, amount, balance, sender_id, receiver_email, receiver_name, message, expiry_date, usage_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, Number(amount), Number(amount), senderId, receiver_email || null, receiver_name || null, message || null, expiry_date || null, usage_limit || 1]
    );

    return res.status(201).json({ success: true, message: "Gift card created successfully", giftCard: { id: result.insertId, code, amount: Number(amount), balance: Number(amount) } });
  } catch (error) {
    console.error("Create Gift Card Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create gift card" });
  }
};

// =====================================================
// GET ALL GIFT CARDS (Admin)
// GET /api/gift-cards
// =====================================================

const getAllGiftCards = async (req, res) => {
  try {
    const rows = await query(`SELECT gc.*, u.name as sender_name, u.email as sender_email FROM gift_cards gc LEFT JOIN users u ON gc.sender_id = u.id ORDER BY gc.created_at DESC`);
    return res.json({ success: true, giftCards: rows });
  } catch (error) {
    console.error("Get Gift Cards Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch gift cards" });
  }
};

// =====================================================
// GET SINGLE GIFT CARD (Admin)
// GET /api/gift-cards/:id
// =====================================================

const getGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query(`SELECT gc.*, u.name as sender_name, u.email as sender_email FROM gift_cards gc LEFT JOIN users u ON gc.sender_id = u.id WHERE gc.id = ?`, [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Gift card not found" });
    }

    return res.json({ success: true, giftCard: rows[0] });
  } catch (error) {
    console.error("Get Gift Card Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch gift card" });
  }
};

// =====================================================
// UPDATE GIFT CARD (Admin)
// PUT /api/gift-cards/:id
// =====================================================

const updateGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { receiver_email, receiver_name, message, expiry_date, is_active } = req.body;

    const rows = await query(`SELECT id FROM gift_cards WHERE id = ?`, [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Gift card not found" });
    }

    await query(
      `UPDATE gift_cards SET receiver_email = ?, receiver_name = ?, message = ?, expiry_date = ?, is_active = ? WHERE id = ?`,
      [receiver_email || null, receiver_name || null, message || null, expiry_date || null, is_active !== false, id]
    );

    return res.json({ success: true, message: "Gift card updated successfully" });
  } catch (error) {
    console.error("Update Gift Card Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update gift card" });
  }
};

// =====================================================
// DELETE GIFT CARD (Admin)
// DELETE /api/gift-cards/:id
// =====================================================

const deleteGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM gift_cards WHERE id = ?`, [id]);

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Gift card not found" });
    }

    return res.json({ success: true, message: "Gift card deleted successfully" });
  } catch (error) {
    console.error("Delete Gift Card Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete gift card" });
  }
};

// =====================================================
// CLAIM GIFT CARD (User)
// POST /api/gift-cards/claim
// =====================================================

const claimGiftCard = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ success: false, message: "Gift card code is required" });
    }

    const normalizedCode = String(code).trim().toUpperCase();

    const rows = await query(`SELECT * FROM gift_cards WHERE code = ?`, [normalizedCode]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Invalid gift card code" });
    }

    const giftCard = rows[0];

    if (!giftCard.is_active) {
      return res.status(400).json({ success: false, message: "This gift card is inactive" });
    }

    if (giftCard.expiry_date && new Date() > new Date(giftCard.expiry_date)) {
      return res.status(400).json({ success: false, message: "This gift card has expired" });
    }

    if (Number(giftCard.balance) <= 0) {
      return res.status(400).json({ success: false, message: "This gift card has no balance" });
    }

    if (Number(giftCard.used_count) >= Number(giftCard.usage_limit)) {
      return res.status(400).json({ success: false, message: "This gift card has reached its usage limit" });
    }

    const existing = await query(`SELECT id FROM user_gift_cards WHERE user_id = ? AND gift_card_id = ?`, [userId, giftCard.id]);

    if (existing.length) {
      return res.status(400).json({ success: false, message: "You have already claimed this gift card" });
    }

    await query(`INSERT INTO user_gift_cards (user_id, gift_card_id) VALUES (?, ?)`, [userId, giftCard.id]);

    await query(
      `INSERT INTO wallet (user_id, balance, total_credited) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance), total_credited = total_credited + VALUES(total_credited)`,
      [userId, Number(giftCard.balance), Number(giftCard.balance)]
    );

    await query(
      `INSERT INTO wallet_transactions (user_id, type, amount, description, reference_type, reference_id, balance_after)
       VALUES (?, 'credit', ?, 'Gift card claimed', 'gift_card', ?, (SELECT balance FROM wallet WHERE user_id = ?))`,
      [userId, Number(giftCard.balance), giftCard.id, userId]
    );

    await query(`UPDATE gift_cards SET used_count = used_count + 1, balance = 0 WHERE id = ?`, [giftCard.id]);

    return res.json({ success: true, message: "Gift card claimed successfully", amount: Number(giftCard.balance) });
  } catch (error) {
    console.error("Claim Gift Card Error:", error);
    return res.status(500).json({ success: false, message: "Failed to claim gift card" });
  }
};

// =====================================================
// GET USER GIFT CARDS
// GET /api/gift-cards/my
// =====================================================

const getMyGiftCards = async (req, res) => {
  try {
    const userId = req.user.id;
    const rows = await query(
      `SELECT gc.*, ugc.claimed_at FROM user_gift_cards ugc JOIN gift_cards gc ON ugc.gift_card_id = gc.id WHERE ugc.user_id = ? ORDER BY ugc.claimed_at DESC`,
      [userId]
    );

    return res.json({ success: true, giftCards: rows });
  } catch (error) {
    console.error("Get My Gift Cards Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch gift cards" });
  }
};

module.exports = {
  createGiftCard,
  getAllGiftCards,
  getGiftCard,
  updateGiftCard,
  deleteGiftCard,
  claimGiftCard,
  getMyGiftCards,
};


const db = require("../config/db");

// =====================================================
// HELPERS
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
// GET USER WALLET
// GET /api/wallet
// =====================================================

const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    const rows = await query(`SELECT * FROM wallet WHERE user_id = ?`, [userId]);

    if (!rows.length) {
      await query(`INSERT INTO wallet (user_id, balance) VALUES (?, 0)`, [userId]);
      return res.json({ success: true, wallet: { balance: 0, total_credited: 0, total_debited: 0 } });
    }

    return res.json({ success: true, wallet: rows[0] });
  } catch (error) {
    console.error("Get Wallet Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch wallet" });
  }
};

// =====================================================
// ADD MONEY TO WALLET
// POST /api/wallet/add
// =====================================================

const addMoney = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, description } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    const numAmount = Number(amount);

    await query(
      `INSERT INTO wallet (user_id, balance, total_credited) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance), total_credited = total_credited + VALUES(total_credited)`,
      [userId, numAmount, numAmount]
    );

    await query(
      `INSERT INTO wallet_transactions (user_id, type, amount, description, reference_type, balance_after)
       VALUES (?, 'credit', ?, ?, 'manual', (SELECT balance FROM wallet WHERE user_id = ?))`,
      [userId, numAmount, description || "Money added to wallet", userId]
    );

    const wallet = await query(`SELECT * FROM wallet WHERE user_id = ?`, [userId]);

    return res.json({ success: true, message: "Money added to wallet successfully", wallet: wallet[0] });
  } catch (error) {
    console.error("Add Money Error:", error);
    return res.status(500).json({ success: false, message: "Failed to add money" });
  }
};

// =====================================================
// GET WALLET TRANSACTIONS
// GET /api/wallet/transactions
// =====================================================

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const rows = await query(
      `SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [userId, Number(limit), offset]
    );

    const count = await query(`SELECT COUNT(*) as total FROM wallet_transactions WHERE user_id = ?`, [userId]);

    return res.json({
      success: true,
      transactions: rows,
      pagination: { page: Number(page), limit: Number(limit), total: count[0].total, totalPages: Math.ceil(count[0].total / Number(limit)) },
    });
  } catch (error) {
    console.error("Get Transactions Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
};

// =====================================================
// PAY WITH WALLET
// POST /api/wallet/pay
// =====================================================

const payWithWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    const numAmount = Number(amount);

    const wallet = await query(`SELECT * FROM wallet WHERE user_id = ?`, [userId]);

    if (!wallet.length || Number(wallet[0].balance) < numAmount) {
      return res.status(400).json({ success: false, message: "Insufficient wallet balance" });
    }

    await query(`UPDATE wallet SET balance = balance - ?, total_debited = total_debited + ? WHERE user_id = ?`, [numAmount, numAmount, userId]);

    await query(
      `INSERT INTO wallet_transactions (user_id, type, amount, description, reference_type, balance_after)
       VALUES (?, 'debit', ?, 'Payment from wallet', 'order', (SELECT balance FROM wallet WHERE user_id = ?))`,
      [userId, numAmount, userId]
    );

    return res.json({ success: true, message: "Payment successful", balance: Number(wallet[0].balance) - numAmount });
  } catch (error) {
    console.error("Pay With Wallet Error:", error);
    return res.status(500).json({ success: false, message: "Payment failed" });
  }
};

module.exports = {
  getWallet,
  addMoney,
  getTransactions,
  payWithWallet,
};

const express = require("express");

const router = express.Router();

const {
  getWallet,
  addMoney,
  getTransactions,
  payWithWallet,
} = require("../controllers/walletController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

// =====================================================
// USER WALLET ROUTES
// =====================================================

// Get wallet balance
router.get("/", authenticate, getWallet);

// Add money to wallet
router.post("/add", authenticate, addMoney);

// Get wallet transactions
router.get("/transactions", authenticate, getTransactions);

// Pay with wallet
router.post("/pay", authenticate, payWithWallet);

module.exports = router;

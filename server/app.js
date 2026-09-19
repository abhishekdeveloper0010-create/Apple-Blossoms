const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();
require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const contactRoutes = require("./routes/contactRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const addressRoutes = require("./routes/addressRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const couponRoutes = require("./routes/couponRoutes");
const giftCardRoutes = require("./routes/giftCardRoutes");
const walletRoutes = require("./routes/walletRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const returnRoutes = require("./routes/returnRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// =====================================================
// STEP 4 : CONFIG (startup diagnostics ke liye)
// =====================================================

const {
  shippingConfig,
  isShiprocketEnabled,
} = require("./config/shipping");

const {
  isSmsEnabled,
  isWhatsappEnabled,
} = require("./config/notify");

const { google } = require("googleapis");

const app = express();

const PORT = process.env.PORT || 4000;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

// =====================================================
// OAUTH CALLBACK
// =====================================================

app.get("/oauth2callback", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res
        .status(400)
        .send("Authorization code is missing.");
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost:4000/oauth2callback"
    );

    const { tokens } =
      await oauth2Client.getToken(code);

    console.log("\n==============================");
    console.log("REFRESH TOKEN:");
    console.log(tokens.refresh_token);
    console.log("==============================\n");

    res.send(
      "Google authorization successful. Check your terminal."
    );
  } catch (error) {
    console.error(
      "OAuth Error:",
      error.response?.data || error.message
    );

    res
      .status(500)
      .send("OAuth authorization failed");
  }
});

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/contact", contactRoutes);

app.use("/api/newsletter", newsletterRoutes);

app.use("/api/addresses", addressRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/wishlist", wishlistRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/payments", paymentRoutes);

// COUPONS
app.use("/api/coupons", couponRoutes);

// GIFT CARDS
app.use("/api/gift-cards", giftCardRoutes);

// WALLET
app.use("/api/wallet", walletRoutes);

// CAMPAIGNS
app.use("/api/campaigns", campaignRoutes);

// =====================================================
// STEP 4 : ORDER OPERATIONS
// =====================================================

// RETURNS (return + approval + rejection + refund)
app.use("/api/returns", returnRoutes);

// SHIPPING (shipment + tracking number)
app.use("/api/shipments", shippingRoutes);

// INVOICE (printable / PDF / email)
app.use("/api/invoices", invoiceRoutes);

// NOTIFICATIONS (email / sms / whatsapp log)
app.use("/api/notifications", notificationRoutes);

// =====================================================
// PRODUCT IMAGES
// =====================================================

app.use(
  "/images",
  express.static(
    path.join(__dirname, "uploads/products")
  )
);

// =====================================================
// CATEGORY IMAGES
// =====================================================

app.use(
  "/category-images",
  express.static(
    path.join(__dirname, "uploads/categories")
  )
);

// =====================================================
// TEST
// =====================================================

app.get("/", (req, res) => {
  res.send("Apple Blossom Server Running");
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );

  // =====================================================
  // STEP 4 : ORDER OPERATIONS - CONFIG DIAGNOSTICS
  // =====================================================

  const emailEnabled =
    String(
      process.env.NOTIFY_EMAIL_ENABLED || "true"
    ) === "true";

  console.log(
    [
      "",
      "=== STEP 4 : ORDER OPERATIONS ===",
      `Return window     : ${
        process.env.RETURN_WINDOW_DAYS || 7
      } days`,
      `Shipping provider : ${shippingConfig.provider}${
        isShiprocketEnabled()
          ? " (shiprocket active)"
          : " (manual mode)"
      }`,
      `Email             : ${
        emailEnabled
          ? "enabled"
          : "disabled"
      }`,
      `SMS               : ${
        isSmsEnabled()
          ? "enabled"
          : "not configured (skipped)"
      }`,
      `WhatsApp          : ${
        isWhatsappEnabled()
          ? "enabled"
          : "not configured (skipped)"
      }`,
      "=================================",
      "",
    ].join("\n")
  );
});
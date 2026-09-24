const express = require("express");
const cors = require("cors");
const fs = require("fs");
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
const checkoutRoutes = require("./routes/checkoutRoutes");

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
const {
  processDueNotifications,
} = require("./services/notificationService");

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

    // -------------------------------
    // AUTO-SAVE : token seedha .env me
    // (copy-paste ki zaroorat nahi)
    // -------------------------------

    if (tokens.refresh_token) {
      const envPath = path.join(__dirname, ".env");
      const key = "GOOGLE_REFRESH_TOKEN";
      const line = `${key}=${tokens.refresh_token}`;

      let envContent = "";
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf8");
      }

      const pattern = new RegExp(`^${key}=.*$`, "m");

      if (pattern.test(envContent)) {
        envContent = envContent.replace(pattern, line);
      } else {
        const suffix =
          envContent.endsWith("\n") || envContent === ""
            ? ""
            : "\n";
        envContent = `${envContent}${suffix}${line}\n`;
      }

      fs.writeFileSync(envPath, envContent, "utf8");

      console.log(
        "AUTO-SAVED: GOOGLE_REFRESH_TOKEN .env me save ho gaya."
      );

      return res.send(
        "<h2>✅ Token save ho gaya!</h2>" +
          "<p>Naya GOOGLE_REFRESH_TOKEN automatically <b>.env</b> me save ho gaya.</p>" +
          "<h3>Ab bas yeh karo:</h3>" +
          "<ol>" +
          "<li>Server terminal me <b>Ctrl+C</b> dabao (server band karo)</li>" +
          "<li>Phir <b>node app.js</b> chalao</li>" +
          "<li>Admin → Notifications → Send Test (email)</li>" +
          "</ol>"
      );
    }

    res.send(
      "Google authorization successful, par refresh token nahi mila. Dobara try karo (same URL kholo)."
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
// STEP 6 : BUSINESS ESSENTIALS
// =====================================================

// CHECKOUT (pincode check + shipping/GST quote)
app.use("/api/checkout", checkoutRoutes);

// =====================================================
// STEP 5 : ADMIN PANEL (dashboard / reports / customers /
//          payments / images)
// =====================================================

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

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

app.listen(PORT, async () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );

  try {
    await processDueNotifications({ limit: 20 });
  } catch (error) {
    console.error(
      "INITIAL DUE NOTIFICATION CHECK ERROR:",
      error.message
    );
  }

  setInterval(() => {
    processDueNotifications({ limit: 20 }).catch(
      (error) => {
        console.error(
          "SCHEDULED NOTIFICATION CHECK ERROR:",
          error.message
        );
      }
    );
  }, 60000);

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
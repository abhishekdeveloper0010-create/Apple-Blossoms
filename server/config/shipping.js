require("dotenv").config();

// =====================================================
// SHIPPING CONFIG
// SHIPPING_PROVIDER = manual | shiprocket
//
// manual     -> admin khud courier + AWB daalta hai
// shiprocket -> API se shipment + AWB auto generate
// =====================================================

const shippingConfig = {
  provider: String(
    process.env.SHIPPING_PROVIDER || "manual"
  ).toLowerCase(),

  defaultCourierName:
    process.env.DEFAULT_COURIER_NAME || "Delhivery",

  defaultCourierCode:
    process.env.DEFAULT_COURIER_CODE || "delhivery",

  // Public tracking link (jab provider se link na mile)
  publicTrackingBase:
    process.env.PUBLIC_TRACKING_BASE || "",

  defaultWeightGrams: Number(
    process.env.DEFAULT_PACKAGE_WEIGHT_GRAMS || 500
  ),

  // COD ya prepaid
  codPaymentMode: "COD",
  prepaidPaymentMode: "Prepaid",

  shiprocket: {
    email: process.env.SHIPROCKET_EMAIL || "",
    password: process.env.SHIPROCKET_PASSWORD || "",

    baseUrl:
      process.env.SHIPROCKET_BASE_URL ||
      "https://apiv2.shiprocket.in/v1/external",

    pickupLocation:
      process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",

    channelId: process.env.SHIPROCKET_CHANNEL_ID || "",

    // warehouse / seller details (Shiprocket ko chahiye)
    pickupPostcode: process.env.PICKUP_POSTCODE || "152128",
    pickupCity: process.env.PICKUP_CITY || "Abohar",
    pickupState: process.env.PICKUP_STATE || "Punjab",
    pickupCountry: process.env.PICKUP_COUNTRY || "India",
    pickupAddress: process.env.PICKUP_ADDRESS || "Apple Blossom Store",
    pickupPhone: process.env.PICKUP_PHONE || "0000000000",
  },
};

// =====================================================
// SIRF TAB ENABLE JAB KEYS MOJJOOD HON
// =====================================================

const isShiprocketEnabled = () => {
  return (
    shippingConfig.provider === "shiprocket" &&
    Boolean(shippingConfig.shiprocket.email) &&
    Boolean(shippingConfig.shiprocket.password)
  );
};

module.exports = {
  shippingConfig,
  isShiprocketEnabled,
};

require("dotenv").config();

// =====================================================
// NOTIFICATION CONFIG (Feature 7)
// Email : Gmail OAuth2 (pehle se configured)
// SMS   : none | twilio | msg91
// WHATSAPP : none | meta | twilio
//
// Agar provider configure nahi hai to message
// "skipped" mark hota hai - koi crash nahi hota.
// =====================================================

const notifyConfig = {
  storeName: process.env.STORE_NAME || "Apple Blossom",

  storeUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  supportEmail:
    process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || "",

  email: {
    enabled:
      String(process.env.NOTIFY_EMAIL_ENABLED || "true") ===
      "true",

    fromName: process.env.EMAIL_FROM_NAME || "Apple Blossom",
  },

  sms: {
    provider: String(
      process.env.SMS_PROVIDER || "none"
    ).toLowerCase(),

    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || "",
      authToken: process.env.TWILIO_AUTH_TOKEN || "",
      from: process.env.TWILIO_SMS_FROM || "",
    },

    msg91: {
      authKey: process.env.MSG91_AUTH_KEY || "",
      senderId: process.env.MSG91_SENDER_ID || "ABLSSM",
      route: process.env.MSG91_ROUTE || "4",
      countryCode: process.env.MSG91_COUNTRY_CODE || "91",
    },
  },

  whatsapp: {
    provider: String(
      process.env.WHATSAPP_PROVIDER || "none"
    ).toLowerCase(),

    meta: {
      phoneNumberId:
        process.env.WHATSAPP_PHONE_NUMBER_ID || "",
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
      apiVersion:
        process.env.WHATSAPP_API_VERSION || "v21.0",
      templateName:
        process.env.WHATSAPP_TEMPLATE_NAME || "",
      templateLang:
        process.env.WHATSAPP_TEMPLATE_LANG || "en",
    },

    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || "",
      authToken: process.env.TWILIO_AUTH_TOKEN || "",
      from: process.env.TWILIO_WHATSAPP_FROM || "",
    },
  },

  admin: {
    email:
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      process.env.EMAIL_USER ||
      "",
    phone: process.env.ADMIN_NOTIFICATION_PHONE || "",
  },
};

// =====================================================
// SMS ENABLED ?
// =====================================================

const isSmsEnabled = () => {
  const { provider, twilio, msg91 } =
    notifyConfig.sms;

  if (provider === "twilio") {
    return Boolean(
      twilio.accountSid &&
        twilio.authToken &&
        twilio.from
    );
  }

  if (provider === "msg91") {
    return Boolean(msg91.authKey && msg91.senderId);
  }

  return false;
};

// =====================================================
// WHATSAPP ENABLED ?
// =====================================================

const isWhatsappEnabled = () => {
  const { provider, meta, twilio } =
    notifyConfig.whatsapp;

  if (provider === "meta") {
    return Boolean(
      meta.phoneNumberId && meta.accessToken
    );
  }

  if (provider === "twilio") {
    return Boolean(
      twilio.accountSid &&
        twilio.authToken &&
        twilio.from
    );
  }

  return false;
};

module.exports = {
  notifyConfig,
  isSmsEnabled,
  isWhatsappEnabled,
};
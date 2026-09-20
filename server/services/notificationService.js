// =====================================================
// APPLE BLOSSOM
// NOTIFICATION SERVICE  (Feature 7)
//
// Email    -> Gmail OAuth2 (nodemailer)
// SMS      -> Twilio / MSG91
// WhatsApp -> Meta Cloud API / Twilio
//
// Har message "notifications" table me log hota hai.
// Provider configure na ho to status = "skipped"
// (koi crash nahi, main flow kabhi nahi rukta)
// =====================================================

const axios = require("axios");

const transporter = require("../config/email");
const db = require("../config/db");

const {
  notifyConfig,
  isSmsEnabled,
  isWhatsappEnabled,
} = require("../config/notify");

const {
  getNotificationEvent,
} = require("./notificationEvents");

const {
  emailWrapper,
} = require("./notificationTemplates");

const promiseDb = () => db.promise();

// =====================================================
// PHONE NORMALIZE  (10 digit -> +91XXXXXXXXXX)
// =====================================================

const normalizePhone = (phone) => {
  if (!phone) return "";

  const raw = String(phone).trim();

  // Sirf digits rakho (+, space, dash, brackets hata do)
  let digits = raw.replace(/[^\d]/g, "");

  if (!digits) return "";

  // International prefix 00 hatao (0091... -> 91...)
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // India ka leading 0 hatao
  // (08619141847 -> 8619141847, warna +08619141847 invalid banta hai)
  if (digits.length > 10 && digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }

  // 10 digit local number -> +91XXXXXXXXXX
  if (digits.length === 10) {
    return `+91${digits}`;
  }

  // 12 digit with 91 country code -> +91XXXXXXXXXX
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  return `+${digits}`;
};

// =====================================================
// LOG : CREATE
// =====================================================

const createNotificationLog = async ({
  userId = null,
  orderId = null,
  returnId = null,
  channel,
  event,
  recipient = null,
  subject = null,
  message = null,
  provider = null,
}) => {
  try {
    const [result] = await promiseDb().execute(
      `
        INSERT INTO notifications
        (
          user_id,
          order_id,
          return_id,
          channel,
          event,
          recipient,
          subject,
          message,
          status,
          provider
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      `,
      [
        userId,
        orderId,
        returnId,
        channel,
        event,
        recipient,
        subject,
        message,
        provider,
      ]
    );

    return result.insertId;
  } catch (error) {
    console.error(
      "NOTIFICATION LOG CREATE ERROR:",
      error.message
    );

    return null;
  }
};

// =====================================================
// LOG : UPDATE
// =====================================================

const updateNotificationLog = async (
  id,
  {
    status,
    provider = null,
    providerMessageId = null,
    errorMessage = null,
    sentAt = false,
  } = {}
) => {
  if (!id) return;

  try {
    await promiseDb().execute(
      `
        UPDATE notifications
        SET
          status = ?,
          provider = COALESCE(?, provider),
          provider_message_id = COALESCE(?, provider_message_id),
          error_message = ?,
          sent_at = ${sentAt ? "NOW()" : "sent_at"}
        WHERE id = ?
      `,
      [
        status,
        provider,
        providerMessageId,
        errorMessage,
        id,
      ]
    );
  } catch (error) {
    console.error(
      "NOTIFICATION LOG UPDATE ERROR:",
      error.message
    );
  }
};

// =====================================================
// EMAIL SENDER
// =====================================================

const sendEmailMessage = async ({
  to,
  subject,
  html,
  text,
}) => {
  const info = await transporter.sendMail({
    from: `"${notifyConfig.email.fromName}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });

  return {
    provider: "gmail",
    messageId: info.messageId,
  };
};

// =====================================================
// SMS SENDER
// =====================================================

const sendSmsMessage = async ({ to, message }) => {
  if (!isSmsEnabled()) {
    return {
      skipped: true,
      reason: "SMS provider is not configured",
    };
  }

  const { provider, twilio, msg91 } = notifyConfig.sms;

  // -------------------------------
  // TWILIO
  // -------------------------------

  if (provider === "twilio") {
    const auth = Buffer.from(
      `${twilio.accountSid}:${twilio.authToken}`
    ).toString("base64");

    const body = new URLSearchParams({
      To: to,
      From: twilio.from,
      Body: message,
    });

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      body.toString(),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        timeout: 15000,
      }
    );

    return {
      provider: "twilio-sms",
      messageId: response.data?.sid || null,
    };
  }

  // -------------------------------
  // MSG91
  // -------------------------------

  if (provider === "msg91") {
    const mobile = to.replace("+", "");

    const response = await axios.get(
      "https://api.msg91.com/api/sendhttp.php",
      {
        params: {
          authkey: msg91.authKey,
          mobiles: mobile,
          message,
          sender: msg91.senderId,
          route: msg91.route,
          country: msg91.countryCode,
        },
        timeout: 15000,
      }
    );

    return {
      provider: "msg91",
      messageId:
        typeof response.data === "string"
          ? response.data
          : null,
    };
  }

  return {
    skipped: true,
    reason: `Unknown SMS provider: ${provider}`,
  };
};

// =====================================================
// WHATSAPP SENDER
// =====================================================

const sendWhatsappMessage = async ({ to, message }) => {
  if (!isWhatsappEnabled()) {
    return {
      skipped: true,
      reason: "WhatsApp provider is not configured",
    };
  }

  const { provider, meta, twilio } =
    notifyConfig.whatsapp;

  // -------------------------------
  // META WhatsApp Cloud API
  // -------------------------------

  if (provider === "meta") {
    const url = `https://graph.facebook.com/${meta.apiVersion}/${meta.phoneNumberId}/messages`;

    const headers = {
      Authorization: `Bearer ${meta.accessToken}`,
      "Content-Type": "application/json",
    };

    const plainTo = to.replace("+", "");

    // Agar approved template hai to template bhejo,
    // warna normal text message.

    const payload = meta.templateName
      ? {
          messaging_product: "whatsapp",
          to: plainTo,
          type: "template",
          template: {
            name: meta.templateName,
            language: { code: meta.templateLang },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: String(message).slice(0, 900),
                  },
                ],
              },
            ],
          },
        }
      : {
          messaging_product: "whatsapp",
          to: plainTo,
          type: "text",
          text: {
            preview_url: false,
            body: String(message).slice(0, 4000),
          },
        };

    const response = await axios.post(url, payload, {
      headers,
      timeout: 15000,
    });

    return {
      provider: "meta-whatsapp",
      messageId:
        response.data?.messages?.[0]?.id || null,
    };
  }

  // -------------------------------
  // TWILIO WhatsApp
  // -------------------------------

  if (provider === "twilio") {
    const auth = Buffer.from(
      `${twilio.accountSid}:${twilio.authToken}`
    ).toString("base64");

    const body = new URLSearchParams({
      To: `whatsapp:${to}`,
      From: twilio.from,
      Body: message,
    });

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      body.toString(),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        timeout: 15000,
      }
    );

    return {
      provider: "twilio-whatsapp",
      messageId: response.data?.sid || null,
    };
  }

  return {
    skipped: true,
    reason: `Unknown WhatsApp provider: ${provider}`,
  };
};

// =====================================================
// TEXT CHANNELS (SMS / WHATSAPP) KA COMMON SETUP
// =====================================================

const textChannels = {
  sms: {
    label: "SMS",
    enabled: isSmsEnabled,
    provider: () => notifyConfig.sms.provider,
    send: sendSmsMessage,
  },

  whatsapp: {
    label: "WhatsApp",
    enabled: isWhatsappEnabled,
    provider: () => notifyConfig.whatsapp.provider,
    send: sendWhatsappMessage,
  },
};

// =====================================================
// TEXT MESSAGE BHEJO + LOG KARO
// (SMS / WhatsApp dono ke liye)
// =====================================================

const dispatchTextChannel = async ({
  channel,
  to,
  text,
  userId,
  orderId,
  returnId,
  event,
}) => {
  const config = textChannels[channel];

  if (!to) {
    // Log bhi karo - skipped attempt notification log me dikhna chahiye
    const skippedLogId = await createNotificationLog({
      userId,
      orderId,
      returnId,
      channel,
      event,
      recipient: null,
      message: text,
      provider: config.provider(),
    });

    await updateNotificationLog(skippedLogId, {
      status: "skipped",
      errorMessage: "phone number not available",
    });

    return {
      channel,
      status: "skipped",
      reason: "phone number not available",
    };
  }

  if (!config.enabled()) {
    // Provider configure nahi hai -> log me "skipped" record
    const skippedLogId = await createNotificationLog({
      userId,
      orderId,
      returnId,
      channel,
      event,
      recipient: to,
      message: text,
      provider: config.provider(),
    });

    await updateNotificationLog(skippedLogId, {
      status: "skipped",
      errorMessage: `${config.label} provider is not configured`,
    });

    return {
      channel,
      status: "skipped",
      reason: `${config.label} provider is not configured`,
    };
  }

  const logId = await createNotificationLog({
    userId,
    orderId,
    returnId,
    channel,
    event,
    recipient: to,
    message: text,
    provider: config.provider(),
  });

  try {
    const sent = await config.send({
      to,
      message: text,
    });

    if (sent.skipped) {
      await updateNotificationLog(logId, {
        status: "skipped",
        errorMessage: sent.reason,
      });

      return {
        channel,
        status: "skipped",
        reason: sent.reason,
      };
    }

    await updateNotificationLog(logId, {
      status: "sent",
      provider: sent.provider,
      providerMessageId: sent.messageId,
      sentAt: true,
    });

    return {
      channel,
      status: "sent",
      to,
    };
  } catch (error) {
    console.error(
      `NOTIFY ${channel.toUpperCase()} ERROR:`,
      error.message
    );

    await updateNotificationLog(logId, {
      status: "failed",
      errorMessage: error.message,
    });

    return {
      channel,
      status: "failed",
      error: error.message,
    };
  }
};

// =====================================================
// EMAIL BHEJO + LOG KARO
// =====================================================

const dispatchEmailChannel = async ({
  to,
  subject,
  html,
  text,
  userId,
  orderId,
  returnId,
  event,
}) => {
  if (!notifyConfig.email.enabled || !to) {
    const reason = !to
      ? "customer email not available"
      : "email disabled";

    // Log bhi karo - skipped attempt notification log me dikhna chahiye
    const skippedLogId = await createNotificationLog({
      userId,
      orderId,
      returnId,
      channel: "email",
      event,
      recipient: to || null,
      subject,
      message: subject || text || null,
      provider: "gmail",
    });

    await updateNotificationLog(skippedLogId, {
      status: "skipped",
      errorMessage: reason,
    });

    return {
      channel: "email",
      status: "skipped",
      reason,
    };
  }

  const logId = await createNotificationLog({
    userId,
    orderId,
    returnId,
    channel: "email",
    event,
    recipient: to,
    subject,
    message: subject,
    provider: "gmail",
  });

  try {
    const sent = await sendEmailMessage({
      to,
      subject,
      html,
      text,
    });

    await updateNotificationLog(logId, {
      status: "sent",
      provider: sent.provider,
      providerMessageId: sent.messageId,
      sentAt: true,
    });

    return {
      channel: "email",
      status: "sent",
      to,
    };
  } catch (error) {
    console.error(
      "NOTIFY EMAIL ERROR:",
      error.message
    );

    await updateNotificationLog(logId, {
      status: "failed",
      errorMessage: error.message,
    });

    return {
      channel: "email",
      status: "failed",
      error: error.message,
    };
  }
};

// =====================================================
// CORE : NOTIFY ORDER EVENT
//
// notifyOrderEvent({
//   event: "order_shipped",
//   order, user, extra, channels, returnId
// })
//
// Ye function kabhi throw nahi karta.
// Order / refund / return ka main flow kabhi nahi rukta.
// =====================================================

const notifyOrderEvent = async ({
  event,
  order = {},
  user = {},
  extra = {},
  channels = ["email", "sms", "whatsapp"],
  returnId = null,
}) => {
  const template = getNotificationEvent(event);

  const results = [];

  if (!template) {
    console.error(
      `NOTIFY: unknown event "${event}"`
    );

    return {
      success: false,
      message: `Unknown notification event: ${event}`,
      results,
    };
  }

  const email =
    user?.email || order?.customer_email || null;

  const phone = normalizePhone(
    user?.phone ||
      order?.customer_phone ||
      order?.phone ||
      order?.address?.phone ||
      null
  );

  const userId =
    user?.id || order?.user_id || null;

  const orderId = order?.id || null;

  const subject = template.subject
    ? template.subject(order)
    : `Apple Blossom - ${event}`;

  const smsText = template.sms
    ? template.sms(order)
    : subject;

  const whatsappText = template.whatsapp
    ? template.whatsapp(order)
    : smsText;

  for (const channel of channels) {
    // -------------------------------
    // EMAIL
    // -------------------------------

    if (channel === "email") {
      const html = emailWrapper({
        title: subject,
        body: template.body
          ? template.body(order, user, extra)
          : "",
        buttonText: template.buttonText,
        buttonUrl: template.buttonUrl
          ? template.buttonUrl(order)
          : "",
      });

      results.push(
        await dispatchEmailChannel({
          to: email,
          subject,
          html,
          text: smsText,
          userId,
          orderId,
          returnId,
          event,
        })
      );

      continue;
    }

    // -------------------------------
    // SMS / WHATSAPP
    // -------------------------------

    if (channel === "sms" || channel === "whatsapp") {
      results.push(
        await dispatchTextChannel({
          channel,
          to: phone,
          text:
            channel === "sms"
              ? smsText
              : whatsappText,
          userId,
          orderId,
          returnId,
          event,
        })
      );

      continue;
    }

    results.push({
      channel,
      status: "skipped",
      reason: `Unsupported channel: ${channel}`,
    });
  }

  return {
    success: true,
    event,
    results,
  };
};

// =====================================================
// SAFE WRAPPER
// =====================================================

const notifySafe = async (options) => {
  try {
    return await notifyOrderEvent(options);
  } catch (error) {
    console.error(
      "NOTIFY SAFE ERROR:",
      error.message
    );

    return {
      success: false,
      error: error.message,
      results: [],
    };
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  notifyOrderEvent,
  notifySafe,
  normalizePhone,
  sendEmailMessage,
  sendSmsMessage,
  sendWhatsappMessage,
  createNotificationLog,
  updateNotificationLog,
  isSmsEnabled,
  isWhatsappEnabled,
};
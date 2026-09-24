// =====================================================
// APPLE BLOSSOM
// NOTIFICATION CONTROLLER  (Feature 7)
//
//   GET  /api/notifications          -> log (admin)
//   GET  /api/notifications/status   -> channels status
//   POST /api/notifications/test     -> test message
// =====================================================

const db = require("../config/db");

const {
  notifySafe,
  isSmsEnabled,
  isWhatsappEnabled,
  sendEmailMessage,
  scheduleNotification,
} = require("../services/notificationService");

const {
  notifyConfig,
} = require("../config/notify");

const promiseDb = () => db.promise();

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?.user_id ||
    req.user?.userId ||
    null
  );
};

// =====================================================
// NOTIFICATION LOG
// GET /api/notifications?channel=email&status=sent
// =====================================================

exports.getNotifications = async (req, res) => {
  try {
    const conditions = ["1 = 1"];
    const values = [];

    if (req.query?.channel) {
      conditions.push("n.channel = ?");
      values.push(req.query.channel);
    }

    if (req.query?.status) {
      conditions.push("n.status = ?");
      values.push(req.query.status);
    }

    if (req.query?.orderId) {
      conditions.push("n.order_id = ?");
      values.push(Number(req.query.orderId));
    }

    const limit = Math.min(
      Math.max(Number(req.query?.limit) || 100, 1),
      500
    );

    const [rows] = await promiseDb().execute(
      `
        SELECT
          n.*,
          o.order_number,
          u.name AS customer_name
        FROM notifications n

        LEFT JOIN orders o
          ON o.id = n.order_id

        LEFT JOIN users u
          ON u.id = n.user_id

        WHERE ${conditions.join(" AND ")}

        ORDER BY n.created_at DESC
        LIMIT ${limit}
      `,
      values
    );

    return res.json({
      success: true,
      notifications: rows,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load notifications",
    });
  }
};

// =====================================================
// CHANNEL STATUS
// GET /api/notifications/status
// =====================================================

exports.getStatus = async (req, res) => {
  return res.json({
    success: true,
    channels: {
      email: {
        enabled: notifyConfig.email.enabled,
        provider: "gmail-oauth2",
        from: process.env.EMAIL_USER || null,
      },
      sms: {
        enabled: isSmsEnabled(),
        provider: notifyConfig.sms.provider,
      },
      whatsapp: {
        enabled: isWhatsappEnabled(),
        provider: notifyConfig.whatsapp.provider,
      },
    },
    adminEmail: notifyConfig.admin.email,
  });
};

// =====================================================
// TEST NOTIFICATION
// POST /api/notifications/test
//
// body: { channel: "email"|"sms"|"whatsapp", to, message }
// =====================================================

exports.sendTest = async (req, res) => {
  try {
    const channel = String(
      req.body?.channel || "email"
    ).toLowerCase();

    const to = req.body?.to || null;

    const message =
      req.body?.message ||
      "Apple Blossom test notification. Sab kuch sahi chal raha hai.";

    const userId = getUserId(req);

    // -------------------------------
    // EMAIL
    // -------------------------------

    if (channel === "email") {
      const target =
        to ||
        notifyConfig.admin.email ||
        process.env.EMAIL_USER;

      if (!target) {
        return res.status(400).json({
          success: false,
          message:
            "Test email ke liye 'to' ya ADMIN_NOTIFICATION_EMAIL set karo",
        });
      }

      try {
        const sent = await sendEmailMessage({
          to: target,
          subject: "Apple Blossom - Test Notification",
          html: `<p>${message}</p>`,
          text: message,
        });

        return res.json({
          success: true,
          message: `Test email bheja gaya: ${target}`,
          provider: sent.provider,
          messageId: sent.messageId,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: `Email failed: ${error.message}`,
        });
      }
    }

    // -------------------------------
    // SMS / WHATSAPP
    // -------------------------------

    const result = await notifySafe({
      event: "order_confirmed",
      channels: [channel],
      order: {
        id: null,
        user_id: userId,
        order_number: "TEST-0001",
        total_amount: 0,
        customer_email: notifyConfig.admin.email,
        customer_phone: to,
      },
      user: {
        id: userId,
        email: notifyConfig.admin.email,
        phone: to,
      },
    });

    const channelResult =
      (result.results || [])[0] || {};

    return res.json({
      success: channelResult.status === "sent",
      message:
        channelResult.status === "sent"
          ? `Test ${channel} bheja gaya`
          : channelResult.reason ||
            channelResult.error ||
            `${channel} configure nahi hai`,
      result: channelResult,
    });
  } catch (error) {
    console.error("TEST NOTIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Test notification failed",
    });
  }
};

// =====================================================
// SCHEDULE NOTIFICATION
// POST /api/notifications/schedule
// =====================================================

exports.scheduleNotification = async (req, res) => {
  try {
    const channel = String(
      req.body?.channel || ""
    ).toLowerCase();

    const event = String(req.body?.event || "");
    const recipient = req.body?.recipient || null;
    const subject = req.body?.subject || null;
    const message = req.body?.message || null;
    const scheduledAt = req.body?.scheduledAt || null;

    if (!channel || !event || !scheduledAt || !recipient) {
      return res.status(400).json({
        success: false,
        message:
          "channel, event, recipient, and scheduledAt are required",
      });
    }

    const result = await scheduleNotification({
      userId: getUserId(req),
      channel,
      event,
      recipient,
      subject,
      message,
      scheduledAt,
    });

    return res.json({
      success: true,
      message: "Notification scheduled successfully",
      notification: result,
    });
  } catch (error) {
    console.error("SCHEDULE NOTIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to schedule notification",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getNotifications: exports.getNotifications,
  getStatus: exports.getStatus,
  sendTest: exports.sendTest,
  scheduleNotification: exports.scheduleNotification,
};
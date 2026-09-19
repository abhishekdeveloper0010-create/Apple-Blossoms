import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_SERVER_API_URL ||
  "http://localhost:4000/api";

// =====================================================
// STEP 4 : NOTIFICATION LOG (Feature 7)
//
//   GET  /api/notifications?channel=&status=&orderId=
//   GET  /api/notifications/status   -> channels status
//   POST /api/notifications/test     -> test message
// =====================================================

const channelFilters = ["", "email", "sms", "whatsapp"];
const statusFilters = ["", "sent", "pending", "failed", "skipped"];

function NotificationManagement() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [channels, setChannels] = useState(null);

  const [filters, setFilters] = useState({
    channel: "",
    status: "",
    orderId: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [testForm, setTestForm] = useState({
    channel: "email",
    to: "",
    message: "",
  });

  const [testing, setTesting] = useState(false);

  const token = localStorage.getItem("token") || "";

  const headers = (json = false) => ({
    ...(json ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  });

  // ---------------------------------------------------
  // LOAD
  // ---------------------------------------------------

  const loadNotifications = async (current = filters) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (current.channel) {
        params.set("channel", current.channel);
      }

      if (current.status) {
        params.set("status", current.status);
      }

      if (current.orderId) {
        params.set("orderId", current.orderId);
      }

      params.set("limit", "200");

      const response = await fetch(
        `${API_URL}/notifications?${params.toString()}`,
        { headers: headers() }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load notifications"
        );
      }

      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const response = await fetch(
        `${API_URL}/notifications/status`,
        { headers: headers() }
      );

      const data = await response.json();

      if (data.success) {
        setChannels(data.channels || null);
      }
    } catch (err) {
      console.error("NOTIFICATION STATUS ERROR:", err);
    }
  };

  useEffect(() => {
    loadStatus();
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------
  // FILTERS
  // ---------------------------------------------------

  const applyFilters = () => {
    loadNotifications(filters);
  };

  const resetFilters = () => {
    const cleared = { channel: "", status: "", orderId: "" };

    setFilters(cleared);
    loadNotifications(cleared);
  };

  // ---------------------------------------------------
  // TEST MESSAGE
  // ---------------------------------------------------

  const sendTest = async (e) => {
    e.preventDefault();

    try {
      setTesting(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/notifications/test`,
        {
          method: "POST",
          headers: headers(true),
          body: JSON.stringify({
            channel: testForm.channel,
            to: testForm.to || null,
            message: testForm.message || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Test notification failed"
        );
      }

      setMessage(data.message || "Test message sent");
      loadNotifications();
    } catch (err) {
      setError(err.message);
    } finally {
      setTesting(false);
    }
  };

  // ---------------------------------------------------
  // HELPERS
  // ---------------------------------------------------

  const formatDateTime = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusClass = (status) => {
    switch (status) {
      case "sent":
        return "bg-green-50 text-green-700 border-green-200";

      case "failed":
        return "bg-red-50 text-red-700 border-red-200";

      case "skipped":
        return "bg-slate-50 text-slate-600 border-slate-200";

      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  const channelIcon = (channel) => {
    if (channel === "email") return "✉️";
    if (channel === "sms") return "📱";
    if (channel === "whatsapp") return "💬";
    return "";
  };

  const channelList = channels
    ? Object.keys(channels).map((key) => ({
        key,
        ...channels[key],
      }))
    : [];

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------

  return (
    <main className="min-h-screen w-full bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1400px]">

        {/* ================= HEADER ================= */}

        <div className="mb-5 sm:mb-6">

          <button
            onClick={() => navigate("/admin")}
            className="mb-4 inline-flex items-center text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
          >
            ← Back to Admin
          </button>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
                Notifications
              </h1>

              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Email, SMS aur WhatsApp messages ka poora log.
              </p>
            </div>

            <button
              onClick={() => {
                loadStatus();
                loadNotifications();
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
            >
              ↻ Refresh
            </button>
          </div>

        </div>

        {/* ================= CHANNEL STATUS ================= */}

        {channelList.length > 0 && (
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            {channelList.map((channel) => (
              <div
                key={channel.key}
                className="rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold capitalize text-slate-800">
                    {channelIcon(channel.key)} {channel.key}
                  </p>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      channel.enabled
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    {channel.enabled ? "enabled" : "disabled"}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Provider: {channel.provider || "-"}
                </p>

                {channel.from && (
                  <p className="mt-1 break-all text-xs text-slate-500">
                    From: {channel.from}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ================= TEST MESSAGE ================= */}

        <form
          onSubmit={sendTest}
          className="mb-5 rounded-2xl bg-white p-4 shadow-sm sm:p-5"
        >
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            Send Test Message
          </h2>

          <div className="mt-3 grid gap-3 sm:grid-cols-4">

            <select
              value={testForm.channel}
              onChange={(e) =>
                setTestForm({
                  ...testForm,
                  channel: e.target.value,
                })
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="email">email</option>
              <option value="sms">sms</option>
              <option value="whatsapp">whatsapp</option>
            </select>

            <input
              value={testForm.to}
              onChange={(e) =>
                setTestForm({ ...testForm, to: e.target.value })
              }
              placeholder={
                testForm.channel === "email"
                  ? "email@example.com"
                  : "+919999999999"
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 sm:col-span-2"
            />

            <button
              type="submit"
              disabled={testing}
              className="rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-60"
            >
              {testing ? "Sending..." : "Send Test"}
            </button>

          </div>

          <input
            value={testForm.message}
            onChange={(e) =>
              setTestForm({
                ...testForm,
                message: e.target.value,
              })
            }
            placeholder="Custom message (optional)"
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />

        </form>

        {/* ================= FILTERS ================= */}

        <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <select
              value={filters.channel}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  channel: e.target.value,
                })
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              {channelFilters.map((channel) => (
                <option key={channel || "all"} value={channel}>
                  {channel || "All channels"}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value,
                })
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              {statusFilters.map((status) => (
                <option key={status || "all"} value={status}>
                  {status || "All status"}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={filters.orderId}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  orderId: e.target.value,
                })
              }
              placeholder="Order ID"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />

            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800"
              >
                Apply
              </button>

              <button
                onClick={resetFilters}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>

          </div>
        </div>

        {/* ================= MESSAGE ================= */}

        {message && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 sm:text-base">
            <span>{message}</span>

            <button
              onClick={() => setMessage("")}
              className="font-bold text-green-700 hover:text-green-900"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:text-base">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="font-bold text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {/* ================= LOADING ================= */}

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-700" />

            <p className="text-sm text-slate-500 sm:text-base">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          /* ================= EMPTY ================= */
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mb-3 text-4xl">🔔</div>

            <h2 className="text-lg font-bold text-slate-800">
              No notifications found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Filters badlo ya test message bhejo - log yahan dikhega.
            </p>
          </div>
        ) : (
          /* ================= LIST ================= */
          <div className="grid gap-3">

            {notifications.map((row) => (
              <div
                key={row.id}
                className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
              >

                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 sm:text-base">
                      {channelIcon(row.channel)} {row.channel} •{" "}
                      {row.event}
                    </p>

                    <p className="mt-1 break-all text-xs text-slate-500 sm:text-sm">
                      To: {row.recipient || "-"}
                    </p>

                    {row.subject && (
                      <p className="mt-1 break-words text-xs text-slate-500 sm:text-sm">
                        Subject: {row.subject}
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                      row.status
                    )}`}
                  >
                    {row.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>
                    Order: {row.order_number || row.order_id || "-"}
                  </span>

                  <span>Customer: {row.customer_name || "-"}</span>

                  <span>
                    Created: {formatDateTime(row.created_at)}
                  </span>

                  {row.sent_at && (
                    <span>
                      Sent: {formatDateTime(row.sent_at)}
                    </span>
                  )}

                  {row.provider && (
                    <span>Provider: {row.provider}</span>
                  )}
                </div>

                {row.message && (
                  <p className="mt-3 break-words rounded-xl bg-slate-50 p-3 text-xs text-slate-600 sm:text-sm">
                    {row.message}
                  </p>
                )}

                {row.error_message && (
                  <p className="mt-3 break-words rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:text-sm">
                    {row.error_message}
                  </p>
                )}

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}

export default NotificationManagement;
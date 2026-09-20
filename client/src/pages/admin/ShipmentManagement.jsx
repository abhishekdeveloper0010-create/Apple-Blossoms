import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_SERVER_API_URL ||
  "http://localhost:4000/api";

// =====================================================
// STEP 4 : SHIPMENT / TRACKING MANAGEMENT (Feature 4 & 5)
//
//   GET   /api/shipments/config             -> provider + statuses
//   GET   /api/shipments                    -> saare shipments
//   POST  /api/shipments                    -> shipment banao
//   PATCH /api/shipments/:orderId/tracking  -> manual tracking update
//   POST  /api/shipments/:orderId/sync      -> courier se tracking sync
// =====================================================

const emptyCreate = {
  orderId: "",
  provider: "manual",
  courierName: "",
  awbNumber: "",
  trackingUrl: "",
  weightGrams: "",
  estimatedDelivery: "",
  notify: "true",
};

const emptyTracking = {
  courierName: "",
  awbNumber: "",
  trackingUrl: "",
  status: "Created",
};

function ShipmentManagement() {
  const navigate = useNavigate();

  const [shipments, setShipments] = useState([]);

  const [config, setConfig] = useState({
    provider: "manual",
    shiprocketEnabled: false,
    defaultCourier: "Delhivery",
    statuses: [
      "Created",
      "Picked Up",
      "In Transit",
      "Out for Delivery",
      "Delivered",
      "RTO",
      "Cancelled",
    ],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreate);

  const [trackingRow, setTrackingRow] = useState(null);
  const [trackingForm, setTrackingForm] =
    useState(emptyTracking);

  const token = localStorage.getItem("token") || "";

  const headers = (json = false) => ({
    ...(json ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  });

  // ---------------------------------------------------
  // LOAD
  // ---------------------------------------------------

  const loadShipments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/shipments`,
        { headers: headers() }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load shipments"
        );
      }

      setShipments(data.shipments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const response = await fetch(
        `${API_URL}/shipments/config`,
        { headers: headers() }
      );

      const data = await response.json();

      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (err) {
      console.error("SHIPPING CONFIG ERROR:", err);
    }
  };

  useEffect(() => {
    loadConfig();
    loadShipments();
  }, []);

  // ---------------------------------------------------
  // CREATE SHIPMENT
  // ---------------------------------------------------

  const createShipment = async (e) => {
    e.preventDefault();

    if (!createForm.orderId) {
      setError("Order ID required hai");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const body = {
        orderId: Number(createForm.orderId),
        provider: createForm.provider,
        notify: createForm.notify,
      };

      if (createForm.courierName) {
        body.courierName = createForm.courierName;
      }

      if (createForm.awbNumber) {
        body.awbNumber = createForm.awbNumber;
      }

      if (createForm.trackingUrl) {
        body.trackingUrl = createForm.trackingUrl;
      }

      if (createForm.weightGrams) {
        body.weightGrams = Number(
          createForm.weightGrams
        );
      }

      if (createForm.estimatedDelivery) {
        body.estimatedDelivery =
          createForm.estimatedDelivery;
      }

      const response = await fetch(
        `${API_URL}/shipments`,
        {
          method: "POST",
          headers: headers(true),
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create shipment"
        );
      }

      setMessage(data.message || "Shipment created");
      setShowCreate(false);
      setCreateForm(emptyCreate);
      loadShipments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------
  // MANUAL TRACKING UPDATE
  // ---------------------------------------------------

  const openTracking = (row) => {
    setError("");
    setMessage("");
    setTrackingRow(row);

    setTrackingForm({
      courierName: row.courier_name || "",
      awbNumber: row.awb_number || "",
      trackingUrl: row.tracking_url || "",
      status: row.status || "Created",
    });
  };

  const closeTracking = () => {
    setTrackingRow(null);
    setTrackingForm(emptyTracking);
  };

  const saveTracking = async () => {
    if (!trackingRow) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_URL}/shipments/${trackingRow.order_id}/tracking`,
        {
          method: "PATCH",
          headers: headers(true),
          body: JSON.stringify({
            courierName:
              trackingForm.courierName || null,
            awbNumber: trackingForm.awbNumber || null,
            trackingUrl:
              trackingForm.trackingUrl || null,
            status: trackingForm.status || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update tracking"
        );
      }

      setMessage(
        data.message || "Tracking details updated"
      );

      closeTracking();
      loadShipments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------
  // COURIER SYNC
  // ---------------------------------------------------

  const syncTracking = async (row) => {
    try {
      setSyncingId(row.id);
      setError("");

      const response = await fetch(
        `${API_URL}/shipments/${row.order_id}/sync`,
        {
          method: "POST",
          headers: headers(true),
          body: JSON.stringify({}),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to sync tracking"
        );
      }

      setMessage(data.message || "Tracking refreshed");
      loadShipments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncingId(null);
    }
  };

  const openTrackingUrl = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ---------------------------------------------------
  // HELPERS
  // ---------------------------------------------------

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString(
      "en-IN",
      { day: "numeric", month: "short", year: "numeric" }
    );
  };

  const statusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-50 text-green-700 border-green-200";

      case "Cancelled":
      case "RTO":
        return "bg-red-50 text-red-700 border-red-200";

      case "In Transit":
      case "Out for Delivery":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Picked Up":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";

      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  const statuses = Array.isArray(config.statuses)
    ? config.statuses
    : [];

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------

  return (
    <main className="min-h-screen w-full bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 md:px-7 lg:px-10 xl:px-12 2xl:px-16">
      <div className="w-full">

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
                Shipment & Tracking
              </h1>

              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Create shipments, add tracking numbers and sync courier status.
              </p>
            </div>

            <button
              onClick={() => {
                setError("");
                setMessage("");
                setCreateForm(emptyCreate);
                setShowCreate(true);
              }}
              className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800"
            >
              + New Shipment
            </button>
          </div>

        </div>

        {/* ================= CONFIG ================= */}

        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
          <span className="font-semibold">
            Provider: {config.provider}
          </span>

          <span className="text-cyan-300">|</span>

          <span>
            Shiprocket:{" "}
            <span className="font-semibold">
              {config.shiprocketEnabled
                ? "enabled"
                : "disabled"}
            </span>
          </span>

          <span className="text-cyan-300">|</span>

          <span>Default courier: {config.defaultCourier}</span>{" "}
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

        {error && !showCreate && !trackingRow && (
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
              Loading shipments...
            </p>
          </div>
        ) : shipments.length === 0 ? (
          /* ================= EMPTY ================= */
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mb-3 text-4xl">🚚</div>

            <h2 className="text-lg font-bold text-slate-800">
              No shipments yet
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              "+ New Shipment" se order ka shipment banao.
            </p>
          </div>
        ) : (
          /* ================= LIST ================= */
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">

            {shipments.map((row) => (
              <div
                key={row.id}
                className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
              >

                {/* CARD HEADER */}

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-bold text-slate-900 sm:text-lg">
                      Order{" "}
                      {row.order_number ||
                        `#${row.order_id}`}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Shipment #{row.id} • Updated{" "}
                      {formatDate(
                        row.last_tracked_at ||
                          row.updated_at
                      )}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                      row.status
                    )}`}
                  >
                    {row.status}
                  </span>
                </div>

                {/* COURIER + TRACKING */}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 p-3">
                    <p className="text-xs text-slate-400">
                      Courier
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {row.courier_name || "-"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Provider: {row.provider || "-"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Payment: {row.payment_mode || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 p-3">
                    <p className="text-xs text-slate-400">
                      Tracking Number
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                      {row.awb_number || "pending"}
                    </p>

                    {row.tracking_url ? (
                      <button
                        onClick={() =>
                          openTrackingUrl(row.tracking_url)
                        }
                        className="mt-1 text-xs font-semibold text-cyan-700 hover:underline"
                      >
                        Open tracking link →
                      </button>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">
                        No tracking link
                      </p>
                    )}
                  </div>
                </div>

                {/* DATES + CUSTOMER */}

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Delivery
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      ETA: {formatDate(row.estimated_delivery)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Shipped: {formatDate(row.shipped_at)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Delivered: {formatDate(row.delivered_at)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Customer
                    </p>

                    <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                      {row.customer_name || "-"}
                    </p>

                    {row.customer_email && (
                      <p className="mt-1 break-all text-xs text-slate-500">
                        {row.customer_email}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-slate-500">
                      Order status: {row.order_status || "-"}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => openTracking(row)}
                    className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
                  >
                    Update Tracking
                  </button>

                  {config.shiprocketEnabled && (
                    <button
                      onClick={() => syncTracking(row)}
                      disabled={syncingId === row.id}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      {syncingId === row.id
                        ? "Syncing..."
                        : "↻ Sync Courier"}
                    </button>
                  )}
                </div>

              </div>
            ))}

          </div>
        )}

        {/* ================= CREATE SHIPMENT MODAL ================= */}

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">

            <form
              onSubmit={createShipment}
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
            >

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-lg font-bold text-slate-900">
                  New Shipment
                </h2>

                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="text-2xl leading-none text-slate-400 transition hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto px-5 py-5">

                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid gap-4">

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Order ID *
                    </label>

                    <input
                      required
                      type="number"
                      min="1"
                      value={createForm.orderId}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          orderId: e.target.value,
                        })
                      }
                      placeholder="e.g. 12"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Provider
                      </label>

                      <select
                        value={createForm.provider}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            provider: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      >
                        <option value="manual">manual</option>
                        <option value="shiprocket">
                          shiprocket
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Notify Customer
                      </label>

                      <select
                        value={createForm.notify}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            notify: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Courier Name
                      </label>

                      <input
                        value={createForm.courierName}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            courierName: e.target.value,
                          })
                        }
                        placeholder={config.defaultCourier}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Tracking / AWB Number
                      </label>

                      <input
                        value={createForm.awbNumber}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            awbNumber: e.target.value,
                          })
                        }
                        placeholder="AWB123456"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Tracking URL
                    </label>

                    <input
                      value={createForm.trackingUrl}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          trackingUrl: e.target.value,
                        })
                      }
                      placeholder="https://courier.com/track/..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Weight (grams)
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={createForm.weightGrams}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            weightGrams: e.target.value,
                          })
                        }
                        placeholder="500"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Estimated Delivery
                      </label>

                      <input
                        type="date"
                        value={createForm.estimatedDelivery}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            estimatedDelivery: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                  </div>

                </div>

              </div>

              <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create Shipment"}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ================= UPDATE TRACKING MODAL ================= */}

        {trackingRow && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">

            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Tracking - Order{" "}
                  {trackingRow.order_number ||
                    `#${trackingRow.order_id}`}
                </h2>

                <button
                  onClick={closeTracking}
                  className="text-2xl leading-none text-slate-400 transition hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto px-5 py-5">

                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid gap-4">

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Courier Name
                    </label>

                    <input
                      value={trackingForm.courierName}
                      onChange={(e) =>
                        setTrackingForm({
                          ...trackingForm,
                          courierName: e.target.value,
                        })
                      }
                      placeholder={config.defaultCourier}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Tracking / AWB Number
                    </label>

                    <input
                      value={trackingForm.awbNumber}
                      onChange={(e) =>
                        setTrackingForm({
                          ...trackingForm,
                          awbNumber: e.target.value,
                        })
                      }
                      placeholder="AWB123456"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Tracking URL
                    </label>

                    <input
                      value={trackingForm.trackingUrl}
                      onChange={(e) =>
                        setTrackingForm({
                          ...trackingForm,
                          trackingUrl: e.target.value,
                        })
                      }
                      placeholder="https://courier.com/track/..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Shipment Status
                    </label>

                    <select
                      value={trackingForm.status}
                      onChange={(e) =>
                        setTrackingForm({
                          ...trackingForm,
                          status: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

              </div>

              <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  onClick={closeTracking}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={saveTracking}
                  disabled={saving}
                  className="rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Tracking"}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default ShipmentManagement;
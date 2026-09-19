import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// =====================================================
// MY RETURNS  (STEP 4 - Feature 1 & 2)
//
//   GET /api/returns/my        -> apne saare return requests
//   GET /api/returns/settings  -> return window + refund methods
// =====================================================

const statusStyles = {
  Pending: "border-amber-200 bg-amber-100 text-amber-700",
  Approved: "border-sky-200 bg-sky-100 text-sky-700",
  "Picked Up": "border-indigo-200 bg-indigo-100 text-indigo-700",
  Refunded: "border-emerald-200 bg-emerald-100 text-emerald-700",
  Completed: "border-emerald-200 bg-emerald-100 text-emerald-700",
  Rejected: "border-red-200 bg-red-100 text-red-700",
  Cancelled: "border-slate-200 bg-slate-100 text-slate-600",
};

function MyReturns() {
  const API_URL =
    import.meta.env.VITE_SERVER_API_URL || "http://localhost:4000/api";

  const IMAGE_URL =
    import.meta.env.VITE_SERVER_IMAGES_URL || "http://localhost:4000/images";

  // =====================================================
  // STATES
  // =====================================================

  const [returns, setReturns] = useState([]);
  const [settings, setSettings] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // HELPERS
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  };

  const getImageURL = (image) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${IMAGE_URL}/${image.replace(/^\/+/, "")}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
    }

    return parsed.toLocaleString();
  };

  const money = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  // =====================================================
  // LOAD RETURNS
  // =====================================================

  const loadReturns = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login first to see your returns.");
        setReturns([]);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [returnsResponse, settingsResponse] = await Promise.all([
        fetch(`${API_URL}/returns/my`, { headers }),
        fetch(`${API_URL}/returns/settings`, { headers }),
      ]);

      const returnsData = await returnsResponse.json();

      if (!returnsResponse.ok || !returnsData.success) {
        throw new Error(returnsData.message || "Failed to load returns");
      }

      setReturns(
        Array.isArray(returnsData.returns) ? returnsData.returns : [],
      );

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();

        if (settingsData.success) {
          setSettings(settingsData.settings);
        }
      }
    } catch (err) {
      console.error("LOAD RETURNS ERROR:", err);

      setError(err.message || "Failed to load returns");

      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  // =====================================================
  // FILTER
  // =====================================================

  const statusOptions = [
    "",
    ...new Set(returns.map((row) => row.status).filter(Boolean)),
  ];

  const visibleReturns = statusFilter
    ? returns.filter((row) => row.status === statusFilter)
    : returns;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-[1200px] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />

            <h2 className="text-xl font-bold text-slate-800">
              Loading your returns...
            </h2>

            <p className="mt-2 text-sm text-slate-500">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1200px] px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
        {/* =====================================================
            HERO
        ===================================================== */}

        <div className="mb-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-orange-900 p-6 text-white shadow-xl sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-orange-200">
            Returns &amp; Refunds
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            My Returns
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Apne saare return requests yahan track karo.
            {settings?.returnWindowDays
              ? ` Return window: ${settings.returnWindowDays} days after delivery.`
              : ""}
          </p>

          <Link
            to="/order-tracking"
            className="mt-5 inline-flex w-fit items-center justify-center rounded-2xl bg-white px-5 py-3 font-bold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-50"
          >
            ← Back to Orders
          </Link>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            FILTER
        ===================================================== */}

        {statusOptions.length > 1 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {statusOptions.map((option) => (
              <button
                key={option || "all"}
                type="button"
                onClick={() => setStatusFilter(option)}
                className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                  statusFilter === option
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-sky-300"
                }`}
              >
                {option || "All"}
              </button>
            ))}
          </div>
        )}

        {/* =====================================================
            LIST
        ===================================================== */}

        {visibleReturns.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-5xl">↩</p>

            <h2 className="mt-4 text-xl font-black text-slate-800">
              No returns found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Jab aap kisi delivered product ka return request karoge, wo
              yahan dikhega.
            </p>

            <Link
              to="/order-tracking"
              className="mt-6 inline-flex rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
            >
              View My Orders
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleReturns.map((row) => {
              const statusClass =
                statusStyles[row.status] ||
                "border-slate-200 bg-slate-100 text-slate-600";

              const image = getImageURL(row.image);

              return (
                <div
                  key={row.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                      {image ? (
                        <img
                          src={image}
                          alt={row.product_name || "Product"}
                          className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                          📦
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-black text-slate-800">
                          {row.product_name || "Product"}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Return #{row.id} • Order #
                          {row.order_number || row.order_id}
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          <span className="font-bold">Qty:</span>{" "}
                          {row.quantity || 1}
                        </p>

                        {row.reason && (
                          <p className="mt-1 text-sm text-slate-500">
                            <span className="font-bold">Reason:</span>{" "}
                            {row.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}
                    >
                      {row.status}
                    </span>
                  </div>
{/* =================================================
                      DETAILS
                  ================================================= */}

                  <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Requested On
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {formatDate(row.created_at)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Refund Amount
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {Number(row.refund_amount) > 0
                          ? money(row.refund_amount)
                          : "Pending"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Refund Method
                      </p>

                      <p className="mt-1 text-sm font-bold capitalize text-slate-800">
                        {row.refund_method || "-"}
                      </p>
                    </div>
                  </div>

                  {row.refund_reference && (
                    <p className="mt-3 break-all text-xs text-slate-500">
                      <span className="font-bold">Reference:</span>{" "}
                      {row.refund_reference}
                    </p>
                  )}

                  {row.admin_note && (
                    <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-sky-600">
                        Admin Note
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {row.admin_note}
                      </p>
                    </div>
                  )}

                  {row.pickup_date && (
                    <p className="mt-3 text-xs text-slate-500">
                      <span className="font-bold">Pickup:</span>{" "}
                      {formatDate(row.pickup_date)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* =====================================================
            INFO
        ===================================================== */}

        {settings?.refundMethods?.length > 0 && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Good to know
            </p>

            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                • Return window:{" "}
                <span className="font-bold">
                  {settings.returnWindowDays} days
                </span>{" "}
                after delivery.
              </li>

              <li>
                • Refund methods:{" "}
                <span className="font-bold capitalize">
                  {settings.refundMethods.join(", ")}
                </span>
              </li>

              <li>
                • Wallet refunds instant hote hain, bank refunds 5-7 working
                days le sakte hain.
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// EXPORT
// =====================================================

export default MyReturns;
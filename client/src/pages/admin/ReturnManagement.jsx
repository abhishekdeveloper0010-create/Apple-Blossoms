import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_SERVER_API_URL || "http://localhost:4000/api";

// =====================================================
// STEP 4 : RETURN MANAGEMENT  (Feature 1 & 2 & 3)
//
//   GET   /api/returns?status=Pending   -> saare returns
//   GET   /api/returns/settings         -> window + refund methods
//   PATCH /api/returns/:id/approve      -> approve
//   PATCH /api/returns/:id/reject       -> reject
//   PATCH /api/returns/:id/picked-up    -> pickup done
//   POST  /api/returns/:id/refund       -> actual refund
// =====================================================

const statusFilters = [
  "",
  "Pending",
  "Approved",
  "Picked Up",
  "Refunded",
  "Rejected",
];

const emptyForm = {
  refundAmount: "",
  refundMethod: "wallet",
  pickupDate: "",
  adminNote: "",
  referenceId: "",
  notes: "",
};

function ReturnManagement() {
  const navigate = useNavigate();

  const [returns, setReturns] = useState([]);

  const [settings, setSettings] = useState({
    refundMethods: ["wallet", "razorpay", "manual", "cod"],
    returnWindowDays: 0,
  });

  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [action, setAction] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token") || "";

  const headers = (json = false) => ({
    ...(json ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  });

  const refundMethods =
    Array.isArray(settings.refundMethods) && settings.refundMethods.length
      ? settings.refundMethods
      : ["wallet", "razorpay", "manual", "cod"];

  // ---------------------------------------------------
  // LOAD
  // ---------------------------------------------------

  const loadReturns = async (status) => {
    try {
      setLoading(true);
      setError("");

      const query = status ? `?status=${encodeURIComponent(status)}` : "";

      const response = await fetch(`${API_URL}/returns${query}`, {
        headers: headers(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load returns");
      }

      setReturns(data.returns || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/returns/settings`, {
        headers: headers(),
      });

      const data = await response.json();

      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("RETURN SETTINGS ERROR:", err);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    loadReturns(statusFilter);
  }, [statusFilter]);

  // ---------------------------------------------------
  // ACTIONS
  // ---------------------------------------------------

  const openAction = (row, mode) => {
    setError("");
    setMessage("");
    setAction({ row, mode });

    setForm({
      ...emptyForm,
      refundAmount:
        Number(row.refund_amount) > 0 ? String(row.refund_amount) : "",
      refundMethod: row.refund_method || refundMethods[0] || "wallet",
      pickupDate: row.pickup_date ? String(row.pickup_date).slice(0, 10) : "",
    });
  };

  const closeAction = () => {
    setAction(null);
    setForm(emptyForm);
  };

  const markPickedUp = async (row) => {
    if (!window.confirm(`Mark return #${row.id} as picked up?`)) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/returns/${row.id}/picked-up`, {
        method: "PATCH",
        headers: headers(true),
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update pickup");
      }

      setMessage(data.message || "Return marked as picked up");

      loadReturns(statusFilter);
    } catch (err) {
      setError(err.message);
    }
  };

  const submitAction = async () => {
    if (!action) return;

    const { row, mode } = action;

    try {
      setSaving(true);
      setError("");

      let url = "";
      let method = "PATCH";

      const body = {};

      // -------------------------------
      // APPROVE
      // -------------------------------

      if (mode === "approve") {
        url = `${API_URL}/returns/${row.id}/approve`;

        body.adminNote = form.adminNote || null;
        body.refundMethod = form.refundMethod || null;
        body.pickupDate = form.pickupDate || null;

        if (form.refundAmount !== "") {
          body.refundAmount = Number(form.refundAmount);
        }
      }

      // -------------------------------
      // REJECT
      // -------------------------------
      else if (mode === "reject") {
        url = `${API_URL}/returns/${row.id}/reject`;

        body.adminNote = form.adminNote || "Rejected by admin";
      }

      // -------------------------------
      // ACTUAL REFUND
      // -------------------------------
      else {
        url = `${API_URL}/returns/${row.id}/refund`;
        method = "POST";

        body.method = form.refundMethod || "wallet";
        body.referenceId = form.referenceId || null;
        body.notes = form.notes || null;

        if (form.refundAmount !== "") {
          body.amount = Number(form.refundAmount);
        }
      }

      const response = await fetch(url, {
        method,
        headers: headers(true),
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Action failed");
      }

      setMessage(data.message || "Done");
      closeAction();
      loadReturns(statusFilter);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------
  // HELPERS
  // ---------------------------------------------------

  const money = (value) => `₹${Number(value || 0).toFixed(2)}`;

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusClass = (status) => {
    switch (status) {
      case "Refunded":
      case "Completed":
        return "bg-green-50 text-green-700 border-green-200";

      case "Rejected":
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      case "Picked Up":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Approved":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";

      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  const modalTitle =
    action?.mode === "approve"
      ? `Approve Return #${action.row.id}`
      : action?.mode === "reject"
        ? `Reject Return #${action.row.id}`
        : `Refund Return #${action?.row?.id}`;

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
                Return Management
              </h1>

              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Approve, reject, pickup and refund customer return requests.
              </p>
            </div>

            <button
              onClick={() => loadReturns(statusFilter)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* ================= FILTERS ================= */}
        <br />
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {statusFilters.map((status) => (
            <button
              key={status || "all"}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                statusFilter === status
                  ? "border-cyan-700 bg-cyan-700 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:text-cyan-700"
              }`}
            >
              {status || "All"}
            </button>
          ))}

          {settings.returnWindowDays > 0 && (
            <span className="ml-auto text-xs font-semibold uppercase tracking-wide text-slate-400">
              Return window: {settings.returnWindowDays} days
            </span>
          )}
        </div>
        <br />

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

        {error && !action && (
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
              Loading returns...
            </p>
          </div>
        ) : returns.length === 0 ? (
          /* ================= EMPTY ================= */
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mb-3 text-4xl">↩️</div>

            <h2 className="text-lg font-bold text-slate-800">
              No return requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {statusFilter
                ? `No "${statusFilter}" return requests found.`
                : "Customer return requests will appear here."}
            </p>
          </div>
        ) : (
          /* ================= LIST ================= */
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {returns.map((row) => (
              <div
                key={row.id}
                className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
              >
                {/* CARD HEADER */}

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-bold text-slate-900 sm:text-lg">
                      Return #{row.id}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Order {row.order_number || `#${row.order_id}`} •{" "}
                      {formatDate(row.created_at)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                      row.status,
                    )}`}
                  >
                    {row.status}
                  </span>
                </div>

                {/* CUSTOMER */}

                <div className="mt-4 rounded-xl bg-slate-50 p-3 sm:p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Customer
                  </p>

                  <p className="break-words text-sm font-semibold text-slate-900 sm:text-base">
                    {row.customer_name || `User #${row.user_id}`}
                  </p>

                  {row.customer_email && (
                    <p className="mt-1 break-all text-xs text-slate-500 sm:text-sm">
                      {row.customer_email}
                    </p>
                  )}

                  {row.customer_phone && (
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      {row.customer_phone}
                    </p>
                  )}
                </div>

                {/* PRODUCT + REASON */}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 p-3">
                    <p className="text-xs text-slate-400">Product</p>

                    <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                      {row.product_name || `Product #${row.product_id}`}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Qty: {row.quantity}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 p-3">
                    <p className="text-xs text-slate-400">Refund Amount</p>

                    <p className="mt-1 text-base font-bold text-cyan-700">
                      {money(row.refund_amount)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {row.refund_method || "-"} •{" "}
                      {row.refund_status || "not processed"}
                    </p>
                  </div>
                </div>

                {/* REASON */}

                <div className="mt-3 rounded-xl border border-slate-100 p-3">
                  <p className="text-xs text-slate-400">Reason</p>

                  <p className="mt-1 break-words text-sm text-slate-700">
                    {row.reason || "-"}
                  </p>

                  {row.customer_note && (
                    <p className="mt-2 break-words text-xs text-slate-500">
                      Customer note: {row.customer_note}
                    </p>
                  )}

                  {row.admin_note && (
                    <p className="mt-2 break-words text-xs text-slate-500">
                      Admin note: {row.admin_note}
                    </p>
                  )}

                  {row.refund_reference && (
                    <p className="mt-2 break-all text-xs text-slate-500">
                      Refund reference: {row.refund_reference}
                    </p>
                  )}

                  {row.picked_up_at && (
                    <p className="mt-2 text-xs text-slate-500">
                      Picked up: {formatDate(row.picked_up_at)}
                    </p>
                  )}
                </div>

                {/* ACTIONS */}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  {row.status === "Pending" && (
                    <>
                      <button
                        onClick={() => openAction(row, "approve")}
                        className="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => openAction(row, "reject")}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {row.status === "Approved" && (
                    <>
                      <button
                        onClick={() => markPickedUp(row)}
                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Mark Picked Up
                      </button>

                      <button
                        onClick={() => openAction(row, "refund")}
                        className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                      >
                        Process Refund
                      </button>

                      <button
                        onClick={() => openAction(row, "reject")}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {row.status === "Picked Up" && (
                    <button
                      onClick={() => openAction(row, "refund")}
                      className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      Process Refund
                    </button>
                  )}

                  {(row.status === "Refunded" || row.status === "Rejected") && (
                    <span className="text-sm font-semibold text-slate-400">
                      {row.status === "Refunded"
                        ? "Refund completed"
                        : "Return rejected"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= ACTION MODAL ================= */}

        {action && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-lg font-bold text-slate-900">
                  {modalTitle}
                </h2>

                <button
                  onClick={closeAction}
                  className="text-2xl leading-none text-slate-400 transition hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto px-5 py-5">
                {/* SUMMARY */}

                <div className="mb-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-800">
                      {action.row.product_name ||
                        `Product #${action.row.product_id}`}
                    </span>{" "}
                    • Qty {action.row.quantity}
                  </p>

                  <p className="mt-1">
                    Order {action.row.order_number || `#${action.row.order_id}`}{" "}
                    •{" "}
                    {action.row.customer_name || `User #${action.row.user_id}`}
                  </p>

                  <p className="mt-1">Reason: {action.row.reason || "-"}</p>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid gap-4">
                  {/* REFUND AMOUNT */}

                  {action.mode !== "reject" && (
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Refund Amount (₹)
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.refundAmount}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            refundAmount: e.target.value,
                          })
                        }
                        placeholder={
                          Number(action.row.refund_amount) > 0
                            ? "Approved amount"
                            : "Auto calculate"
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                  )}

                  {/* REFUND METHOD */}

                  {action.mode !== "reject" && (
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Refund Method
                      </label>

                      <select
                        value={form.refundMethod}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            refundMethod: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      >
                        {refundMethods.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* PICKUP DATE */}

                  {action.mode === "approve" && (
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Pickup Date
                      </label>

                      <input
                        type="date"
                        value={form.pickupDate}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            pickupDate: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                  )}

                  {/* REFUND REFERENCE */}

                  {action.mode === "refund" &&
                    ["manual", "cod"].includes(form.refundMethod) && (
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Reference / UTR
                        </label>

                        <input
                          value={form.referenceId}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              referenceId: e.target.value,
                            })
                          }
                          placeholder="UTR / receipt number"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                        />
                      </div>
                    )}

                  {/* NOTE */}

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {action.mode === "reject"
                        ? "Rejection Reason"
                        : "Admin Note"}
                    </label>

                    <textarea
                      rows={3}
                      value={form.adminNote}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          adminNote: e.target.value,
                        })
                      }
                      placeholder={
                        action.mode === "reject"
                          ? "Return kyun reject kiya ja raha hai..."
                          : "Internal note (customer ko dikhega)"
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  {/* REFUND NOTES */}

                  {action.mode === "refund" && (
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Refund Notes
                      </label>

                      <textarea
                        rows={2}
                        value={form.notes}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            notes: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  onClick={closeAction}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={submitAction}
                  disabled={saving}
                  className="rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : action.mode === "approve"
                      ? "Approve Return"
                      : action.mode === "reject"
                        ? "Reject Return"
                        : "Process Refund"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default ReturnManagement;

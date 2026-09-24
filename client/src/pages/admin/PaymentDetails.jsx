import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// =====================================================
// STEP 5 : PAYMENT DETAILS (Feature 4)
// GET /api/admin/payments?method=&status=
// =====================================================

function PaymentDetails() {
  const navigate = useNavigate();
  const API_URL =
    import.meta.env.VITE_SERVER_API_URL ||
    "http://localhost:4000/api";

  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [method, setMethod] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token") || "";
  const money = (n) =>
    "Rs" + Number(n || 0).toLocaleString("en-IN");

  const loadPayments = async (m = method, s = status) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/admin/payments?method=${encodeURIComponent(m)}&status=${encodeURIComponent(s)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        setPayments(data.payments);
        setSummary(data.summary);
      } else {
        setMessage(data.message || "Failed to load");
      }
    } catch (err) {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const statusBadge = (st) => {
    if (st === "paid")
      return "bg-green-100 text-green-700";
    if (st === "failed")
      return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-10 xl:px-12">
      <div className="w-full">
        <div className="mb-8">
          <button onClick={() => navigate("/admin")} className="mb-2 inline-flex items-center text-sm font-semibold text-cyan-700 transition hover:text-cyan-900">← Back to Dashboard</button>
          <h1 className="text-3xl font-bold text-slate-900">Payment Details</h1>
          <p className="mt-1 text-slate-500">COD / UPI / Razorpay - saari payments ka ledger</p>
        </div>
<br/>
        {message && <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700">{message}</div>}

        {/* SUMMARY */}
        {summary && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Paid Amount</p><p className="mt-2 text-2xl font-bold text-green-700">{money(summary.paid_amount)}</p></div>
            <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Pending Amount</p><p className="mt-2 text-2xl font-bold text-amber-700">{money(summary.pending_amount)}</p></div>
            <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Failed Amount</p><p className="mt-2 text-2xl font-bold text-red-700">{money(summary.failed_amount)}</p></div>
            <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total Records</p><p className="mt-2 text-2xl font-bold text-slate-900">{summary.total_records}</p></div>
          </div>
        )}
<br/>
        {/* FILTERS */}
        <div className="mb-6 flex flex-wrap gap-3">
          <select value={method} onChange={(e) => { setMethod(e.target.value); loadPayments(e.target.value, status); }} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm">
            <option value="">All Methods</option>
            <option value="COD">COD</option>
            <option value="Cash on Delivery">Cash on Delivery</option>
            <option value="UPI">UPI</option>
            <option value="Razorpay">Razorpay</option>
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); loadPayments(method, e.target.value); }} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm">
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          {(method || status) && (
            <button onClick={() => { setMethod(""); setStatus(""); loadPayments("", ""); }} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Clear Filters</button>
          )}
        </div>
<br/>
        {/* PAYMENTS TABLE */}
        {loading ? (
          <p className="text-slate-500">Loading payments...</p>
        ) : payments.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center"><p className="text-slate-500">No payment records found.</p></div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Razorpay Ref</th><th className="px-4 py-3">Date</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.order_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold">{p.order_number}</td>
                    <td className="px-4 py-3">{p.customer_name || "Guest"}<br /><span className="text-xs text-slate-400">{p.customer_email}</span></td>
                    <td className="px-4 py-3">{p.payment_method || "-"}{p.razorpay_method ? <span className="ml-1 text-xs text-slate-400">({p.razorpay_method})</span> : null}</td>
                    <td className="px-4 py-3 font-semibold">{money(p.total_amount)}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(p.payment_status)}`}>{p.payment_status}</span></td>
                    <td className="px-4 py-3"><p className="text-xs text-slate-500">{p.razorpay_order_id || "-"}</p><p className="text-xs text-slate-400">{p.razorpay_payment_id || ""}</p></td>
                    <td className="px-4 py-3">{new Date(p.created_at).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <br/><br/>
    </main>
  );
}

export default PaymentDetails;

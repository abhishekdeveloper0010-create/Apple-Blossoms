import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// =====================================================
// STEP 5 : SALES DASHBOARD (Feature 1)
// GET /api/admin/dashboard
// =====================================================

function SalesDashboard() {
  const navigate = useNavigate();
  const API_URL =
    import.meta.env.VITE_SERVER_API_URL || "http://localhost:4000/api";

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) setDashboard(data);
        else setError(data.message || "Failed to load");
      } catch (err) {
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const money = (n) => "Rs" + Number(n || 0).toLocaleString("en-IN");

  if (loading)
    return (
      <main className="min-h-screen w-full bg-slate-50 px-4 py-8">
        <button
          onClick={() => navigate("/admin")}
          className="mb-2 inline-flex items-center text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
        >
          ← Back to Dashboard
        </button>
        <p className="text-slate-500">Loading dashboard...</p>
      </main>
    );

  if (error)
    return (
      <main className="min-h-screen w-full bg-slate-50 px-4 py-8">
        <button
          onClick={() => navigate("/admin")}
          className="mb-2 inline-flex items-center text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
        >
          ← Back to Dashboard
        </button>
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700">
          {error}
        </div>
      </main>
    );

  const d = dashboard.dashboard;
  const maxRevenue = Math.max(...dashboard.last7_days.map((s) => s.revenue), 1);

  const stats = [
    {
      label: "Total Revenue",
      value: money(d.total_revenue),
      icon: "💰",
      tone: "bg-green-50 text-green-700",
    },
    {
      label: "Today Revenue",
      value: money(d.today_revenue),
      icon: "📅",
      tone: "bg-cyan-50 text-cyan-700",
    },
    {
      label: "Total Orders",
      value: d.total_orders,
      icon: "🛒",
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Active Orders",
      value: d.active_orders,
      icon: "⏳",
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Customers",
      value: d.total_customers,
      icon: "👥",
      tone: "bg-purple-50 text-purple-700",
    },
    {
      label: "New This Month",
      value: d.new_customers_this_month,
      icon: "✨",
      tone: "bg-pink-50 text-pink-700",
    },
    {
      label: "Products",
      value: d.total_products,
      icon: "📦",
      tone: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Low Stock",
      value: d.low_stock,
      icon: "⚠️",
      tone: "bg-red-50 text-red-700",
    },
    {
      label: "Pending Returns",
      value: d.pending_returns,
      icon: "↩️",
      tone: "bg-orange-50 text-orange-700",
    },
    {
      label: "Total Refunds",
      value: money(d.total_refunds),
      icon: "💸",
      tone: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-10 xl:px-12">
      <div className="w-full">
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="mb-2 inline-flex items-center text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
          >
            ← Back to Dashboard
          </button>
          <br/>
          <h1 className="text-3xl font-bold text-slate-900">Sales Dashboard</h1>
          <p className="mt-1 text-slate-500">Live store performance overview</p>
        </div>
<br/>
        {/* STAT CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white p-5 shadow-sm">
              <div
                className={`mb-3 inline-flex rounded-lg px-3 py-1 text-2xl ${s.tone}`}
              >
                {s.icon}
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
        <br />
        {/* LAST 7 DAYS CHART */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            Last 7 Days Revenue
          </h2>
          <div className="flex h-48 items-end gap-2 sm:gap-4">
            {dashboard.last7_days.map((s) => (
              <div
                key={s.day}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <span className="text-xs font-semibold text-slate-600">
                  {s.revenue > 0 ? money(s.revenue) : ""}
                </span>
                <div
                  className="w-full rounded-t-lg bg-cyan-600 transition-all hover:bg-cyan-700"
                  style={{
                    height: `${Math.max((s.revenue / maxRevenue) * 100, 2)}%`,
                  }}
                  title={`${s.orders} orders`}
                ></div>
                <span className="text-xs text-slate-500">{s.day.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
        <br />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* ORDERS BY STATUS */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Orders by Status
            </h2>
            <div className="space-y-3">
              {dashboard.orders_by_status.map((s) => (
                <div
                  key={s.status}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 "
                >
                  <span className="font-medium text-slate-700 ">
                    {s.status}
                  </span>

                  <span className="text-sm text-slate-500">
                    {s.total} orders · {money(s.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* PAYMENT METHODS */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Payment Methods
            </h2>
            <div className="space-y-3">
              {dashboard.payment_methods.map((p) => (
                <div
                  key={p.method}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <span className="font-medium text-slate-700">{p.method}</span>
                  <span className="text-sm text-slate-500">
                    {p.total} orders · {money(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <br />
        {/* RECENT ORDERS */}
        <div className="mt-8 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between p-6 pb-0">
            <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
            <button
              onClick={() => navigate("/admin/orders")}
              className="text-sm font-semibold text-cyan-700 hover:underline"
            >
              View All →
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboard.recent_orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold">
                      {o.order_number}
                    </td>
                    <td className="px-6 py-3">
                      {o.customer_name || "Guest"}
                      <br />
                      <span className="text-xs text-slate-400">
                        {o.customer_email}
                      </span>
                    </td>
                    <td className="px-6 py-3">{money(o.total_amount)}</td>
                    <td className="px-6 py-3">
                      {o.payment_method}{" "}
                      <span
                        className={`ml-1 rounded-full px-2 py-0.5 text-xs ${o.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-3">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <br />
      <br />
    </main>
  );
}

export default SalesDashboard;

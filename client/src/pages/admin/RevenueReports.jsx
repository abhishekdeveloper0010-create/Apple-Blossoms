import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// =====================================================
// STEP 5 : REVENUE REPORTS (Feature 2)
// GET /api/admin/reports/revenue?group=day|month&days=30
// GET /api/admin/reports/top-products
// =====================================================

function RevenueReports() {
  const navigate = useNavigate();
  const API_URL =
    import.meta.env.VITE_SERVER_API_URL ||
    "http://localhost:4000/api";

  const [group, setGroup] = useState("day");
  const [days, setDays] = useState("30");
  const [report, setReport] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token") || "";
  const money = (n) =>
    "Rs" + Number(n || 0).toLocaleString("en-IN");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [revRes, topRes] = await Promise.all([
          fetch(
            `${API_URL}/admin/reports/revenue?group=${group}&days=${days}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(`${API_URL}/admin/reports/top-products?limit=8`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const revData = await revRes.json();
        const topData = await topRes.json();

        if (revData.success) setReport(revData);
        else setError(revData.message || "Failed to load");

        if (topData.success) setTopProducts(topData.products);
      } catch (err) {
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [group, days]);

  const maxRevenue = report
    ? Math.max(...report.series.map((s) => s.revenue), 1)
    : 1;

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-10 xl:px-12">
      <div className="w-full">
        <div className="mb-8">
          <button onClick={() => navigate("/admin")} className="mb-2 inline-flex items-center text-sm font-semibold text-cyan-700 transition hover:text-cyan-900">← Back to Dashboard</button>
          <h1 className="text-3xl font-bold text-slate-900">Revenue Reports</h1>
          <p className="mt-1 text-slate-500">Sales revenue aur refunds ka analysis</p>
        </div><br/>

        {/* FILTERS */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl bg-white shadow-sm">
            {[["day", "Daily"], ["month", "Monthly"]].map(([val, label]) => (
              <button key={val} onClick={() => setGroup(val)} className={`px-5 py-2 text-sm font-semibold rounded-xl ${group === val ? "bg-cyan-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}>{label}</button>
            ))}
          </div>
          <select value={days} onChange={(e) => setDays(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div><br/>

        {error && <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700">{error}</div>}

        {loading ? (
          <p className="text-slate-500">Loading report...</p>
        ) : report && (
          <>
            {/* SUMMARY CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total Revenue</p>
                <p className="mt-2 text-2xl font-bold text-green-700">{money(report.summary.total_revenue)}</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total Orders</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{report.summary.total_orders}</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Avg Order Value</p>
                <p className="mt-2 text-2xl font-bold text-cyan-700">{money(report.summary.avg_order_value)}</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total Refunds</p>
                <p className="mt-2 text-2xl font-bold text-rose-700">{money(report.summary.total_refunds)}</p>
              </div>
            </div>
<br/>
            {/* REVENUE CHART */}
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-slate-900">
                Revenue by {group === "day" ? "Day" : "Month"}
              </h2>
              {report.series.length === 0 ? (
                <p className="text-slate-500">No data for this period.</p>
              ) : (
                <div className="flex h-56 items-end gap-2 overflow-x-auto pb-2">
                  {report.series.map((s) => (
                    <div key={s.period} className="flex min-w-[48px] flex-1 flex-col items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-600">{s.revenue > 0 ? money(s.revenue) : ""}</span>
                      <div className="flex h-36 w-full items-end">
                        <div className="w-full rounded-t-lg bg-cyan-600 transition-all hover:bg-cyan-700" style={{ height: `${Math.max((s.revenue / maxRevenue) * 100, 2)}%` }} title={`${s.orders} orders · refunds ${money(s.refunds)}`}></div>
                      </div>
                      <span className="text-[10px] text-slate-500">{s.period.slice(group === "day" ? 5 : 0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
<br/>
            {/* SERIES TABLE */}
            <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr><th className="px-6 py-3">Period</th><th className="px-6 py-3">Orders</th><th className="px-6 py-3">Revenue</th><th className="px-6 py-3">Refunds</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.series.map((s) => (
                    <tr key={s.period} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-semibold">{s.period}</td>
                      <td className="px-6 py-3">{s.orders}</td>
                      <td className="px-6 py-3 text-green-700 font-semibold">{money(s.revenue)}</td>
                      <td className="px-6 py-3 text-rose-700">{s.refunds > 0 ? money(s.refunds) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
<br/>
            {/* TOP PRODUCTS */}
            <div className="mt-8 rounded-2xl bg-white shadow-sm">
              <h2 className="p-6 pb-4 text-xl font-bold text-slate-900">Top Selling Products</h2>
              {topProducts.length === 0 ? (
                <p className="px-6 pb-6 text-slate-500">No sales data yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr><th className="px-6 py-3">#</th><th className="px-6 py-3">Product</th><th className="px-6 py-3">Units Sold</th><th className="px-6 py-3">Revenue</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topProducts.map((p, i) => (
                        <tr key={p.product_name} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-bold text-slate-400">{i + 1}</td>
                          <td className="px-6 py-3 font-medium">{p.product_name}</td>
                          <td className="px-6 py-3">{p.total_qty}</td>
                          <td className="px-6 py-3 text-green-700 font-semibold">{money(p.total_revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <br/>
    </main>
  );
}

export default RevenueReports;

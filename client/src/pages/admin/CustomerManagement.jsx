import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// =====================================================
// STEP 5 : CUSTOMER MANAGEMENT (Feature 3)
// GET /api/admin/customers?search=
// GET /api/admin/customers/:id
// =====================================================

function CustomerManagement() {
  const navigate = useNavigate();
  const API_URL =
    import.meta.env.VITE_SERVER_API_URL || "http://localhost:4000/api";

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const token = localStorage.getItem("token") || "";
  const money = (n) => "Rs" + Number(n || 0).toLocaleString("en-IN");

  const loadCustomers = async (q = "") => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/admin/customers?search=${encodeURIComponent(q)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      if (data.success) setCustomers(data.customers);
      else setMessage(data.message || "Failed to load");
    } catch (err) {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openDetail = async (id) => {
    setSelected(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setDetail(data);
      else setMessage(data.message || "Failed to load");
    } catch (err) {
      setMessage("Server error");
    } finally {
      setDetailLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-slate-900">
            Customer Management
          </h1>
          <p className="mt-1 text-slate-500">
            Saare customers, unke orders aur total spend
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700">
            {message}
          </div>
        )}
<br/>
        {/* SEARCH */}
        <div className="mb-6 flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadCustomers(search)}
            placeholder="Search by name, email or phone..."
            className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm"
          />
          <button
            onClick={() => loadCustomers(search)}
            className="rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800"
          >
            Search
          </button>
          {search && (
            <button
              onClick={() => {
                setSearch("");
                loadCustomers("");
              }}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </div>
<br/>
        {loading ? (
          <p className="text-slate-500">Loading customers...</p>
        ) : customers.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center">
            <p className="text-slate-500">No customers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Total Spent</th>
                  <th className="px-4 py-3">Last Order</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-50 ${selected === c.id ? "bg-cyan-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.email}</p>
                    </td>
                    <td className="px-4 py-3">{c.phone || "-"}</td>
                    <td className="px-4 py-3">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                    <td className="px-4 py-3">{c.total_orders}</td>
                    <td className="px-4 py-3 font-semibold text-green-700">
                      {money(c.total_spent)}
                    </td>
                    <td className="px-4 py-3">
                      {c.last_order_at
                        ? new Date(c.last_order_at).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(c.id)}
                        className="font-semibold text-cyan-700 hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CUSTOMER DETAIL */}
        {selected && (
          <div className="mt-8 rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-900">
                {detailLoading
                  ? "Loading customer..."
                  : detail
                    ? `${detail.customer.name} - Details`
                    : "Customer"}
              </h2>
              <button
                onClick={() => {
                  setSelected(null);
                  setDetail(null);
                }}
                className="text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                Close ✕
              </button>
            </div>

            {detail && (
              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="mt-1 font-semibold">
                      {detail.customer.email}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="mt-1 font-semibold">
                      {detail.customer.phone || "-"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Total Orders</p>
                    <p className="mt-1 font-semibold">{detail.orders.length}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Joined</p>
                    <p className="mt-1 font-semibold">
                      {new Date(detail.customer.created_at).toLocaleDateString(
                        "en-IN",
                      )}
                    </p>
                  </div>
                </div>

                {detail.addresses.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-3 font-bold text-slate-700">Addresses</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {detail.addresses.map((a) => (
                        <div
                          key={a.id}
                          className="rounded-xl border border-slate-200 p-4 text-sm"
                        >
                          <p className="font-semibold">
                            {a.full_name}{" "}
                            {a.is_default ? (
                              <span className="ml-1 rounded-full bg-cyan-100 px-2 py-0.5 text-xs text-cyan-700">
                                Default
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-1 text-slate-600">
                            {a.address_line}, {a.city}, {a.state} - {a.pincode}
                          </p>
                          <p className="text-slate-500">{a.phone}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="mb-3 mt-6 font-bold text-slate-700">
                  Order History
                </h3>
                {detail.orders.length === 0 ? (
                  <p className="text-slate-500">No orders yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Order</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Payment</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Refund</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {detail.orders.map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold">
                              {o.order_number}
                            </td>
                            <td className="px-4 py-3">
                              {new Date(o.created_at).toLocaleDateString(
                                "en-IN",
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {money(o.total_amount)}
                            </td>
                            <td className="px-4 py-3">
                              {o.payment_method}{" "}
                              <span
                                className={`ml-1 rounded-full px-2 py-0.5 text-xs ${o.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                              >
                                {o.payment_status}
                              </span>
                            </td>
                            <td className="px-4 py-3">{o.status}</td>
                            <td className="px-4 py-3">
                              {o.refund_amount > 0
                                ? `${money(o.refund_amount)} (${o.refund_status || "-"})`
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <br/><br/>
    </main>
  );
}

export default CustomerManagement;

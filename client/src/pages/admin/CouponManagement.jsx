import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CouponManagement() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_SERVER_API_URL || "http://localhost:4000/api";

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    max_discount: "",
    min_order_amount: "",
    usage_limit: "",
    start_at: "",
    end_at: "",
    is_active: true,
  });

  const getToken = () => localStorage.getItem("token") || "";

  const fetchCoupons = async () => {
    try {
      const response = await fetch(`${API_URL}/coupons`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.error("Fetch coupons error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const url = editingCoupon ? `${API_URL}/coupons/${editingCoupon.id}` : `${API_URL}/coupons`;
      const method = editingCoupon ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        setMessage(editingCoupon ? "Coupon updated!" : "Coupon created!");
        setShowForm(false);
        setEditingCoupon(null);
        resetForm();
        fetchCoupons();
      } else {
        setMessage(data.message || "Failed to save coupon");
      }
    } catch (error) {
      setMessage("Error saving coupon");
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      max_discount: coupon.max_discount || "",
      min_order_amount: coupon.min_order_amount || "",
      usage_limit: coupon.usage_limit || "",
      start_at: coupon.start_at ? coupon.start_at.slice(0, 16) : "",
      end_at: coupon.end_at ? coupon.end_at.slice(0, 16) : "",
      is_active: coupon.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      const response = await fetch(`${API_URL}/coupons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Coupon deleted!");
        fetchCoupons();
      }
    } catch (error) {
      setMessage("Error deleting coupon");
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await fetch(`${API_URL}/coupons/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (data.success) fetchCoupons();
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  const resetForm = () => {
    setForm({ code: "", discount_type: "percentage", discount_value: "", max_discount: "", min_order_amount: "", usage_limit: "", start_at: "", end_at: "", is_active: true });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button onClick={() => navigate("/admin")} className="mb-2 text-sm text-cyan-700 hover:underline">Back to Dashboard</button>
            <h1 className="text-3xl font-bold text-slate-900">Coupon Management</h1>
            <p className="mt-1 text-slate-500">Create and manage discount coupons</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditingCoupon(null); resetForm(); }} className="rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white hover:bg-cyan-800">+ Add Coupon</button>
        </div>
        {message && <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700">{message}</div>}
        {showForm && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</h2>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Coupon Code</label><input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="e.g., SAVE20" required /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Discount Type</label><select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2"><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount</option></select></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Discount Value</label><input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="e.g., 20" required /></div>
              {form.discount_type === "percentage" && <div><label className="mb-1 block text-sm font-medium text-slate-700">Max Discount (Rs)</label><input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="e.g., 500" /></div>}
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Min Order (Rs)</label><input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="e.g., 500" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Usage Limit</label><input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="e.g., 100" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Start Date</label><input type="datetime-local" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">End Date</label><input type="datetime-local" value={form.end_at} onChange={(e) => setForm({ ...form, end_at: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" /></div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4" /><label className="text-sm font-medium text-slate-700">Active</label></div>
              <div className="flex gap-3 sm:col-span-2"><button type="submit" className="rounded-lg bg-cyan-700 px-6 py-2 font-semibold text-white hover:bg-cyan-800">{editingCoupon ? "Update" : "Create"}</button><button type="button" onClick={() => { setShowForm(false); setEditingCoupon(null); }} className="rounded-lg border border-slate-300 px-6 py-2 font-semibold text-slate-700 hover:bg-slate-50">Cancel</button></div>
            </form>
          </div>
        )}
        {loading ? (
          <p className="text-center text-slate-500">Loading...</p>
        ) : coupons.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center"><p className="text-slate-500">No coupons yet.</p></div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Min Order</th><th className="px-4 py-3">Usage</th><th className="px-4 py-3">Validity</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{coupons.map((coupon) => (<tr key={coupon.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-semibold">{coupon.code}</td><td className="px-4 py-3">{coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `Rs${coupon.discount_value}`}{coupon.max_discount && <span className="text-slate-500"> (max Rs{coupon.max_discount})</span>}</td><td className="px-4 py-3">Rs{coupon.min_order_amount || 0}</td><td className="px-4 py-3">{coupon.used_count || 0} / {coupon.usage_limit || "inf"}</td><td className="px-4 py-3 text-xs">{formatDate(coupon.start_at)} - {formatDate(coupon.end_at)}</td><td className="px-4 py-3"><button onClick={() => handleToggle(coupon.id)} className={`rounded-full px-3 py-1 text-xs font-semibold ${coupon.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{coupon.is_active ? "Active" : "Inactive"}</button></td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => handleEdit(coupon)} className="text-cyan-700 hover:underline">Edit</button><button onClick={() => handleDelete(coupon.id)} className="text-red-600 hover:underline">Delete</button></div></td></tr>))}</tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default CouponManagement;


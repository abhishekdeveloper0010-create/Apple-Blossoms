import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CampaignManagement() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_SERVER_API_URL || "http://localhost:4000/api";

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "", description: "", discount_type: "percentage", discount_value: "",
    max_discount: "", min_order_amount: "", buy_quantity: "", get_quantity: "",
    start_date: "", end_date: "", is_active: true, priority: "0",
  });

  const getToken = () => localStorage.getItem("token") || "";

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${API_URL}/campaigns`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await response.json();
      if (data.success) setCampaigns(data.campaigns);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Campaign created!");
        setShowForm(false);
        setForm({ name: "", description: "", discount_type: "percentage", discount_value: "", max_discount: "", min_order_amount: "", buy_quantity: "", get_quantity: "", start_date: "", end_date: "", is_active: true, priority: "0" });
        fetchCampaigns();
      } else {
        setMessage(data.message || "Failed");
      }
    } catch (error) {
      setMessage("Error creating campaign");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      const response = await fetch(`${API_URL}/campaigns/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await response.json();
      if (data.success) { setMessage("Deleted!"); fetchCampaigns(); }
    } catch (error) { setMessage("Error"); }
  };

  const handleToggle = async (id) => {
    try {
      const response = await fetch(`${API_URL}/campaigns/${id}/toggle`, { method: "PATCH", headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await response.json();
      if (data.success) fetchCampaigns();
    } catch (error) { console.error("Toggle error:", error); }
  };

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
      <div className="w-full">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button onClick={() => navigate("/admin")} className="mb-2 inline-flex items-center text-sm font-semibold text-cyan-700 transition hover:text-cyan-900">← Back to Dashboard</button>
            <h1 className="text-3xl font-bold text-slate-900">Campaign Management</h1>
            <p className="mt-1 text-slate-500">Create and manage sales campaigns</p>
          </div>
          <button onClick={() => setShowForm(true)} className="rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white hover:bg-cyan-800">+ Create Campaign</button>
        </div>
        {message && <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700">{message}</div>}
        {showForm && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Create Campaign</h2>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              <div className="col-span-full"><label className="mb-1 block text-sm font-medium text-slate-700">Campaign Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="e.g., Diwali Sale" required /></div>
              <div className="col-span-full"><label className="mb-1 block text-sm font-medium text-slate-700">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" rows="2" placeholder="Campaign details..." /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Discount Type</label><select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2"><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount</option><option value="buy_get_free">Buy X Get Y Free</option></select></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Discount Value</label><input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="e.g., 20" /></div>
              {form.discount_type === "percentage" && <div><label className="mb-1 block text-sm font-medium text-slate-700">Max Discount (Rs)</label><input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="e.g., 1000" /></div>}
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Min Order (Rs)</label><input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="e.g., 500" /></div>
              {form.discount_type === "buy_get_free" && (<><div><label className="mb-1 block text-sm font-medium text-slate-700">Buy Quantity</label><input type="number" value={form.buy_quantity} onChange={(e) => setForm({ ...form, buy_quantity: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="e.g., 2" /></div><div><label className="mb-1 block text-sm font-medium text-slate-700">Get Quantity</label><input type="number" value={form.get_quantity} onChange={(e) => setForm({ ...form, get_quantity: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="e.g., 1" /></div></>)}
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Start Date</label><input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" required /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">End Date</label><input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" required /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Priority</label><input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="0" /></div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4" /><label className="text-sm font-medium text-slate-700">Active</label></div>
              <div className="flex gap-3 col-span-full"><button type="submit" className="rounded-lg bg-cyan-700 px-6 py-2 font-semibold text-white hover:bg-cyan-800">Create</button><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 px-6 py-2 font-semibold text-slate-700 hover:bg-slate-50">Cancel</button></div>
            </form>
          </div>
        )}
        {loading ? (
          <p className="text-center text-slate-500">Loading...</p>
        ) : campaigns.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center"><p className="text-slate-500">No campaigns yet.</p></div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Min Order</th><th className="px-4 py-3">Period</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{campaigns.map((c) => (<tr key={c.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-semibold">{c.name}</td><td className="px-4 py-3">{c.discount_type === "percentage" ? `${c.discount_value}%` : c.discount_type === "fixed" ? `Rs${c.discount_value}` : `Buy ${c.buy_quantity} Get ${c.get_quantity}`}</td><td className="px-4 py-3">Rs{c.min_order_amount || 0}</td><td className="px-4 py-3 text-xs">{new Date(c.start_date).toLocaleDateString()} - {new Date(c.end_date).toLocaleDateString()}</td><td className="px-4 py-3"><button onClick={() => handleToggle(c.id)} className={`rounded-full px-3 py-1 text-xs font-semibold ${c.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{c.is_active ? "Active" : "Inactive"}</button></td><td className="px-4 py-3"><button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">Delete</button></td></tr>))}</tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default CampaignManagement;


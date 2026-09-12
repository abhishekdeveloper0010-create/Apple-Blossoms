import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function GiftCardManagement() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_SERVER_API_URL || "http://localhost:4000/api";

  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ amount: "", receiver_email: "", receiver_name: "", message: "", expiry_date: "" });

  const getToken = () => localStorage.getItem("token") || "";

  const fetchGiftCards = async () => {
    try {
      const response = await fetch(`${API_URL}/gift-cards`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await response.json();
      if (data.success) setGiftCards(data.giftCards);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGiftCards(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/gift-cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Gift card created!");
        setShowForm(false);
        setForm({ amount: "", receiver_email: "", receiver_name: "", message: "", expiry_date: "" });
        fetchGiftCards();
      } else {
        setMessage(data.message || "Failed");
      }
    } catch (error) {
      setMessage("Error creating gift card");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this gift card?")) return;
    try {
      const response = await fetch(`${API_URL}/gift-cards/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await response.json();
      if (data.success) { setMessage("Deleted!"); fetchGiftCards(); }
    } catch (error) { setMessage("Error"); }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button onClick={() => navigate("/admin")} className="mb-2 text-sm text-cyan-700 hover:underline">Back to Dashboard</button>
            <h1 className="text-3xl font-bold text-slate-900">Gift Card Management</h1>
            <p className="mt-1 text-slate-500">Create and manage gift cards</p>
          </div>
          <button onClick={() => setShowForm(true)} className="rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white hover:bg-cyan-800">+ Create Gift Card</button>
        </div>
        {message && <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700">{message}</div>}
        {showForm && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Create Gift Card</h2>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Amount (Rs)</label><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="e.g., 500" required /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Receiver Email</label><input type="email" value={form.receiver_email} onChange={(e) => setForm({ ...form, receiver_email: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="e.g., user@email.com" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Receiver Name</label><input type="text" value={form.receiver_name} onChange={(e) => setForm({ ...form, receiver_name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="e.g., John" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Expiry Date</label><input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" /></div>
              <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-700">Message</label><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" rows="3" placeholder="Happy Birthday!" /></div>
              <div className="flex gap-3 sm:col-span-2"><button type="submit" className="rounded-lg bg-cyan-700 px-6 py-2 font-semibold text-white hover:bg-cyan-800">Create</button><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 px-6 py-2 font-semibold text-slate-700 hover:bg-slate-50">Cancel</button></div>
            </form>
          </div>
        )}
        {loading ? <p className="text-center text-slate-500">Loading...</p> : giftCards.length === 0 ? <div className="rounded-2xl bg-white p-8 text-center"><p className="text-slate-500">No gift cards yet.</p></div> : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Balance</th><th className="px-4 py-3">Receiver</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{giftCards.map((gc) => (<tr key={gc.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-semibold">{gc.code}</td><td className="px-4 py-3">Rs{gc.amount}</td><td className="px-4 py-3">Rs{gc.balance}</td><td className="px-4 py-3">{gc.receiver_name || gc.receiver_email || "N/A"}</td><td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${gc.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{gc.is_active ? "Active" : "Inactive"}</span></td><td className="px-4 py-3"><button onClick={() => handleDelete(gc.id)} className="text-red-600 hover:underline">Delete</button></td></tr>))}</tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default GiftCardManagement;


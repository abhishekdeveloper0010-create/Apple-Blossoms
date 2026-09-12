import { useEffect, useState } from "react";

function Wallet() {
  const API_URL = import.meta.env.VITE_SERVER_API_URL || "http://localhost:4000/api";

  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const getToken = () => localStorage.getItem("token") || "";

  const fetchWallet = async () => {
    try {
      const response = await fetch(`${API_URL}/wallet`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await response.json();
      if (data.success) setWallet(data.wallet);
    } catch (error) {
      console.error("Fetch wallet error:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/wallet/transactions`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await response.json();
      if (data.success) setTransactions(data.transactions);
    } catch (error) {
      console.error("Fetch transactions error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWallet(); fetchTransactions(); }, []);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/wallet/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ amount: Number(amount), description: "Money added to wallet" }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Money added successfully!");
        setAmount("");
        fetchWallet();
        fetchTransactions();
      } else {
        setMessage(data.message || "Failed to add money");
      }
    } catch (error) {
      setMessage("Error adding money");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">My Wallet</h1>

        {message && <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700">{message}</div>}

        {/* Wallet Balance */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-800 p-8 text-white">
          <p className="text-sm opacity-80">Available Balance</p>
          <p className="mt-2 text-4xl font-bold">Rs{wallet ? Number(wallet.balance).toFixed(2) : "0.00"}</p>
          <div className="mt-4 flex gap-6 text-sm opacity-80">
            <span>Total Credited: Rs{wallet ? Number(wallet.total_credited).toFixed(2) : "0.00"}</span>
            <span>Total Debited: Rs{wallet ? Number(wallet.total_debited).toFixed(2) : "0.00"}</span>
          </div>
        </div>

        {/* Add Money */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Add Money</h2>
          <form onSubmit={handleAddMoney} className="flex gap-4">
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2" placeholder="Enter amount" min="1" required />
            <button type="submit" className="rounded-lg bg-cyan-700 px-6 py-2 font-semibold text-white hover:bg-cyan-800">Add Money</button>
          </form>
        </div>

        {/* Transactions */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Transaction History</h2>
          {loading ? (
            <p className="text-center text-slate-500">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center text-slate-500">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Balance</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{transactions.map((t) => (<tr key={t.id} className="hover:bg-slate-50"><td className="px-4 py-3 text-xs">{new Date(t.created_at).toLocaleDateString()}</td><td className="px-4 py-3">{t.description}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${t.type === "credit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{t.type}</span></td><td className="px-4 py-3 font-semibold">{t.type === "credit" ? "+" : "-"}Rs{Number(t.amount).toFixed(2)}</td><td className="px-4 py-3">Rs{t.balance_after ? Number(t.balance_after).toFixed(2) : "0.00"}</td></tr>))}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Wallet;


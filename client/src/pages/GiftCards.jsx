import { useEffect, useState } from "react";

function GiftCards() {
  const API_URL = import.meta.env.VITE_SERVER_API_URL || "http://localhost:4000/api";

  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const getToken = () => localStorage.getItem("token") || "";

  const fetchGiftCards = async () => {
    try {
      const response = await fetch(`${API_URL}/gift-cards/my`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await response.json();
      if (data.success) setGiftCards(data.giftCards);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGiftCards(); }, []);

  const handleClaim = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/gift-cards/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage(`Gift card claimed! Rs${data.amount} added to your wallet.`);
        setCode("");
        fetchGiftCards();
      } else {
        setMessage(data.message || "Failed to claim gift card");
      }
    } catch (error) {
      setMessage("Error claiming gift card");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">Gift Cards</h1>

        {message && <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700">{message}</div>}

        {/* Claim Gift Card */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Claim Gift Card</h2>
          <form onSubmit={handleClaim} className="flex gap-4">
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2" placeholder="Enter gift card code" required />
            <button type="submit" className="rounded-lg bg-cyan-700 px-6 py-2 font-semibold text-white hover:bg-cyan-800">Claim</button>
          </form>
        </div>

        {/* My Gift Cards */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">My Gift Cards</h2>
          {loading ? (
            <p className="text-center text-slate-500">Loading...</p>
          ) : giftCards.length === 0 ? (
            <p className="text-center text-slate-500">No gift cards claimed yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {giftCards.map((gc) => (
                <div key={gc.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{gc.code}</span>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${gc.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{gc.is_active ? "Active" : "Used"}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Amount: Rs{gc.amount}</p>
                  <p className="text-xs text-slate-400">Claimed: {new Date(gc.claimed_at).toLocaleDateString()}</p>
                  {gc.message && <p className="mt-2 text-sm italic text-slate-600">"{gc.message}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default GiftCards;

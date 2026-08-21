import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 👁️ Show / Hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("Please enter both passwords.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_API_URL}/auth/reset-password/${token}`,
        {
          password,
        },
      );

      setSuccess(response.data.message || "Password reset successfully.");

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Password reset failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#081b24] flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] border border-cyan-400 bg-[#0d1f29] p-8 shadow-[0_0_25px_rgba(34,211,238,0.35)]">
        {/* Heading */}
        <h1 className="text-center text-4xl font-bold text-white pb-5">
          Reset Password
        </h1>

        <p className="mt-3 text-center text-slate-300">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="pt-8">
          {/* Success */}
          {success && (
            <div className="mb-5 border border-green-400 bg-green-500/10 px-4 py-3 text-green-400">
              {success}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 border border-red-500 bg-red-500/10 px-4 py-3 text-red-400">
              {error}
            </div>
          )}
          <br />
          {/* New Password */}
          <div className="mb-6">
            <label className="mb-2 block text-lg text-slate-300">
              New Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Enter new password"
                className="w-full border-b-2 border-slate-400 bg-transparent px-2 py-3 pr-10 text-lg text-white outline-none transition focus:border-cyan-400 placeholder:text-slate-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <br />
          {/* Confirm Password */}
          <div className="mb-8">
            <label className="mb-2 block text-lg text-slate-300">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError("");
                }}
                placeholder="Confirm new password"
                className="w-full border-b-2 border-slate-400 bg-transparent px-2 py-3 pr-10 text-lg text-white outline-none transition focus:border-cyan-400 placeholder:text-slate-500"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <br />
          <br />
          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full border-2 border-cyan-300 bg-gradient-to-b from-[#38d4e5] to-[#08717e] py-3 text-xl font-bold text-white shadow-[0_4px_12px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ResetPassword;

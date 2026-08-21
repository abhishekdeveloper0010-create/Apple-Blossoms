import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // EMAIL CHANGE
  // =====================================================

  const handleChange = (event) => {
    setEmail(event.target.value);

    setError("");
  };

  // =====================================================
  // FORM SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError(
        "Please enter your email address."
      );

      setSuccess("");

      return;
    }

    try {
      setLoading(true);

      const API_URL =
        import.meta.env.VITE_SERVER_API_URL ||
        "http://localhost:4000/api";

      const response = await axios.post(
        `${API_URL}/auth/forgot-password`,
        {
          email: email.trim().toLowerCase(),
        }
      );

      setError("");

      setSuccess(
        response.data.message ||
          `Password reset instructions have been sent to ${email}.`
      );

    } catch (error) {
      setSuccess("");

      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <section className="min-h-screen bg-[#081b24] flex items-center justify-center p-4 sm:p-6 lg:p-8">

      <div
        className="
          relative w-full max-w-[1200px] min-h-[650px]
          overflow-hidden
          border border-cyan-400
          shadow-[0_0_25px_rgba(34,211,238,0.35)]
        "
      >

        {/* DARK BACKGROUND */}

        <div className="absolute inset-0 bg-[#0d1f29]" />

        {/* LEFT GRADIENT */}

        <div
          className="
            absolute inset-y-0 left-0 w-[62%]
            bg-gradient-to-r
            from-[#147584]
            via-[#1c8794]
            to-[#20b8c6]
            [clip-path:polygon(0_0,65%_0,30%_100%,0_100%)]
          "
        />

        <div className="relative z-10 flex min-h-[650px]">

          {/* LEFT */}

          <div
            className="
              hidden lg:flex w-[48%]
              items-center px-12 py-14
            "
          >

            <div className="max-w-[360px]">

              <h2 className="text-5xl font-bold tracking-wide text-white">
                DON'T WORRY!
              </h2>

              <p className="mt-5 text-xl leading-relaxed text-slate-100">
                Enter your email address
                <br />
                and we'll help you reset
                <br />
                your password.
              </p>

            </div>

          </div>

          {/* RIGHT */}

          <div
            className="
              w-full lg:w-[52%]
              flex items-center justify-center
              px-6 py-10
              sm:px-12 sm:py-12
              lg:px-20 lg:py-14
            "
          >

            <div className="w-full max-w-[420px]">

              {/* BACK */}

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="
                  mb-6 flex items-center gap-2
                  text-sm font-semibold text-cyan-400
                  transition duration-300
                  hover:text-white
                "
              >
                <FaArrowLeft />
                Back
              </button>

              {/* HEADING */}

              <h1 className="pb-3 text-center text-4xl font-bold text-white sm:text-5xl">
                Forgot Password?
              </h1>

              <p className="pb-8 text-center text-slate-300">
                Enter your email and we'll send you
                instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit}>

                {/* SUCCESS */}

                {success && (
                  <div className="mb-5 border border-green-400 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                    {success}
                  </div>
                )}

                {/* EMAIL */}

                <div className="pb-8">

                  <label className="mb-2 block text-lg text-slate-300">
                    Email Address
                  </label>

                  <div
                    className={`
                      flex items-center gap-3
                      border-b-2
                      transition duration-300
                      ${
                        error
                          ? "border-red-500"
                          : "border-slate-400 focus-within:border-cyan-400"
                      }
                    `}
                  >

                    <FaEnvelope
                      className={`
                        shrink-0 text-lg
                        ${
                          error
                            ? "text-red-400"
                            : "text-cyan-400"
                        }
                      `}
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="
                        w-full bg-transparent
                        py-3 text-lg text-white
                        outline-none
                        placeholder:text-slate-500
                      "
                    />

                  </div>

                  {error && (
                    <div className="pt-2 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                </div>

                {/* SEND */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full rounded-full
                    border-2 border-cyan-300
                    bg-gradient-to-b
                    from-[#38d4e5]
                    to-[#08717e]
                    py-3 text-xl font-bold text-white
                    shadow-[0_4px_12px_rgba(34,211,238,0.35)]
                    transition duration-300
                    hover:scale-[1.02]
                    hover:shadow-[0_5px_20px_rgba(34,211,238,0.55)]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loading
                    ? "Sending..."
                    : "Send Reset Link"}
                </button>

                {/* LOGIN */}

                <p className="pt-6 text-center text-base text-slate-300">

                  Remember your password?{" "}

                  <Link
                    to="/login"
                    className="
                      font-semibold text-cyan-400
                      transition duration-300
                      hover:text-cyan-300
                    "
                  >
                    Login
                  </Link>

                </p>

              </form>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default ForgotPassword;
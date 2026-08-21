import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

function Login() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {
      email: "",
      password: "",
    };

    if (!credentials.email.trim()) {
      newErrors.email = "Please enter your email.";
    }

    if (!credentials.password.trim()) {
      newErrors.password = "Please enter your password.";
    }

    setErrors(newErrors);

    if (newErrors.email || newErrors.password) {
      return;
    }

    try {
      setLoading(true);

      // Remove old token
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      const API_URL =
        import.meta.env.VITE_SERVER_API_URL ||
        "http://localhost:4000/api";

      console.log(
        "LOGIN API:",
        `${API_URL}/auth/login`
      );

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: credentials.email.trim(),
            password: credentials.password,
          }),
        }
      );

      console.log(
        "LOGIN STATUS:",
        response.status
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "SERVER RESPONSE:",
          text
        );

        throw new Error(
          "Server returned an invalid response."
        );
      }

      console.log(
        "LOGIN RESPONSE:",
        data
      );

      // =================================================
      // LOGIN FAILED
      // =================================================

      if (!response.ok) {
        alert(
          data.message ||
            "Invalid email or password."
        );

        return;
      }

      // =================================================
      // TOKEN CHECK
      // =================================================

      if (!data.token) {
        console.error(
          "TOKEN NOT RECEIVED:",
          data
        );

        alert(
          "Login successful but token was not received."
        );

        return;
      }

      // =================================================
      // SAVE TOKEN
      // =================================================

      localStorage.setItem(
        "token",
        data.token
      );

      // =================================================
      // SAVE USER
      // =================================================

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      // =================================================
      // AUTH EVENT
      // =================================================

      window.dispatchEvent(
        new Event("authChanged")
      );

      alert("Login successful!");

      // =================================================
      // HOME
      // =================================================

      navigate("/", {
        replace: true,
      });

    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      alert(
        error.message ||
          "Server se connection nahi ho raha."
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

        {/* LEFT BACKGROUND */}

        <div className="absolute inset-0 bg-[#0d1f29]" />

        {/* RIGHT BACKGROUND */}

        <div
          className="
            absolute inset-y-0 right-0 w-[82%]
            bg-gradient-to-r
            from-[#163944]
            via-[#147584]
            to-[#20b8c6]
            [clip-path:polygon(30%_0,100%_0,100%_100%,80%_100%)]
          "
        />

        {/* MAIN CONTENT */}

        <div className="relative z-10 flex min-h-[650px]">

          {/* LEFT LOGIN */}

          <div
            className="
              w-full lg:w-[52%]
              flex items-center justify-center
              px-6 pt-10 pb-10
              sm:px-12 sm:pt-12 sm:pb-12
              lg:px-20 lg:pt-14 lg:pb-14
            "
          >

            <div className="w-full max-w-[400px]">

              <h1 className="pb-10 pt-2 text-4xl font-bold text-white sm:text-5xl">
                Login
              </h1>

              <form onSubmit={handleSubmit}>

                {/* EMAIL */}

                <div className="pb-10">

                  <label className="mb-2 block text-lg text-slate-300">
                    Username
                  </label>

                  <div
                    className={`
                      flex items-center gap-3 border-b-2
                      transition duration-300
                      ${
                        errors.email
                          ? "border-red-500"
                          : "border-slate-400 focus-within:border-cyan-400"
                      }
                    `}
                  >

                    <FaUser
                      className={`
                        shrink-0 text-lg
                        ${
                          errors.email
                            ? "text-red-400"
                            : "text-slate-300"
                        }
                      `}
                    />

                    <input
                      type="email"
                      name="email"
                      value={credentials.email}
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

                  {errors.email && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.email}
                    </p>
                  )}

                </div>

                {/* PASSWORD */}

                <div className="pb-8">

                  <label className="block text-lg text-cyan-300">
                    Password
                  </label>

                  <div
                    className={`
                      flex items-center gap-3 border-b-2
                      transition duration-300
                      ${
                        errors.password
                          ? "border-red-500"
                          : "border-cyan-400 focus-within:border-cyan-300"
                      }
                    `}
                  >

                    <FaLock
                      className={`
                        shrink-0 text-lg
                        ${
                          errors.password
                            ? "text-red-400"
                            : "text-cyan-400"
                        }
                      `}
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="
                        w-full bg-transparent
                        py-3 text-lg text-white
                        outline-none
                        placeholder:text-slate-500
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      className="
                        shrink-0 text-lg text-cyan-400
                        hover:text-white
                        transition duration-300
                        cursor-pointer
                      "
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                  {errors.password && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.password}
                    </p>
                  )}

                </div>

                {/* FORGOT PASSWORD */}

                <div className="pb-10 text-right">

                  <Link
                    to="/forgot-password"
                    className="
                      text-sm text-slate-300
                      hover:text-cyan-400
                      transition duration-300
                    "
                  >
                    Forgot Password?
                  </Link>

                </div>

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    mt-3 w-full rounded-full
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
                    ? "Logging in..."
                    : "Login"}
                </button>

                {/* SIGN UP */}

                <p className="pt-5 text-center text-base text-slate-300">

                  Don't have an account?{" "}

                  <Link
                    to="/register"
                    className="
                      font-semibold text-cyan-400
                      transition duration-300
                      hover:text-cyan-300
                    "
                  >
                    Sign Up
                  </Link>

                </p>

              </form>

            </div>

          </div>

          {/* RIGHT WELCOME */}

          <div
            className="
              hidden lg:flex
              w-[48%]
              items-center justify-center
              px-12 pt-14 pb-14
            "
          >

            <div className="max-w-[340px] text-right">

              <h2 className="text-5xl font-bold leading-tight tracking-wide text-white">
                WELCOME
                <br />
                BACK!
              </h2>

              <p className="mt-5 text-xl leading-relaxed text-slate-100">
                Hope, You and your
                <br />
                Family have a Great
                <br />
                Day
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Login;
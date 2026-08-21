import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // =====================================================
  // FORM SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    // NAME

    if (!formData.name.trim()) {
      newErrors.name =
        "Please enter your username.";
    }

    // EMAIL

    if (!formData.email.trim()) {
      newErrors.email =
        "Please enter your email.";
    }

    // PASSWORD

    if (!formData.password.trim()) {
      newErrors.password =
        "Please enter your password.";
    } else if (
      formData.password.length < 6
    ) {
      newErrors.password =
        "Password must be at least 6 characters.";
    }

    // CONFIRM PASSWORD

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (
      formData.password !==
      formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(newErrors);

    if (
      newErrors.name ||
      newErrors.email ||
      newErrors.password ||
      newErrors.confirmPassword
    ) {
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // REMOVE OLD AUTH
      // =================================================

      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      const API_URL =
        import.meta.env.VITE_SERVER_API_URL ||
        "http://localhost:4000/api";

      console.log(
        "REGISTER API:",
        `${API_URL}/auth/register`
      );

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email
              .trim()
              .toLowerCase(),
            password: formData.password,
          }),
        }
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
        "REGISTER RESPONSE:",
        data
      );

      // =================================================
      // ALREADY REGISTERED / OTHER ERROR
      // =================================================

      if (!response.ok) {

        if (response.status === 409) {
          alert(
            "This email is already registered. Please login."
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        alert(
          data.message ||
            "Registration failed."
        );

        return;
      }

      // =================================================
      // TOKEN CHECK
      // =================================================

      if (!data.token) {
        console.error(
          "REGISTER TOKEN NOT RECEIVED:",
          data
        );

        alert(
          "Registration successful but login token was not received."
        );

        navigate("/login");

        return;
      }

      // =================================================
      // AUTOMATIC LOGIN
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

      // =================================================
      // SUCCESS
      // =================================================

      alert(
        "Registration successful! Welcome to Apple Blossom."
      );

      // =================================================
      // IMPORTANT:
      // Login page nahi jayega
      // Direct Home
      // =================================================

      navigate("/", {
        replace: true,
      });

    } catch (error) {
      console.error(
        "REGISTER ERROR:",
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

        {/* MAIN CONTENT */}

        <div className="relative z-10 flex min-h-[650px]">

          {/* LEFT WELCOME */}

          <div
            className="
              hidden lg:flex w-[48%]
              items-center
              px-12 py-14
            "
          >

            <div className="max-w-[330px]">

              <h2 className="text-5xl font-bold tracking-wide text-white">
                WELCOME!
              </h2>

              <p className="mt-5 text-xl leading-relaxed text-slate-100">
                Hope, You and your
                <br />
                Family have a Great Day
              </p>

            </div>

          </div>

          {/* RIGHT REGISTER */}

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

              <h1 className="pb-8 text-center text-4xl font-bold text-white sm:text-5xl">
                Sign Up
              </h1>

              <form onSubmit={handleSubmit}>

                {/* USERNAME */}

                <div className="pb-5">

                  <label className="mb-2 block text-lg text-slate-300">
                    Username
                  </label>

                  <div
                    className={`
                      flex items-center gap-3 border-b-2
                      transition duration-300
                      ${
                        errors.name
                          ? "border-red-500"
                          : "border-slate-400 focus-within:border-cyan-400"
                      }
                    `}
                  >

                    <FaUser
                      className={`
                        shrink-0 text-lg
                        ${
                          errors.name
                            ? "text-red-400"
                            : "text-slate-300"
                        }
                      `}
                    />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      className="
                        w-full bg-transparent
                        py-2 text-lg text-white
                        outline-none
                        placeholder:text-slate-500
                      "
                    />

                  </div>

                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.name}
                    </p>
                  )}

                </div>

                {/* EMAIL */}

                <div className="pb-5">

                  <label className="mb-2 block text-lg text-slate-300">
                    Email
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

                    <FaEnvelope
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
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="
                        w-full bg-transparent
                        py-2 text-lg text-white
                        outline-none
                        placeholder:text-slate-500
                      "
                    />

                  </div>

                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.email}
                    </p>
                  )}

                </div>

                {/* PASSWORD */}

                <div className="pb-5">

                  <label className="mb-2 block text-lg text-slate-300">
                    Password
                  </label>

                  <div
                    className={`
                      flex items-center gap-3 border-b-2
                      transition duration-300
                      ${
                        errors.password
                          ? "border-red-500"
                          : "border-slate-400 focus-within:border-cyan-400"
                      }
                    `}
                  >

                    <FaLock
                      className={`
                        shrink-0 text-lg
                        ${
                          errors.password
                            ? "text-red-400"
                            : "text-slate-300"
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
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="
                        w-full bg-transparent
                        py-2 text-lg text-white
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
                      "
                    >
                      {showPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.password}
                    </p>
                  )}

                </div>

                {/* CONFIRM PASSWORD */}

                <div className="pb-8">

                  <label className="mb-2 block text-lg text-slate-300">
                    Confirm Password
                  </label>

                  <div
                    className={`
                      flex items-center gap-3 border-b-2
                      transition duration-300
                      ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-slate-400 focus-within:border-cyan-400"
                      }
                    `}
                  >

                    <FaLock
                      className={`
                        shrink-0 text-lg
                        ${
                          errors.confirmPassword
                            ? "text-red-400"
                            : "text-slate-300"
                        }
                      `}
                    />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={
                        formData.confirmPassword
                      }
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="
                        w-full bg-transparent
                        py-2 text-lg text-white
                        outline-none
                        placeholder:text-slate-500
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev
                        )
                      }
                      className="
                        shrink-0 text-lg text-cyan-400
                        hover:text-white
                        transition duration-300
                      "
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.confirmPassword}
                    </p>
                  )}

                </div>

                {/* REGISTER BUTTON */}

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
                    ? "Creating Account..."
                    : "Register"}
                </button>

                {/* LOGIN LINK */}

                <p className="pt-5 text-center text-base text-slate-300">

                  Already have an account?{" "}

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

export default Register;
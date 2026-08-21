import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaFacebookF,
  FaTelegramPlane,
  FaTwitter,
  FaCcVisa,
  FaGooglePay,
  FaIdCard,
} from "react-icons/fa";

function Footer() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ==============================
  // NEWSLETTER SUBMIT
  // ==============================

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Empty email
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    // Email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API_URL}/newsletter/subscribe`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      // Backend error
      if (!response.ok) {
        setError(
          data.message ||
            "Unable to subscribe. Please try again."
        );
        return;
      }

      // Success
      setSuccess(
        data.message ||
          "Successfully subscribed to our newsletter."
      );

      // Clear input
      setEmail("");
    } catch (error) {
      console.error(
        "NEWSLETTER ERROR:",
        error
      );

      setError(
        "Server se connection nahi ho raha."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="w-full bg-[#0c4a6e] text-white">
      <div className="w-full px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-10 xl:px-12 2xl:px-16">

        {/* ============================== */}
        {/* TOP */}
        {/* ============================== */}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 xl:grid-cols-4 xl:gap-12">

          {/* ============================== */}
          {/* EXPLORE */}
          {/* ============================== */}

          <div>
            <h2 className="pb-4 text-2xl font-semibold sm:text-3xl">
              Explore
            </h2>

            <ul className="space-y-3 text-lg text-gray-200 sm:space-y-4 sm:text-2xl">
              <li>
                <Link
                  to="/shop"
                  className="transition hover:text-sky-300"
                >
                  Shop
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="transition hover:text-sky-300"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="transition hover:text-sky-300"
                >
                  Contact
                </Link>
              </li>

              <li>
                <Link
                  to="/wishlist"
                  className="transition hover:text-sky-300"
                >
                  Wishlist
                </Link>
              </li>

              <li>
                <Link
                  to="/order-tracking"
                  className="transition hover:text-sky-300"
                >
                  Track Order
                </Link>
              </li>

              <li>
                <Link
                  to="/login"
                  className="transition hover:text-sky-300"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* ============================== */}
          {/* SERVICES */}
          {/* ============================== */}

          <div>
            <h2 className="pb-4 text-2xl font-semibold sm:text-3xl">
              Services
            </h2>

            <ul className="space-y-3 text-lg text-gray-200 sm:space-y-4 sm:text-2xl">
              <li>
                <Link
                  to="/contact"
                  className="transition hover:text-sky-300"
                >
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="transition hover:text-sky-300"
                >
                  Our Story
                </Link>
              </li>

              <li>
                <Link
                  to="/terms"
                  className="transition hover:text-sky-300"
                >
                  Terms of Service
                </Link>
              </li>

              <li>
                <Link
                  to="/privacy"
                  className="transition hover:text-sky-300"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  to="/cart"
                  className="transition hover:text-sky-300"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* ============================== */}
          {/* NEWSLETTER */}
          {/* ============================== */}

          <div className="text-center">

            <h2 className="pb-8 text-3xl font-semibold sm:pb-12 sm:text-4xl">
              Join Our Newsletter
            </h2>

            <form
              onSubmit={handleNewsletterSubmit}
              noValidate
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >

              {/* EMAIL INPUT */}

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="Email address"
                className={`h-12 w-full max-w-[320px] rounded-xl bg-white px-5 text-base text-black outline-none md:text-xl ${
                  error
                    ? "border-2 border-red-500"
                    : "border-2 border-transparent focus:border-sky-400"
                }`}
              />

              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-xl px-5 py-2 text-base sm:w-auto sm:px-7 sm:text-lg md:px-10 md:text-2xl ${
                  loading
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-[#E6A07B] hover:bg-[#d98c63]"
                } duration-300`}
              >
                {loading ? "Joining..." : "Apply"}
              </button>

            </form>

            {/* ERROR */}

            {error && (
              <p className="mt-2 text-sm font-medium text-red-300 sm:text-base">
                {error}
              </p>
            )}

            {/* SUCCESS */}

            {success && (
              <p className="mt-2 text-sm font-medium text-green-300 sm:text-base">
                {success}
              </p>
            )}

            <p className="pt-2 text-lg text-gray-200 sm:text-xl">
              Stay updated with new trends and offers
            </p>

            {/* CONNECT */}

            <h3 className="pb-6 pt-12 text-2xl font-semibold sm:pb-8 sm:pt-20 sm:text-3xl">
              Connect with us
            </h3>

            <div className="flex justify-center gap-5 pb-6 text-3xl sm:gap-8 sm:pb-10 sm:text-4xl">

              <FaInstagram
                className="cursor-pointer duration-300 hover:text-pink-400"
              />

              <FaFacebookF
                className="cursor-pointer duration-300 hover:text-blue-400"
              />

              <FaTelegramPlane
                className="cursor-pointer duration-300 hover:text-sky-400"
              />

              <FaTwitter
                className="cursor-pointer duration-300 hover:text-sky-300"
              />

            </div>
          </div>

          {/* ============================== */}
          {/* QUICK LINKS */}
          {/* ============================== */}

          <div>

            <h2 className="pb-4 text-2xl font-semibold sm:pl-16 sm:text-3xl">
              Quick Links
            </h2>

            <ul className="space-y-3 pb-6 text-lg text-gray-200 sm:space-y-4 sm:pl-16 sm:text-2xl">

              <li>
                <Link
                  to="/about"
                  className="transition hover:text-sky-300"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  to="/wishlist"
                  className="transition hover:text-sky-300"
                >
                  Wishlist
                </Link>
              </li>

              <li>
                <Link
                  to="/order-tracking"
                  className="transition hover:text-sky-300"
                >
                  Track Order
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="transition hover:text-sky-300"
                >
                  Support
                </Link>
              </li>

            </ul>

            <h3 className="pt-8 text-2xl sm:pl-10 sm:pt-12 sm:text-3xl">
              We accepted payments
            </h3>

            <div className="flex gap-5 pt-6 text-4xl sm:gap-8 sm:pl-16 sm:pt-8 sm:text-5xl">

              <FaCcVisa />

              <FaGooglePay />

              <FaIdCard />

            </div>
          </div>

        </div>

        {/* ============================== */}
        {/* DIVIDER */}
        {/* ============================== */}

        <hr className="my-8 border-white/40 sm:my-10" />

        {/* ============================== */}
        {/* BOTTOM */}
        {/* ============================== */}

        <div className="flex flex-col items-center justify-between gap-5 pt-5 text-center text-lg text-gray-200 sm:text-xl lg:flex-row lg:pt-10 lg:text-left lg:text-2xl">

          <p>
            © 2026 Apple Blossom. All Rights Reserved
          </p>

          <div className="flex flex-wrap justify-center gap-3">

            <Link to="/terms">
              Term of Service
            </Link>

            <span>|</span>

            <Link to="/privacy">
              Privacy Policy
            </Link>

          </div>

        </div>

      </div>
    </footer>
  );
}

export default Footer;
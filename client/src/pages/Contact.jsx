import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Current field ki error remove
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Success message remove
    setSuccess("");
  };

  // =========================
  // VALIDATION
  // =========================

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      message: "",
    };

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    // Message
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(
      (error) => error !== ""
    );
  };

  // =========================
  // FORM SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");

    // Validate
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setLoading(true);

      // =========================
      // SEND DATA TO BACKEND
      // =========================

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API_URL}/contact`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: formData.message,
          }),
        }
      );

      const data = await response.json();

      // =========================
      // BACKEND ERROR
      // =========================

      if (!response.ok) {
        setSuccess("");
        alert(data.message || "Message send nahi hua.");
        return;
      }

      // =========================
      // SUCCESS
      // =========================

      setSuccess(
        "Your message has been sent successfully!"
      );

      // Clear form
      setFormData({
        name: "",
        email: "",
        message: "",
      });

      setErrors({
        name: "",
        email: "",
        message: "",
      });

    } catch (error) {
      console.error("CONTACT ERROR:", error);

      alert(
        "Server se connection nahi ho raha."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-white py-10 sm:py-14 lg:py-20">

      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">

        {/* ================= HEADING ================= */}

        <div className="text-center pb-10 sm:mb-12 lg:mb-16">

          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[55px] font-bold text-[#0c4a6e]">
            Contact Us
          </h1>

          <p className="mt-4 text-lg sm:text-xl lg:text-2xl font-medium text-slate-700">
            We'd love to hear from you.
          </p>

        </div>

        {/* ================= CONTACT INFO + FORM ================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* ================= LEFT SIDE ================= */}

          <div className="w-full">

            <h2 className="text-2xl sm:text-3xl font-bold text-[#0c4a6e] pb-2">
              Get In Touch
            </h2>
 
            <div className="mt-8 space-y-4">

              {/* EMAIL */}

              <div className="rounded-[24px] border border-sky-100 bg-sky-50 p-4 sm:p-5">

                <p className="font-semibold text-slate-900">
                  Email
                </p>

                <p className="mt-1 text-sm text-slate-600 sm:text-base break-all">
                  support@appleblossom.com
                </p>

              </div>

              {/* PHONE */}
<br/>
              <div className="rounded-[24px] border border-sky-100 bg-sky-50 p-4 sm:p-5">

                <p className="font-semibold text-slate-900">
                  Phone
                </p>

                <p className="mt-1 text-sm text-slate-600 sm:text-base">
                  +91 xxxxx xxx10
                </p>

              </div>

              {/* ADDRESS */}
<br/>
              <div className="rounded-[24px] border border-sky-100 bg-sky-50 p-4 sm:p-5">

                <p className="font-semibold text-slate-900">
                  Address
                </p>

                <p className="mt-1 text-sm text-slate-600 sm:text-base">
                  123 Fashion Street, New Delhi, India
                </p>

              </div>

            </div>

          </div>

          {/* ================= RIGHT SIDE FORM ================= */}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="w-full rounded-[28px] border border-slate-200 bg-slate-50 p-5 sm:p-7 lg:p-8"
          >

            {/* ================= NAME + EMAIL ================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pb-4 sm:pb-6">

              {/* NAME */}

              <div>

                <label className="block text-sm font-semibold text-slate-700">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 outline-none transition ${
                    errors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-300 focus:border-sky-500"
                  }`}
                />

                {errors.name && (
                  <p className="mt-1.5 text-sm font-medium text-red-500">
                    {errors.name}
                  </p>
                )}

              </div>

              {/* EMAIL */}

              <div>

                <label className="block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 outline-none transition ${
                    errors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-300 focus:border-sky-500"
                  }`}
                />

                {errors.email && (
                  <p className="mt-1.5 text-sm font-medium text-red-500">
                    {errors.email}
                  </p>
                )}

              </div>

            </div>

            {/* ================= MESSAGE ================= */}

            <div className="mt-4">

              <label className="block text-sm font-semibold text-slate-700">
                Message
              </label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us how we can help."
                className={`mt-2 min-h-32 w-full resize-none rounded-2xl border bg-white px-4 py-3 outline-none transition ${
                  errors.message
                    ? "border-red-500 focus:border-red-500"
                    : "border-slate-300 focus:border-sky-500"
                }`}
              />

              {errors.message && (
                <p className="mt-1.5 text-sm font-medium text-red-500">
                  {errors.message}
                </p>
              )}

            </div>

            {/* ================= SUCCESS MESSAGE ================= */}

            {success && (
              <p className="mt-4 text-center text-sm font-semibold text-green-600">
                {success}
              </p>
            )}

            {/* ================= BUTTON ================= */}
<br/><br/>
            <button
              type="submit"
              disabled={loading}
              className={`mt-6 w-full rounded-2xl px-5 py-3 text-base font-semibold text-white transition duration-300 ${
                loading
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-sky-600 hover:bg-sky-700"
              }`}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

          </form>

        </div>

        {/* ================= MAP ================= */}
<br/><br/>
        <div className="mt-12 sm:mt-16 lg:mt-20">

          <h2 className="mb-6 text-center text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0c4a6e]">
            Find Us
          </h2>
<br/>
          <div className="w-full overflow-hidden rounded-[28px] border border-sky-100 shadow-sm">

            <iframe
              title="Apple Blossom Location"
              src="https://www.google.com/maps?q=New+Delhi,+India&output=embed"
              className="w-full h-[300px] sm:h-[400px] lg:h-[500px]"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />

          </div>

        </div>

      </div>

    </section>
  );
}

export default Contact;
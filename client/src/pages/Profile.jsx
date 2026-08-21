import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Prefer not to say");
  const [saveMessage, setSaveMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (savedUser) {
      setUser(savedUser);
      setEmail(savedUser.email || "");
      setPhone(savedUser.phone || "");
      setGender(savedUser.gender || "Prefer not to say");
    }
  }, []);

  const handleSave = () => {
    const updatedUser = {
      ...user,
      email: email.trim(),
      phone: phone.trim(),
      gender,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setSaveMessage("Profile updated successfully.");
    setIsEditing(false);

    window.dispatchEvent(new Event("authChanged"));

    setTimeout(() => {
      setSaveMessage("");
    }, 3000);
  };

  return (
    <section className="min-h-screen w-full bg-[#d9f0fb]">
      {/* Full Width Container */}
      <div className="w-full px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12 xl:px-12 xl:py-14  2xl:px-16 2xl:py-16 ">
        {/* Header */}
        <div className="flex w-full flex-col gap-6 rounded-[28px] bg-white p-5 sm:p-7 md:flex-row md:items-center md:justify-between md:p-8 lg:p-10 ">
          <div>
            <h1
              className="font-bold text-[#0c4a6e] text-1xl sm:text-4xl lg:text-5xl xl:text-[52px] "
              style={{ fontFamily: "Georgia, serif" }}
            >
              My Profile
            </h1>

            <p className=" mt-2 text-sm text-slate-600 sm:text-base lg:text-lg ">
              Manage your account details and access orders, wishlist, and
              settings.
            </p>
          </div>
          <br />

          {/* Header Buttons */}
          <div className=" flex flex-col gap-3 w-full sm:flex-row md:w-auto  ">
            <Link
              to="/order-tracking"
              className="
                inline-flex items-center justify-center
                rounded-full
                bg-sky-600
                px-5 py-3
                text-sm font-semibold text-white
                transition hover:bg-sky-700
                sm:px-6
              "
            >
              Order Tracking
            </Link>

            <Link
              to="/wishlist"
              className="
                inline-flex items-center justify-center
                rounded-full
                bg-slate-100
                px-5 py-3
                text-sm font-semibold text-slate-700
                transition hover:bg-slate-200 
                sm:px-6
              "
            >
              Wishlist
            </Link>
          </div>
        </div>
        <br />
        {/* Main Content */}
        <div className=" mt-6 grid w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] lg:gap-8 xl:gap-10 2xl:grid-cols-[minmax(0,1.5fr)_minmax(400px,0.8fr)] 2xl:gap-12 ">
          {/* Account Details */}
          <div className=" w-full rounded-[28px] border border-slate-200  bg-slate-50 p-5 sm:p-7 lg:p-8 xl:p-10 ">
            <h2 className=" text-2xl font-semibold text-slate-900 sm:text-3xl  ">
              Account Details
            </h2>

            {user ? (
              <div className="mt-6 space-y-6 text-slate-700">
                {/* Profile Settings */}
                <div
                  className="
                    flex flex-col gap-4

                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div>
                    <h3 className="text-sm uppercase tracking-[0.15em] text-slate-500">
                      Profile Settings
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditing((prev) => !prev)}
                    className="
                      w-full
                      rounded-full
                      border border-slate-300
                      bg-white
                      px-4 py-2
                      text-sm font-semibold text-slate-700
                      transition hover:border-slate-400 hover:bg-slate-100

                      sm:w-auto
                    "
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm uppercase tracking-[0.15em] text-slate-500">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={!isEditing}
                    className={`mt-2 w-full rounded-3xl border px-4 py-3 text-base outline-none focus:border-sky-500 ${
                      isEditing
                        ? "border-slate-300 bg-white text-slate-900"
                        : "border-transparent bg-slate-100 text-slate-500"
                    }`}
                  />
                </div>

                {/* Phone */}
                <div className="pt-4">
                  <label className="text-sm uppercase tracking-[0.15em] text-slate-500">
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Enter phone number"
                    disabled={!isEditing}
                    className={`mt-2 w-full rounded-3xl border px-4 py-3 text-base outline-none focus:border-sky-500 ${
                      isEditing
                        ? "border-slate-300 bg-white text-slate-900"
                        : "border-transparent bg-slate-100 text-slate-500"
                    }`}
                  />
                </div>

                {/* Gender */}
                <div className="pt-4">
                  <label className="text-sm uppercase tracking-[0.15em] text-slate-500">
                    Gender
                  </label>

                  <select
                    value={gender}
                    onChange={(event) => setGender(event.target.value)}
                    disabled={!isEditing}
                    className={`mt-2 w-full rounded-3xl border px-4 py-3 text-base outline-none focus:border-sky-500 ${
                      isEditing
                        ? "border-slate-300 bg-white text-slate-900"
                        : "border-transparent bg-slate-100 text-slate-500"
                    }`}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Non-binary</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
                <br />
                {/* Save Button */}
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="
                      w-full rounded-3xl
                      bg-sky-600
                      px-6 py-4
                      text-base font-semibold text-white
                      transition hover:bg-sky-700

                      sm:text-lg
                    "
                  >
                    Save Profile
                  </button>
                )}

                {saveMessage && (
                  <p className="text-sm font-medium text-green-600">
                    {saveMessage}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl bg-white p-6 text-center text-slate-700 shadow-sm sm:p-8">
                <p className="text-lg font-medium">No profile found.</p>

                <p className="mt-3 text-sm text-slate-500">
                  Please log in to see your profile information.
                </p>

                <Link
                  to="/login"
                  className="mt-6 inline-flex rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  Login Now
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div
            className="
              w-full
              rounded-[28px]
              border border-slate-200
              bg-white
              p-5
              shadow-sm

              sm:p-7

              lg:p-8

              xl:p-10
            "
          >
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Quick Actions
            </h2>

            <div className="pt-6 space-y-4">
              <Link
                to="/order-tracking"
                className="block w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-left text-base font-medium text-slate-800 transition hover:bg-slate-100"
              >
                View Orders
              </Link>
              <br />
              <Link
                to="/wishlist"
                className="block w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-left text-base font-medium text-slate-800 transition hover:bg-slate-100"
              >
                View Wishlist
              </Link>
              <br />
              <Link
                to="/cart"
                className="block w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-left text-base font-medium text-slate-800 transition hover:bg-slate-100"
              >
                Your Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;

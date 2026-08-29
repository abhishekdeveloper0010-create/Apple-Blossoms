import { useEffect, useState } from "react";

import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
  FaShoppingCart,
  FaSearch,
  FaBars,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";

function Header() {
  // =====================================================
  // STATES
  // =====================================================

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const API_URL =
    import.meta.env.VITE_SERVER_API_URL ||
    "http://localhost:4000/api";

  // =====================================================
  // LOAD SEARCH FROM URL
  // =====================================================

  useEffect(() => {
    const search = searchParams.get("search") || "";
    setSearchTerm(search);
  }, [searchParams]);

  // =====================================================
  // LOAD USER
  // =====================================================

  const syncUser = () => {
    try {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        const currentUser = JSON.parse(savedUser);
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("USER LOAD ERROR:", error);

      localStorage.removeItem("user");
      setUser(null);
    }
  };

  // =====================================================
  // COUNT WISHLIST FROM DATABASE
  // =====================================================

  const countWishlist = async () => {
    try {
      const token = localStorage.getItem("token");

      // User login nahi hai
      if (!token) {
        setWishlistCount(0);
        return;
      }

      const response = await fetch(`${API_URL}/wishlist`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Invalid/expired token
      if (response.status === 401) {
        setWishlistCount(0);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load wishlist"
        );
      }

      // Wishlist array
      const wishlist = Array.isArray(data.wishlist)
        ? data.wishlist
        : [];

      setWishlistCount(wishlist.length);
    } catch (error) {
      console.error("WISHLIST COUNT ERROR:", error);

      setWishlistCount(0);
    }
  };

  // =====================================================
  // COUNT CART
  // =====================================================

  const countCart = () => {
    try {
      const savedCart =
        JSON.parse(localStorage.getItem("cart")) || [];

      const totalItems = savedCart.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0),
        0,
      );

      setCartCount(totalItems);
    } catch (error) {
      console.error("CART LOAD ERROR:", error);

      setCartCount(0);
    }
  };

  // =====================================================
  // INITIAL LOAD + EVENTS
  // =====================================================

  useEffect(() => {
    syncUser();
    countWishlist();
    countCart();

    // Auth change
    const handleAuthChanged = () => {
      syncUser();
      countWishlist();
    };

    // Wishlist change
    const handleWishlistChanged = () => {
      countWishlist();
    };

    // Cart change
    const handleCartChanged = () => {
      countCart();
    };

    // Storage change
    const handleStorage = () => {
      syncUser();
      countWishlist();
      countCart();
    };

    window.addEventListener(
      "authChanged",
      handleAuthChanged
    );

    window.addEventListener(
      "wishlistChanged",
      handleWishlistChanged
    );

    window.addEventListener(
      "cartChanged",
      handleCartChanged
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "authChanged",
        handleAuthChanged
      );

      window.removeEventListener(
        "wishlistChanged",
        handleWishlistChanged
      );

      window.removeEventListener(
        "cartChanged",
        handleCartChanged
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  // =====================================================
  // SEARCH SUBMIT
  // =====================================================

  const handleSearch = (event) => {
    event.preventDefault();

    const value = searchTerm.trim();

    if (value) {
      navigate(
        `/shop?search=${encodeURIComponent(value)}`
      );
    } else {
      navigate("/shop");
    }

    setMenuOpen(false);
  };

  // =====================================================
  // SEARCH INPUT CHANGE
  // =====================================================

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchTerm(value);

    if (!value.trim()) {
      navigate("/shop");
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setUser(null);
    setWishlistCount(0);

    setProfileOpen(false);
    setMenuOpen(false);

    window.dispatchEvent(
      new Event("authChanged")
    );

    window.dispatchEvent(
      new Event("wishlistChanged")
    );

    navigate("/");
  };

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  const closeMobileMenu = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <header className="sticky top-0 z-50 w-full bg-[#d8edf8] shadow-md">

      {/* HEADER CONTAINER */}

      <div className="w-full px-4 sm:px-6 lg:px-16">

        <div className="flex h-20 items-center justify-between">

          {/* LOGO */}

          <div className="pl-0 lg:pl-8">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="
                whitespace-nowrap
                text-2xl
                font-bold
                text-sky-600
                sm:text-3xl
              "
            >
              Apple Blossom
            </Link>
          </div>

          {/* DESKTOP MENU */}

          <nav
            className="
              hidden
              items-center
              gap-10
              text-lg
              font-medium
              lg:flex
            "
          >
            <Link
              to="/"
              className="transition hover:text-sky-600"
            >
              Home
            </Link>

            <Link
              to="/shop"
              className="transition hover:text-sky-600"
            >
              Products
            </Link>

            <Link
              to="/about"
              className="transition hover:text-sky-600"
            >
              About
            </Link>

            <Link
              to="/contact"
              className="transition hover:text-sky-600"
            >
              Contact
            </Link>
          </nav>

          {/* DESKTOP RIGHT SECTION */}

          <div
            className="
              hidden
              items-center
              gap-5
              lg:flex
            "
          >

            {/* CART */}

            <Link
              to="/cart"
              className="
                relative
                flex
                items-center
                gap-2
                text-black
                transition
                hover:text-sky-600
              "
            >
              <FaShoppingCart />

              Cart

              {cartCount > 0 && (
                <span
                  className="
                    absolute
                    -right-3
                    -top-2
                    flex
                    h-6
                    min-w-[24px]
                    items-center
                    justify-center
                    rounded-full
                    bg-red-500
                    px-2
                    text-xs
                    font-bold
                    text-white
                  "
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* USER / LOGIN */}

            {user ? (
              <div
                className="relative"
                onMouseEnter={() =>
                  setProfileOpen(true)
                }
                onMouseLeave={() =>
                  setProfileOpen(false)
                }
              >

                {/* PROFILE BUTTON */}

                <Link
                  to="/profile"
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-full
                    bg-sky-600
                    px-4
                    py-2
                    text-white
                    transition
                    duration-300
                    hover:bg-sky-700
                  "
                >
                  <FaUserCircle />

                  My Account
                </Link>

                {/* PROFILE DROPDOWN */}

                {profileOpen && (
                  <div
                    className="
                      absolute
                      right-0
                      mt-2
                      w-64
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-2
                      shadow-lg
                    "
                  >

                    <div className="px-2 py-2">

                      <p className="text-xs text-slate-500">
                        Welcome
                      </p>

                      <p className="truncate text-lg font-bold text-slate-800">
                        {user.name || "User"}
                      </p>

                      {user.email && (
                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      )}
                    </div>

                    <hr className="my-2 border-slate-200" />

                    {/* PROFILE */}

                    <Link
                      to="/profile"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="
                        block
                        rounded-xl
                        px-3
                        py-2
                        text-sm
                        text-slate-700
                        hover:bg-sky-50
                      "
                    >
                      My Profile
                    </Link>

                    {/* ORDER TRACKING */}

                    <Link
                      to="/order-tracking"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="
                        block
                        rounded-xl
                        px-3
                        py-2
                        text-sm
                        text-slate-700
                        hover:bg-sky-50
                      "
                    >
                      Order Tracking
                    </Link>

                    {/* WISHLIST */}

                    <Link
                      to="/wishlist"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-xl
                        px-3
                        py-2
                        text-sm
                        text-slate-700
                        hover:bg-sky-50
                      "
                    >
                      <span>
                        Wishlist
                      </span>

                      {wishlistCount > 0 && (
                        <span
                          className="
                            rounded-full
                            bg-sky-100
                            px-2
                            py-0.5
                            text-xs
                            font-semibold
                            text-sky-600
                          "
                        >
                          {wishlistCount}
                        </span>
                      )}
                    </Link>

                    {/* LOGOUT */}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="
                        mt-1
                        w-full
                        rounded-xl
                        px-3
                        py-2
                        text-left
                        text-sm
                        text-rose-600
                        hover:bg-rose-50
                      "
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="
                  rounded-md
                  bg-sky-600
                  px-5
                  py-2
                  text-white
                  transition
                  hover:bg-sky-700
                "
              >
                Login
              </Link>
            )}

            {/* DESKTOP SEARCH */}

            <div
              className="
                min-w-0
                w-[180px]
                lg:w-[190px]
                xl:w-[230px]
                2xl:w-[280px]
              "
            >
              <form
                onSubmit={handleSearch}
                className="
                  flex
                  w-full
                  min-w-0
                  items-center
                  overflow-hidden
                  rounded-full
                  border
                  border-gray-300
                  bg-white
                "
              >
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  className="
                    min-w-0
                    flex-1
                    px-4
                    py-2
                    outline-none
                  "
                />

                <button
                  type="submit"
                  className="
                    shrink-0
                    px-4
                    py-2
                    text-gray-600
                    transition
                    hover:bg-sky-700
                    hover:text-white
                  "
                  aria-label="Search"
                >
                  <FaSearch />
                </button>
              </form>
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            className="
              text-2xl
              lg:hidden
            "
            onClick={() =>
              setMenuOpen((prev) => !prev)
            }
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <FaTimes />
            ) : (
              <FaBars />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}

      {menuOpen && (
        <div
          className="
            border-t
            bg-white
            lg:hidden
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              px-6
              py-5
            "
          >

            <Link
              to="/"
              onClick={closeMobileMenu}
            >
              Home
            </Link>

            <Link
              to="/shop"
              onClick={closeMobileMenu}
            >
              Products
            </Link>

            <Link
              to="/about"
              onClick={closeMobileMenu}
            >
              About
            </Link>

            <Link
              to="/contact"
              onClick={closeMobileMenu}
            >
              Contact
            </Link>

            {/* MOBILE CART */}

            <Link
              to="/cart"
              onClick={closeMobileMenu}
            >
              Cart

              {cartCount > 0 && (
                <span className="ml-2 text-xs font-bold text-red-500">
                  ({cartCount})
                </span>
              )}
            </Link>

            {/* MOBILE USER */}

            {user ? (
              <>
                <div
                  className="
                    rounded-xl
                    bg-sky-50
                    px-4
                    py-3
                  "
                >
                  <p className="text-xs text-slate-500">
                    Welcome
                  </p>

                  <p className="font-bold text-sky-700">
                    {user.name || "User"}
                  </p>

                  {user.email && (
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  )}
                </div>

                {/* MY PROFILE */}

                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="font-semibold text-sky-700"
                >
                  My Profile
                </Link>

                {/* ORDER TRACKING */}

                <Link
                  to="/order-tracking"
                  onClick={closeMobileMenu}
                >
                  Order Tracking
                </Link>

                {/* WISHLIST */}

                <Link
                  to="/wishlist"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <span>
                    Wishlist
                  </span>

                  {wishlistCount > 0 && (
                    <span
                      className="
                        rounded-full
                        bg-sky-100
                        px-2
                        py-0.5
                        text-xs
                        font-semibold
                        text-sky-600
                      "
                    >
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    text-left
                    text-rose-600
                  "
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="font-semibold text-sky-700"
              >
                Login
              </Link>
            )}

            {/* MOBILE SEARCH */}

            <form
              onSubmit={handleSearch}
              className="
                flex
                overflow-hidden
                rounded-full
                border
              "
            >
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="
                  flex-1
                  px-4
                  py-2
                  outline-none
                "
              />

              <button
                type="submit"
                className="
                  bg-sky-600
                  px-4
                  text-white
                "
                aria-label="Search"
              >
                <FaSearch />
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
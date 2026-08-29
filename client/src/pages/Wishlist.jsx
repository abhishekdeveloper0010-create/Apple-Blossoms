import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const IMAGE_URL =
    import.meta.env.VITE_SERVER_IMAGES_URL ||
    "http://localhost:4000/images";

  const API_URL =
    import.meta.env.VITE_SERVER_API_URL ||
    "http://localhost:4000/api";

  // =====================================================
  // GET LOGIN USER
  // =====================================================

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (error) {
      console.error("User load error:", error);
      return null;
    }
  };

  // =====================================================
  // LOAD WISHLIST
  // =====================================================

  const loadWishlist = async () => {
    try {
      setError("");

      const user = getUser();

      // User login nahi hai
      if (!user) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      // Token nahi hai
      if (!token) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/wishlist`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load wishlist"
        );
      }

      // Only valid product objects
      const validItems = (data.wishlist || []).filter(
        (item) =>
          item &&
          typeof item === "object" &&
          item.id !== undefined
      );

      setWishlistItems(validItems);
    } catch (error) {
      console.error("Wishlist load error:", error);

      setWishlistItems([]);
      setError(
        error.message || "Failed to load wishlist"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD + EVENT LISTENER
  // =====================================================

  useEffect(() => {
    loadWishlist();

    const handleWishlistChange = () => {
      loadWishlist();
    };

    window.addEventListener(
      "wishlistChanged",
      handleWishlistChange
    );

    return () => {
      window.removeEventListener(
        "wishlistChanged",
        handleWishlistChange
      );
    };
  }, []);

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageURL = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${IMAGE_URL}/${image}`;
  };

  // =====================================================
  // REMOVE FROM WISHLIST
  // =====================================================

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first.");
        return;
      }

      const response = await fetch(
        `${API_URL}/wishlist/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to remove wishlist item"
        );
      }

      // UI se immediately remove
      setWishlistItems((prev) =>
        prev.filter(
          (item) =>
            Number(item.id) !== Number(productId)
        )
      );

      // Other components ko update karne ke liye
      window.dispatchEvent(
        new Event("wishlistChanged")
      );
    } catch (error) {
      console.error(
        "Remove wishlist error:",
        error
      );

      alert(
        error.message ||
          "Failed to remove product from wishlist."
      );
    }
  };

  // =====================================================
  // CLEAR ALL WISHLIST
  // =====================================================

  const clearWishlist = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first.");
        return;
      }

      const confirmed = window.confirm(
        "Are you sure you want to clear your wishlist?"
      );

      if (!confirmed) {
        return;
      }

      const response = await fetch(
        `${API_URL}/wishlist`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to clear wishlist"
        );
      }

      setWishlistItems([]);

      window.dispatchEvent(
        new Event("wishlistChanged")
      );
    } catch (error) {
      console.error(
        "Clear wishlist error:",
        error
      );

      alert(
        error.message ||
          "Failed to clear wishlist."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="min-h-screen w-full bg-[#f5fbff] py-10 sm:py-14 lg:py-20">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-16 2xl:px-20">
          <div className="mb-8 text-center sm:mb-12">
            <h1
              className="
                text-3xl
                font-bold
                text-[#0c4a6e]
                sm:text-4xl
                lg:text-5xl
                xl:text-[55px]
              "
            >
              Wishlist
            </h1>

            <p className="mt-3 text-base text-slate-600 sm:text-lg lg:text-xl">
              Your saved favorites
            </p>
          </div>

          <div
            className="
              w-full
              rounded-[24px]
              bg-white
              p-10
              text-center
              shadow-sm
              sm:rounded-[32px]
            "
          >
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />

            <p className="mt-4 text-slate-600">
              Loading wishlist...
            </p>
          </div>
        </div>
      </section>
    );
  }

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <section className="min-h-screen w-full bg-[#f5fbff] py-10 sm:py-14 lg:py-20">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-16 2xl:px-20">

        {/* =================================================
            HEADING
        ================================================= */}

        <div className="mb-8 text-center sm:mb-12">
          <h1
            className="
              text-3xl
              font-bold
              text-[#0c4a6e]
              sm:text-4xl
              lg:text-5xl
              xl:text-[55px]
            "
          >
            Wishlist
          </h1>

          <p className="mt-3 text-base text-slate-600 sm:text-lg lg:text-xl">
            Your saved favorites
          </p>

          <p
            className="
              mx-auto
              pt-3
              pb-4
              text-base
              leading-6
              text-slate-500
              sm:text-base
              sm:leading-7
            "
          >
            Products you loved will appear here for quick access.
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mb-6
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-4
              text-center
              text-red-600
            "
          >
            {error}
          </div>
        )}

        {/* =================================================
            WISHLIST NOT EMPTY
        ================================================= */}

        {wishlistItems.length > 0 && (
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={clearWishlist}
              className="
                rounded-xl
                bg-rose-50
                px-5
                py-3
                font-semibold
                text-rose-600
                transition
                hover:bg-rose-100
              "
            >
              Clear Wishlist
            </button>
          </div>
        )}
<br/>
        {/* =================================================
            EMPTY WISHLIST
        ================================================= */}

        {wishlistItems.length === 0 ? (
          <div
            className="
              w-full
              rounded-[24px]
              border
              border-dashed
              border-slate-300
              bg-white
              p-8
              text-center
              shadow-sm
              sm:rounded-[32px]
              sm:p-10
            "
          >
            <div className="mb-4 text-5xl">
              ♡
            </div>

            <p className="text-base text-slate-600 sm:text-lg">
              No items saved yet.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Add products to your wishlist and they will appear here.
            </p>

            <Link
              to="/shop"
              className="
                mt-5
                inline-flex
                rounded-2xl
                bg-sky-600
                px-5
                py-3
                font-semibold
                text-white
                transition
                hover:bg-sky-700
              "
            >
              Explore Products
            </Link>
          </div>
        ) : (

          /* =================================================
             WISHLIST PRODUCTS
          ================================================= */

          <div
            className="
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              sm:gap-6
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            {wishlistItems.map((item) => {
              const price = Number(item.price || 0);

              const oldPrice = Number(
                item.old_price ||
                  item.oldPrice ||
                  0
              );

              const hasOldPrice =
                oldPrice > price;

              const discount = hasOldPrice
                ? Math.round(
                    ((oldPrice - price) /
                      oldPrice) *
                      100
                  )
                : 0;

              return (
                <div
                  key={item.id}
                  className="
                    w-full
                    rounded-[24px]
                    border
                    border-slate-200
                    bg-white
                    p-4
                    shadow-sm
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-lg
                    sm:rounded-[28px]
                  "
                >

                  {/* =================================================
                      IMAGE
                  ================================================= */}

                  <Link
                    to={`/product/${item.id}`}
                  >
                    <div className="relative">
                      <img
                        src={getImageURL(item.image)}
                        alt={
                          item.title ||
                          item.name ||
                          "Product"
                        }
                        className="
                          h-52
                          w-full
                          rounded-[20px]
                          object-cover
                          sm:h-56
                          lg:h-64
                        "
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />

                      {/* DISCOUNT */}

                      {hasOldPrice && (
                        <span
                          className="
                            absolute
                            left-3
                            top-3
                            rounded-full
                            bg-red-600
                            px-3
                            py-1
                            text-sm
                            font-bold
                            text-white
                          "
                        >
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* =================================================
                      PRODUCT INFO
                  ================================================= */}

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-3
                      pt-4
                    "
                  >
                    <div className="min-w-0 flex-1">

                      {/* CATEGORY */}

                      {item.category && (
                        <p className="text-sm text-slate-500">
                          {item.category}
                        </p>
                      )}

                      {/* TITLE */}

                      <Link
                        to={`/product/${item.id}`}
                      >
                        <h2
                          className="
                            mt-1
                            truncate
                            text-lg
                            font-semibold
                            text-slate-900
                            transition
                            hover:text-sky-600
                            sm:text-xl
                          "
                        >
                          {item.title ||
                            item.name ||
                            "Product"}
                        </h2>
                      </Link>

                      {/* BRAND */}

                      {item.brand && (
                        <p className="mt-1 text-sm text-slate-500">
                          {item.brand}
                        </p>
                      )}

                      {/* PRICE */}

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900">
                          ₹{price}
                        </span>

                        {hasOldPrice && (
                          <span className="text-sm text-slate-400 line-through">
                            ₹{oldPrice}
                          </span>
                        )}
                      </div>

                      {/* OFFER */}

                      {item.offer && (
                        <p className="mt-1 text-sm font-semibold text-green-600">
                          {item.offer}
                        </p>
                      )}

                      {/* DISCOUNT */}

                      {!item.offer && hasOldPrice && (
                        <p className="mt-1 text-sm font-semibold text-green-600">
                          {discount}% OFF
                        </p>
                      )}

                      {/* RATING */}

                      {item.rating !== undefined &&
                        item.rating !== null &&
                        item.rating !== "" && (
                          <p className="mt-1 text-sm font-semibold text-yellow-600">
                            ★ {item.rating}
                          </p>
                        )}
                    </div>

                    {/* =================================================
                        REMOVE
                    ================================================= */}

                    <button
                      type="button"
                      onClick={() =>
                        removeFromWishlist(item.id)
                      }
                      className="
                        shrink-0
                        rounded-full
                        bg-rose-50
                        px-3
                        py-2
                        text-sm
                        font-semibold
                        text-rose-600
                        transition
                        hover:bg-rose-100
                      "
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Wishlist;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);

  const IMAGE_URL = import.meta.env.VITE_SERVER_IMAGES_URL;

  // =========================
  // LOAD WISHLIST
  // =========================

  const loadWishlist = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("wishlist")) || [];

      // Only valid product objects
      const validItems = stored.filter(
        (item) => item && typeof item === "object" && item.id !== undefined,
      );

      setWishlistItems(validItems);
    } catch (error) {
      console.error("Wishlist load error:", error);

      setWishlistItems([]);
    }
  };

  // =========================
  // LOAD + EVENT LISTENER
  // =========================

  useEffect(() => {
    loadWishlist();

    const handleWishlistChange = () => {
      loadWishlist();
    };

    window.addEventListener("wishlistChanged", handleWishlistChange);

    return () => {
      window.removeEventListener("wishlistChanged", handleWishlistChange);
    };
  }, []);

  // =========================
  // IMAGE URL
  // =========================

  const getImageURL = (image) => {
    if (!image) {
      return "";
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${IMAGE_URL}/${image}`;
  };

  // =========================
  // REMOVE WISHLIST
  // =========================

  const removeFromWishlist = (productId) => {
    const updated = wishlistItems.filter(
      (item) => Number(item.id) !== Number(productId),
    );

    setWishlistItems(updated);

    localStorage.setItem("wishlist", JSON.stringify(updated));

    window.dispatchEvent(new Event("wishlistChanged"));
  };

  // =========================
  // CLEAR ALL
  // =========================

  const clearWishlist = () => {
    setWishlistItems([]);

    localStorage.setItem("wishlist", JSON.stringify([]));

    window.dispatchEvent(new Event("wishlistChanged"));
  };

  // =========================
  // RETURN
  // =========================

  return (
    <section className="min-h-screen w-full bg-[#f5fbff] py-10 sm:py-14 lg:py-20">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-16 2xl:px-20">
        {/* =========================
            HEADING
        ========================= */}

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

        {/* =========================
            WISHLIST NOT EMPTY
        ========================= */}

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

        {/* =========================
            EMPTY WISHLIST
        ========================= */}

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
            <div className="text-5xl mb-4">♡</div>

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
          /* =========================
              WISHLIST PRODUCTS
          ========================= */

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
            {wishlistItems.map((item) => (
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
                {/* =========================
                    IMAGE
                ========================= */}

                <Link to={`/product/${item.id}`}>
                  <img
                    src={getImageURL(item.image)}
                    alt={item.title || item.name || "Product"}
                    className="
                      h-52
                      w-full
                      rounded-[20px]
                      object-cover
                      sm:h-56
                      lg:h-64
                    "
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </Link>

                {/* =========================
                    PRODUCT INFO
                ========================= */}

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
                    {/* Category */}

                    {item.category && (
                      <p className="text-sm text-slate-500">{item.category}</p>
                    )}

                    {/* Title */}

                    <Link to={`/product/${item.id}`}>
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
                        {item.title || item.name || "Product"}
                      </h2>
                    </Link>

                    {/* Brand */}

                    {item.brand && (
                      <p className="mt-1 text-sm text-slate-500">
                        {item.brand}
                      </p>
                    )}

                    {/* Price */}

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900">
                        ₹{item.price}
                      </span>

                      {Number(item.oldPrice) > Number(item.price) && (
                        <span className="text-sm text-slate-400 line-through">
                          ₹{item.oldPrice}
                        </span>
                      )}
                    </div>

                    {/* Offer */}

                    {item.offer && (
                      <p className="mt-1 text-sm font-semibold text-green-600">
                        {item.offer}
                      </p>
                    )}

                    {/* Rating */}

                    {item.rating && (
                      <p className="mt-1 text-sm font-semibold text-yellow-600">
                        ★ {item.rating}
                      </p>
                    )}
                  </div>

                  {/* REMOVE */}

                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Wishlist;

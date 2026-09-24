import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ProductDetail() {
  // =====================================================
  // URL PARAMETER
  // =====================================================

  const { id } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // ENV VARIABLES
  // =====================================================

  const API_URL =
    import.meta.env.VITE_SERVER_API_URL || "http://localhost:4000/api";

  const IMAGE_URL =
    import.meta.env.VITE_SERVER_IMAGES_URL || "http://localhost:4000/uploads";

  // =====================================================
  // PRODUCT STATES
  // =====================================================

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  // =====================================================
  // REVIEWS STATES
  // =====================================================

  const [reviews, setReviews] = useState([]);

  const [reviewSummary, setReviewSummary] = useState({
    totalReviews: 0,
    averageRating: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStars: 0,
  });

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);

  // =====================================================
  // REVIEW UI STATES
  // =====================================================

  const [reviewsAccordionOpen, setReviewsAccordionOpen] = useState(false);

  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);

  // =====================================================
  // STEP 6 : CHECK DELIVERY (PINCODE SERVICEABILITY)
  // =====================================================

  const [checkPin, setCheckPin] = useState("");
  const [checkResult, setCheckResult] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);

  const handleCheckDelivery = async () => {
    const pin = checkPin.trim();

    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      setCheckResult({
        serviceable: false,
        message: "Please enter a valid 6-digit pincode.",
      });
      return;
    }

    try {
      setCheckLoading(true);

      const response = await fetch(
        `${API_URL}/checkout/pincode/${pin}`
      );

      const data = await response.json();

      setCheckResult(data);
    } catch (error) {
      console.error("CHECK DELIVERY ERROR:", error);
      setCheckResult({
        serviceable: false,
        message: "Could not check pincode. Try again.",
      });
    } finally {
      setCheckLoading(false);
    }
  };

  const [reviewDrawerMode, setReviewDrawerMode] = useState("all");

  // all = all reviews
  // write = write/edit review

  // =====================================================
  // GET PRODUCT
  // =====================================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL.replace(/\/$/, "")}/products/${id}`,
        );

        const data = await response.json();

        console.log("PRODUCT API RESPONSE:", data);

        if (!response.ok) {
          throw new Error(data.message || "Product not found");
        }

        if (!data.success || !data.data) {
          throw new Error(data.message || "Product not found");
        }

        const productData = data.data;

        setProduct(productData);

        // =================================================
        // MAIN IMAGE
        // =================================================

        if (productData.image) {
          setSelectedImage(productData.image);
        } else if (
          Array.isArray(productData.images) &&
          productData.images.length > 0
        ) {
          setSelectedImage(productData.images[0]);
        }

        // =================================================
        // SIZE
        // =================================================

        const rawSizes = productData.size || "";

        if (rawSizes) {
          let sizes = rawSizes;

          if (typeof sizes === "string") {
            try {
              const parsed = JSON.parse(sizes);

              sizes = Array.isArray(parsed)
                ? parsed
                : sizes
                    .split(",")
                    .map((size) => size.trim())
                    .filter(Boolean);
            } catch {
              sizes = sizes
                .split(",")
                .map((size) => size.trim())
                .filter(Boolean);
            }
          }

          if (Array.isArray(sizes) && sizes.length > 0) {
            const firstSize =
              typeof sizes[0] === "object" ? sizes[0].size : sizes[0];

            setSelectedSize(firstSize || "");
          }
        }
      } catch (error) {
        console.error("PRODUCT FETCH ERROR:", error);

        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, API_URL]);

  // =====================================================
  // GET REVIEWS
  // =====================================================

  const fetchReviews = async () => {
    if (!id) return;

    try {
      setReviewLoading(true);

      const response = await fetch(
        `${API_URL.replace(/\/$/, "")}/reviews/product/${id}`,
      );

      const data = await response.json();

      console.log("REVIEWS API RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load reviews");
      }

      // =================================================
      // IMPORTANT:
      // Backend returns:
      // {
      //   success: true,
      //   summary: {...},
      //   reviews: [...]
      // }
      // =================================================

      setReviews(Array.isArray(data.reviews) ? data.reviews : []);

      setReviewSummary({
        totalReviews: Number(data.summary?.totalReviews || 0),

        averageRating: Number(data.summary?.averageRating || 0),

        fiveStars: Number(data.summary?.fiveStars || 0),

        fourStars: Number(data.summary?.fourStars || 0),

        threeStars: Number(data.summary?.threeStars || 0),

        twoStars: Number(data.summary?.twoStars || 0),

        oneStars: Number(data.summary?.oneStars || 0),
      });
    } catch (error) {
      console.error("REVIEWS FETCH ERROR:", error);

      setReviews([]);

      setReviewSummary({
        totalReviews: 0,
        averageRating: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStars: 0,
      });
    } finally {
      setReviewLoading(false);
    }
  };

  // =====================================================
  // LOAD REVIEWS
  // =====================================================

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id]);

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageURL = (image) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    const cleanImage = image.replace(/^\/+/, "");

    return `${IMAGE_URL.replace(/\/$/, "")}/${cleanImage}`;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <h2 className="text-2xl font-bold text-gray-700">Loading product...</h2>
      </div>
    );
  }

  // =====================================================
  // PRODUCT NOT FOUND
  // =====================================================

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50">
        <h1 className="text-3xl font-bold text-gray-700">Product Not Found</h1>

        <p className="mt-3 text-gray-500">Product ID: {id}</p>

        <button
          type="button"
          onClick={() => navigate("/shop")}
          className="
            mt-6
            bg-sky-600
            text-white
            px-6
            py-3
            rounded-xl
            font-semibold
            hover:bg-sky-700
            cursor-pointer
          "
        >
          Back to Shop
        </button>
      </div>
    );
  }

  // =====================================================
  // PRODUCT NAME
  // =====================================================

  const productName = product.name || "Product";

  // =====================================================
  // PRICE
  // =====================================================

  const price = Number(product.price || 0);

  const oldPrice = Number(product.oldPrice || product.old_price || 0);

  const discount =
    oldPrice > price && oldPrice > 0
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

  // =====================================================
  // OFFER
  // =====================================================

  const productOffer =
    product.offer || (discount > 0 ? `${discount}% OFF` : "");

  // =====================================================
  // SHIPPING
  // =====================================================

  const shippingCharge = Number(product.shipping_charge || 0);

  const deliveryCharge = Number(product.delivery_charge || 0);

  const shippingFree = Number(product.shipping_free) === 1;

  const deliveryFree = Number(product.delivery_free) === 1;

  // =====================================================
  // PRODUCT IMAGES
  // =====================================================

  let productImages = [];

  if (product.images) {
    if (Array.isArray(product.images)) {
      productImages = product.images;
    } else if (typeof product.images === "string") {
      try {
        const parsedImages = JSON.parse(product.images);

        if (Array.isArray(parsedImages)) {
          productImages = parsedImages;
        }
      } catch {
        productImages = product.images
          .split(",")
          .map((image) => image.trim())
          .filter(Boolean);
      }
    }
  }

  if (product.image && productImages.length === 0) {
    productImages = [product.image];
  }

  // =====================================================
  // PRODUCT SIZES
  // =====================================================

  let productSizes = [];

  const rawSizes = product.size || "";

  if (Array.isArray(rawSizes)) {
    productSizes = rawSizes;
  } else if (typeof rawSizes === "string" && rawSizes.trim()) {
    try {
      const parsedSizes = JSON.parse(rawSizes);

      if (Array.isArray(parsedSizes)) {
        productSizes = parsedSizes;
      } else {
        productSizes = rawSizes
          .split(",")
          .map((size) => size.trim())
          .filter(Boolean);
      }
    } catch {
      productSizes = rawSizes
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean);
    }
  }

  // =====================================================
  // USER
  // =====================================================

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  const getCartKey = () => {
    const user = getCurrentUser();
    const userId = user?.id || user?.user_id || user?.userId;

    return userId ? `cart_user_${userId}` : null;
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const askLogin = () => {
    alert("Please login or register first.");

    navigate("/login");
  };

  // =====================================================
  // WISHLIST
  // =====================================================

  const addToWishlist = async () => {
    const user = getCurrentUser();

    if (!user) {
      askLogin();
      return;
    }

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken");

    if (!token) {
      askLogin();
      return;
    }

    try {
      const response = await fetch(`${API_URL.replace(/\/$/, "")}/wishlist`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          product_id: product.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product to wishlist");
      }

      window.dispatchEvent(new Event("wishlistChanged"));

      alert("Product added to wishlist!");
    } catch (error) {
      console.error("Add wishlist error:", error);

      alert(error.message || "Failed to add product to wishlist.");
    }
  };

  // =====================================================
  // SIZE CHECK
  // =====================================================

  const checkSize = () => {
    if (productSizes.length > 0 && !selectedSize) {
      alert("Please select a size.");
      return false;
    }

    return true;
  };

  // =====================================================
  // STOCK CHECK
  // =====================================================

  const checkStock = () => {
    if (Number(product.stock || 0) <= 0) {
      alert("Product is out of stock.");

      return false;
    }

    return true;
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const addToCart = () => {
    const user = getCurrentUser();

    if (!user) {
      askLogin();
      return;
    }

    if (!checkSize()) return;
    if (!checkStock()) return;

    let cart = [];

    try {
      const cartKey = getCartKey();

      cart = cartKey
        ? JSON.parse(localStorage.getItem(cartKey)) || []
        : [];
    } catch {
      cart = [];
    }

    const existingItem = cart.find(
      (item) =>
        Number(item.id) === Number(product.id) && item.size === selectedSize,
    );

    if (existingItem) {
      existingItem.quantity = Number(existingItem.quantity || 0) + 1;

      existingItem.shipping_charge = shippingCharge;

      existingItem.delivery_charge = deliveryCharge;

      existingItem.shipping_free = shippingFree ? 1 : 0;

      existingItem.delivery_free = deliveryFree ? 1 : 0;
    } else {
      cart.push({
        cartItemId: `${product.id}-${selectedSize}-${Date.now()}`,

        id: product.id,

        title: productName,

        name: productName,

        description: product.description || "",

        image: selectedImage || product.image || "",

        images: productImages,

        price,

        oldPrice,

        offer: productOffer,

        category: product.category || "",

        category_id: product.category_id || null,

        size: selectedSize,

        sizes: productSizes,

        stock: product.stock || 0,

        shipping_charge: shippingCharge,

        shipping_free: shippingFree ? 1 : 0,

        delivery_charge: deliveryCharge,

        delivery_free: deliveryFree ? 1 : 0,

        quantity: 1,
      });
    }

    localStorage.setItem(
      getCartKey(),
      JSON.stringify(cart)
    );

    window.dispatchEvent(new Event("cartChanged"));

    navigate("/cart");
  };

  // =====================================================
  // BUY NOW
  // =====================================================

  const buyNow = () => {
    const user = getCurrentUser();

    if (!user) {
      askLogin();
      return;
    }

    if (!checkSize()) return;
    if (!checkStock()) return;

    const checkoutProduct = {
      cartItemId: `${product.id}-${selectedSize}-buynow-${Date.now()}`,

      id: product.id,

      title: productName,

      name: productName,

      description: product.description || "",

      image: selectedImage || product.image || "",

      images: productImages,

      price,

      oldPrice,

      offer: productOffer,

      category: product.category || "",

      category_id: product.category_id || null,

      size: selectedSize,

      sizes: productSizes,

      stock: product.stock || 0,

      shipping_charge: shippingCharge,

      shipping_free: shippingFree ? 1 : 0,

      delivery_charge: deliveryCharge,

      delivery_free: deliveryFree ? 1 : 0,

      quantity: 1,
    };

    localStorage.setItem(
      `${getCartKey()}_buy_now`,
      JSON.stringify(checkoutProduct)
    );

    navigate("/checkout");
  };

  // =====================================================
  // RENDER STARS
  // =====================================================

  const renderStars = (rating, interactive = false, size = "text-xl") => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => {
              if (interactive) {
                setReviewRating(star);
              }
            }}
            className={`
              ${size}
              leading-none
              ${star <= Number(rating) ? "text-yellow-400" : "text-gray-300"}
              ${
                interactive
                  ? "cursor-pointer hover:scale-110"
                  : "cursor-default"
              }
              transition
            `}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  // =====================================================
  // RATING DATA
  // =====================================================

  const averageRating = Number(reviewSummary.averageRating || 0);

  const totalReviews = Number(reviewSummary.totalReviews || 0);

  // =====================================================
  // RATING BREAKDOWN
  // =====================================================

  const ratingBreakdown = [
    {
      star: 5,
      count: Number(reviewSummary.fiveStars || 0),
    },
    {
      star: 4,
      count: Number(reviewSummary.fourStars || 0),
    },
    {
      star: 3,
      count: Number(reviewSummary.threeStars || 0),
    },
    {
      star: 2,
      count: Number(reviewSummary.twoStars || 0),
    },
    {
      star: 1,
      count: Number(reviewSummary.oneStars || 0),
    },
  ];

  // =====================================================
  // OPEN WRITE REVIEW
  // =====================================================

  const openWriteReview = () => {
    const user = getCurrentUser();

    if (!user) {
      askLogin();
      return;
    }

    setEditingReviewId(null);
    setReviewRating(5);
    setReviewText("");

    setReviewDrawerMode("write");
    setReviewDrawerOpen(true);
  };

  // =====================================================
  // OPEN ALL REVIEWS
  // =====================================================

  const openAllReviews = () => {
    setReviewDrawerMode("all");
    setReviewDrawerOpen(true);
  };

  // =====================================================
  // CLOSE DRAWER
  // =====================================================

  const closeReviewDrawer = () => {
    setReviewDrawerOpen(false);

    setEditingReviewId(null);
    setReviewText("");
    setReviewRating(5);
  };

  // =====================================================
  // SUBMIT / UPDATE REVIEW
  // =====================================================

  const submitReview = async () => {
    const user = getCurrentUser();

    if (!user) {
      askLogin();
      return;
    }

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken");

    if (!token) {
      askLogin();
      return;
    }

    if (!reviewRating || Number(reviewRating) < 1 || Number(reviewRating) > 5) {
      alert("Please select a rating.");

      return;
    }

    if (!reviewText.trim()) {
      alert("Please write your review.");

      return;
    }

    try {
      setReviewSubmitting(true);

      const response = await fetch(
        editingReviewId
          ? `${API_URL.replace(/\/$/, "")}/reviews/${editingReviewId}`
          : `${API_URL.replace(/\/$/, "")}/reviews`,
        {
          method: editingReviewId ? "PUT" : "POST",

          headers: {
            Authorization: `Bearer ${token}`,

            "Content-Type": "application/json",
          },

          body: JSON.stringify(
            editingReviewId
              ? {
                  rating: Number(reviewRating),

                  review: reviewText.trim(),
                }
              : {
                  product_id: product.id,

                  rating: Number(reviewRating),

                  review: reviewText.trim(),
                },
          ),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      alert(
        editingReviewId
          ? "Review updated successfully!"
          : "Review submitted successfully!",
      );

      setReviewText("");
      setReviewRating(5);
      setEditingReviewId(null);

      await fetchReviews();

      // After submit go to all reviews
      setReviewDrawerMode("all");
    } catch (error) {
      console.error("REVIEW SUBMIT ERROR:", error);

      alert(error.message || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // =====================================================
  // EDIT REVIEW
  // =====================================================

  const editReview = (review) => {
    setEditingReviewId(review.id);

    setReviewRating(Number(review.rating));

    setReviewText(review.review || "");

    setReviewDrawerMode("write");
    setReviewDrawerOpen(true);
  };

  // =====================================================
  // DELETE REVIEW
  // =====================================================

  const deleteReview = async (reviewId) => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken");

    if (!token) {
      askLogin();
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL.replace(/\/$/, "")}/reviews/${reviewId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete review");
      }

      alert("Review deleted successfully!");

      await fetchReviews();
    } catch (error) {
      console.error("DELETE REVIEW ERROR:", error);

      alert(error.message || "Failed to delete review.");
    }
  };

  // =====================================================
  // CHECK MY REVIEW
  // =====================================================

  const isMyReview = (review) => {
    const currentUser = getCurrentUser();

    const currentUserId =
      currentUser?.id || currentUser?.user_id || currentUser?.userId;

    return currentUser && Number(currentUserId) === Number(review.user_id);
  };

  // =====================================================
  // OUT OF STOCK
  // =====================================================

  const outOfStock = Number(product.stock || 0) <= 0;

  // =====================================================
  // JSX
  // =====================================================

  return (
    <>
      <div className="min-h-screen bg-sky-50 p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-7 lg:p-10 shadow-sm">
            {/* =================================================
                PRODUCT LEFT + RIGHT
            ================================================= */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
              {/* =================================================
                  LEFT SIDE - IMAGE
              ================================================= */}

              <div>
                <div className="bg-gray-100 rounded-3xl p-4 sm:p-6">
                  {selectedImage ? (
                    <img
                      src={getImageURL(selectedImage)}
                      alt={productName}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className="
                        w-full
                        h-72
                        sm:h-96
                        lg:h-[550px]
                        object-contain
                        rounded-2xl
                      "
                    />
                  ) : (
                    <div
                      className="
                        h-72
                        sm:h-96
                        lg:h-[550px]
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <p className="text-gray-500">No image available</p>
                    </div>
                  )}
                </div>

                {/* =================================================
                    THUMBNAILS
                ================================================= */}

                {productImages.length > 0 && (
                  <div
                    className="
                      flex
                      gap-3
                      pt-5
                      overflow-x-auto
                      pb-2
                    "
                  >
                    {productImages.map((image, index) => (
                      <img
                        key={index}
                        src={getImageURL(image)}
                        alt={`${productName} ${index + 1}`}
                        onClick={() => setSelectedImage(image)}
                        className={`
                            flex-shrink-0
                            w-20
                            h-20
                            sm:w-24
                            sm:h-24
                            object-cover
                            rounded-xl
                            border-2
                            cursor-pointer
                            ${
                              selectedImage === image
                                ? "border-sky-600"
                                : "border-gray-200"
                            }
                          `}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* =================================================
                  RIGHT SIDE - PRODUCT DETAILS
              ================================================= */}

              <div>
                {/* CATEGORY */}

                {product.category && (
                  <p className="text-gray-500 text-lg">
                    Category:{" "}
                    <span className="font-semibold">{product.category}</span>
                  </p>
                )}

                {/* PRODUCT NAME */}

                <h1
                  className="
                    text-3xl
                    sm:text-4xl
                    font-bold
                    text-gray-800
                    pt-2
                    pb-2
                  "
                >
                  {productName}
                </h1>

                {/* =================================================
                    ⭐ COMPACT RATING
                ================================================= */}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {/* RATING */}

                  <button
                    type="button"
                    onClick={() =>
                      setReviewsAccordionOpen(!reviewsAccordionOpen)
                    }
                    className="
                      inline-flex
                      items-center
                      gap-1
                      bg-green-600
                      text-white
                      px-3
                      py-1.5
                    
                      rounded-lg
                      font-bold
                      cursor-pointer
                      hover:bg-green-700
                    "
                  >
                    {averageRating.toFixed(1)}
                    <span>★</span>
                  </button>

                  {/* RATINGS */}

                  <button
                    type="button"
                    onClick={() =>
                      setReviewsAccordionOpen(!reviewsAccordionOpen)
                    }
                    className="
                      text-gray-700
                      font-semibold
                      hover:text-sky-600
                      cursor-pointer
                    "
                  >
                    {totalReviews} {totalReviews === 1 ? "Rating" : "Ratings"}
                  </button>

                  <span className="text-gray-300">|</span>

                  {/* REVIEWS */}

                  <button
                    type="button"
                    onClick={openAllReviews}
                    className="
                      text-gray-700
                      font-semibold
                      hover:text-sky-600
                      cursor-pointer
                    "
                  >
                    {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
                  </button>

                  {/* ARROW */}

                  <button
                    type="button"
                    onClick={() =>
                      setReviewsAccordionOpen(!reviewsAccordionOpen)
                    }
                    className="
                      text-sky-600
                      font-bold
                      cursor-pointer
                      px-1
                    "
                  >
                    {reviewsAccordionOpen ? "▲" : "▼"}
                  </button>
                </div>

                {/* =================================================
                    ⭐ REVIEW ACCORDION
                    PAGE PAR SMALL SPACE
                ================================================= */}
                <div className="pb-2"></div>
                {reviewsAccordionOpen && (
                  <div
                    className="
                      mt-4
                      border
                      border-gray-200
                      rounded-2xl
                      overflow-hidden
                      bg-white
                    "
                  >
                    <div className="p-4">
                      {/* RATING TOP */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                        "
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="
                              text-4xl
                              font-bold
                              text-gray-800
                            "
                          >
                            {averageRating.toFixed(1)}
                          </span>

                          <div>
                            {renderStars(
                              Math.round(averageRating),
                              false,
                              "text-lg",
                            )}

                            <p className="text-xs text-gray-500 mt-1">
                              {totalReviews} Ratings & Reviews
                            </p>
                          </div>
                        </div>

                        {/* WRITE */}

                        <button
                          type="button"
                          onClick={openWriteReview}
                          className="
                            border-2
                            border-sky-500
                            text-sky-600
                            px-4
                            py-2
                            rounded-xl
                            font-bold
                            text-sm
                            hover:bg-sky-50
                            cursor-pointer
                            whitespace-nowrap
                          "
                        >
                          ✎ Write
                        </button>
                      </div>

                      {/* RATING BREAKDOWN */}

                      <div className="mt-4 space-y-1.5">
                        {ratingBreakdown.map(({ star, count }) => {
                          const percentage =
                            totalReviews > 0
                              ? Math.round((count / totalReviews) * 100)
                              : 0;

                          return (
                            <div
                              key={star}
                              className="
                                  flex
                                  items-center
                                  gap-2
                                "
                            >
                              <span
                                className="
                                    w-9
                                    text-xs
                                    font-semibold
                                    text-gray-600
                                  "
                              >
                                {star} ★
                              </span>

                              <div
                                className="
                                    flex-1
                                    bg-gray-200
                                    rounded-full
                                    h-2
                                    overflow-hidden
                                  "
                              >
                                <div
                                  className="
                                      bg-green-500
                                      h-full
                                      rounded-full
                                      transition-all
                                    "
                                  style={{
                                    width: `${percentage}%`,
                                  }}
                                />
                              </div>

                              <span
                                className="
                                    w-6
                                    text-right
                                    text-xs
                                    text-gray-500
                                  "
                              >
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* VIEW ALL */}

                      <button
                        type="button"
                        onClick={openAllReviews}
                        className="
                          mt-3
                          text-sky-600
                          font-bold
                          text-sm
                          hover:underline
                          cursor-pointer
                        "
                      >
                        View all reviews →
                      </button>
                    </div>
                  </div>
                )}

                {/* =================================================
                    DESCRIPTION
                ================================================= */}

                {product.description && (
                  <p
                    className="
                      pt-4
                      text-gray-600
                      text-lg
                      leading-7
                    "
                  >
                    {product.description}
                  </p>
                )}

                {/* =================================================
                    PRICE
                ================================================= */}

                <div
                  className="
                    flex
                    items-center
                    flex-wrap
                    gap-4
                    pt-5
                    pb-2
                  "
                >
                  <span
                    className="
                      text-3xl
                      sm:text-4xl
                      font-bold
                      text-gray-900
                    "
                  >
                    ₹{price}
                  </span>

                  {oldPrice > 0 && oldPrice > price && (
                    <span
                      className="
                          text-xl
                          text-gray-400
                          line-through
                        "
                    >
                      ₹{oldPrice}
                    </span>
                  )}

                  {discount > 0 && (
                    <span
                      className="
                        text-green-600
                        font-bold
                      "
                    >
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {/* OFFER */}

                {productOffer && (
                  <div
                    className="
                      mt-2
                      inline-block
                      bg-green-100
                      text-green-700
                      px-4
                      py-2
                      rounded-lg
                      font-bold
                    "
                  >
                    {productOffer}
                  </div>
                )}

                {/* =================================================
                    SIZE
                ================================================= */}

                {productSizes.length > 0 && (
                  <div className="pt-7">
                    <h3
                      className="
                        text-xl
                        font-bold
                        text-gray-800
                      "
                    >
                      Select Size
                    </h3>

                    <div
                      className="
                        flex
                        flex-wrap
                        gap-3
                        pt-2
                      "
                    >
                      {productSizes.map((size, index) => {
                        const sizeValue =
                          typeof size === "object" ? size.size : size;

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedSize(sizeValue)}
                            className={`
                                min-w-14
                                h-14
                                px-3
                                rounded-xl
                                border-2
                                font-semibold
                                cursor-pointer
                                ${
                                  selectedSize === sizeValue
                                    ? "bg-sky-600 text-white border-sky-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:border-sky-500"
                                }
                              `}
                          >
                            {sizeValue}
                          </button>
                        );
                      })}
                    </div>

                    {selectedSize && (
                      <p className="mt-3 text-gray-600">
                        Selected Size:{" "}
                        <span
                          className="
                            font-bold
                            text-sky-600
                          "
                        >
                          {selectedSize}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* =================================================
                    STOCK
                ================================================= */}

                <div className="pt-7">
                  {Number(product.stock || 0) > 0 ? (
                    <p
                      className="
                        text-green-600
                        font-semibold
                      "
                    >
                      ✓ In Stock ({product.stock})
                    </p>
                  ) : (
                    <p
                      className="
                        text-red-600
                        font-semibold
                      "
                    >
                      ✕ Out of Stock
                    </p>
                  )}
                </div>

                {/* =================================================
                    DELIVERY
                ================================================= */}

                <div
                  className="
                    mt-7
                    bg-gray-100
                    rounded-2xl
                    p-5
                  "
                >
                  <h3
                    className="
                      font-bold
                      text-lg
                    "
                  >
                    Shipping & Delivery Details
                  </h3>

                  <p
                    className="
                      text-gray-600
                      mt-3
                    "
                  >
                    Shipping:{" "}
                    <span
                      className="
                        font-semibold
                        text-green-600
                      "
                    >
                      {shippingFree ? "Free" : `₹${shippingCharge}`}
                    </span>
                  </p>

                  <p
                    className="
                      text-gray-600
                      mt-2
                    "
                  >
                    Delivery:{" "}
                    <span
                      className="
                        font-semibold
                        text-green-600
                      "
                    >
                      {deliveryFree ? "Free" : `₹${deliveryCharge}`}
                    </span>
                  </p>

                  <p
                    className="
                      text-gray-600
                      mt-2
                    "
                  >
                    Estimated Delivery: 3-5 Days
                  </p>
                </div>

                {/* =================================================
                    BUTTONS
                ================================================= */}

                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-3
                    gap-3
                    pt-8
                  "
                >
                  {/* WISHLIST */}

                  <button
                    type="button"
                    onClick={addToWishlist}
                    className="
                      border-2
                      border-rose-400
                      text-rose-500
                      py-3
                      rounded-xl
                      font-bold
                      hover:bg-rose-50
                      cursor-pointer
                    "
                  >
                    ♡ Wishlist
                  </button>

                  {/* CART */}

                  <button
                    type="button"
                    onClick={addToCart}
                    disabled={outOfStock}
                    className="
                      border-2
                      border-sky-600
                      text-sky-600
                      py-3
                      rounded-xl
                      font-bold
                      hover:bg-sky-50
                      cursor-pointer
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    Add to Cart
                  </button>

                  {/* BUY NOW */}

                  <button
                    type="button"
                    onClick={buyNow}
                    disabled={outOfStock}
                    className="
                      bg-sky-600
                      text-white
                      py-3
                      rounded-xl
                      font-bold
                      hover:bg-sky-700
                      cursor-pointer
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    Buy Now
                  </button>
                </div>

                {/* =================================================
                    STEP 6 : CHECK DELIVERY WIDGET
                ================================================= */}

                <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                  <h3 className="text-sm font-bold text-gray-700">
                    Check Delivery
                  </h3>

                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit pincode"
                      value={checkPin}
                      onChange={(e) =>
                        setCheckPin(
                          e.target.value.replace(/[^0-9]/g, "")
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-sky-500"
                    />

                    <button
                      type="button"
                      onClick={handleCheckDelivery}
                      disabled={checkLoading}
                      className="rounded-xl bg-sky-600 px-5 py-2 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-60"
                    >
                      {checkLoading ? "..." : "Check"}
                    </button>
                  </div>

                  {checkResult && (
                    <p
                      className={`mt-2 text-xs font-medium ${
                        checkResult.serviceable
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {checkResult.serviceable
                        ? `✓ Deliverable to ${checkResult.zoneLabel} in ~${checkResult.estimatedDeliveryText}. COD available.`
                        : checkResult.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* =====================================================
                IMPORTANT:
                CUSTOMER REVIEWS SECTION REMOVED FROM HERE
                Reviews ONLY appear inside right drawer.
            ===================================================== */}
          </div>
        </div>
      </div>

      {/* =========================================================
          RIGHT SIDE REVIEW DRAWER
      ========================================================= */}

      {reviewDrawerOpen && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            justify-end
          "
        >
          {/* BACKDROP */}

          <div
            className="
              absolute
              inset-0
              bg-black/40
            "
            onClick={closeReviewDrawer}
          />

          {/* =================================================
              DRAWER
          ================================================= */}

          <div
            className="
              relative
              h-full
              w-full
              sm:w-[500px]
              bg-white
              shadow-2xl
              flex
              flex-col
              animate-[slideIn_0.25s_ease-out]
            "
          >
            {/* =================================================
                DRAWER HEADER
            ================================================= */}

            <div
              className="
                flex
                items-center
                justify-between
                px-5
                py-4
                border-b
                border-gray-200
                bg-white
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    font-bold
                    text-gray-800
                  "
                >
                  {reviewDrawerMode === "write"
                    ? editingReviewId
                      ? "Edit Your Review"
                      : "Write a Review"
                    : "Reviews & Ratings"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">{productName}</p>
              </div>

              <button
                type="button"
                onClick={closeReviewDrawer}
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-gray-100
                  text-gray-600
                  text-xl
                  font-bold
                  hover:bg-gray-200
                  cursor-pointer
                "
              >
                ×
              </button>
            </div>

            {/* =================================================
                DRAWER CONTENT
            ================================================= */}

            <div
              className="
                flex-1
                overflow-y-auto
                p-5
              "
            >
              {/* =================================================
                  WRITE / EDIT REVIEW
              ================================================= */}

              {reviewDrawerMode === "write" ? (
                <div>
                  {/* PRODUCT */}

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      bg-gray-50
                      rounded-2xl
                      p-4
                    "
                  >
                    {selectedImage ? (
                      <img
                        src={getImageURL(selectedImage)}
                        alt={productName}
                        className="
                          w-16
                          h-16
                          object-contain
                          bg-white
                          rounded-xl
                        "
                      />
                    ) : null}

                    <div>
                      <h3 className="font-bold text-gray-800">{productName}</h3>

                      <p className="text-gray-500 text-sm mt-1">₹{price}</p>
                    </div>
                  </div>

                  {/* YOUR RATING */}

                  <div
                    className="
                      mt-5
                      bg-sky-50
                      border
                      border-sky-100
                      rounded-2xl
                      p-5
                    "
                  >
                    <p
                      className="
                        text-gray-700
                        font-semibold
                        mb-3
                      "
                    >
                      Your Rating
                    </p>

                    {renderStars(reviewRating, true, "text-3xl")}

                    <p className="text-sm text-gray-500 mt-3">
                      Tap a star to give your rating
                    </p>
                  </div>

                  {/* REVIEW TEXT */}

                  <div className="mt-6">
                    <label
                      className="
                        block
                        font-semibold
                        text-gray-700
                        mb-2
                      "
                    >
                      Your Review
                    </label>

                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={7}
                      maxLength={1000}
                      placeholder="Write your experience with this product..."
                      className="
                        w-full
                        border
                        border-gray-300
                        rounded-xl
                        p-4
                        outline-none
                        focus:border-sky-500
                        resize-none
                      "
                    />

                    <p
                      className="
                        text-sm
                        text-gray-400
                        mt-1
                        text-right
                      "
                    >
                      {reviewText.length}/1000
                    </p>
                  </div>

                  {/* VERIFIED BUYER */}

                  <div
                    className="
                      mt-5
                      bg-green-50
                      border
                      border-green-100
                      rounded-xl
                      p-4
                    "
                  >
                    <p className="text-green-700 font-semibold">
                      ✓ Verified Buyer
                    </p>

                    <p className="text-sm text-green-600 mt-1">
                      Share your genuine experience with this product.
                    </p>
                  </div>

                  {/* SUBMIT */}

                  <button
                    type="button"
                    onClick={submitReview}
                    disabled={reviewSubmitting}
                    className="
                      w-full
                      mt-6
                      bg-sky-600
                      text-white
                      py-3.5
                      rounded-xl
                      font-bold
                      hover:bg-sky-700
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                      cursor-pointer
                    "
                  >
                    {reviewSubmitting
                      ? "Submitting..."
                      : editingReviewId
                        ? "Update Review"
                        : "Submit Review"}
                  </button>

                  {/* CANCEL */}
                  <div className="pt-4"></div>
                  <button
                    type="button"
                    onClick={closeReviewDrawer}
                    className="
                      w-full
                      mt-3
                      border-2
                      border-gray-300
                      text-gray-700
                      py-3
                      rounded-xl
                      font-bold
                      hover:bg-gray-50
                      cursor-pointer
                    "
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                /* =================================================
                   ALL REVIEWS
                ================================================= */

                <div>
                  {/* =================================================
                      RATING SUMMARY
                  ================================================= */}

                  <div
                    className="
                      bg-sky-50
                      rounded-2xl
                      p-5
                    "
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div
                          className="
                            text-5xl
                            font-bold
                            text-gray-800
                          "
                        >
                          {averageRating.toFixed(1)}
                        </div>

                        <div className="mt-1">
                          {renderStars(
                            Math.round(averageRating),
                            false,
                            "text-lg",
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="font-bold text-gray-800">
                          {totalReviews} Ratings
                        </p>

                        <p className="text-gray-500 text-sm">
                          {totalReviews} Reviews
                        </p>
                      </div>
                    </div>

                    {/* =================================================
                        BREAKDOWN
                    ================================================= */}

                    <div className="mt-5 space-y-2">
                      {ratingBreakdown.map(({ star, count }) => {
                        const percentage =
                          totalReviews > 0
                            ? Math.round((count / totalReviews) * 100)
                            : 0;

                        return (
                          <div
                            key={star}
                            className="
                                flex
                                items-center
                                gap-2
                              "
                          >
                            <span
                              className="
                                  w-10
                                  text-sm
                                  font-semibold
                                  text-gray-600
                                "
                            >
                              {star} ★
                            </span>

                            <div
                              className="
                                  flex-1
                                  bg-gray-200
                                  rounded-full
                                  h-2.5
                                  overflow-hidden
                                "
                            >
                              <div
                                className="
                                    bg-green-500
                                    h-full
                                    rounded-full
                                    transition-all
                                  "
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>

                            <span
                              className="
                                  w-7
                                  text-right
                                  text-sm
                                  text-gray-500
                                "
                            >
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* =================================================
                      WRITE REVIEW BUTTON
                  ================================================= */}
                  <br />
                  <button
                    type="button"
                    onClick={openWriteReview}
                    className="
                      w-full
                      mt-5
                      border-2
                      border-sky-500
                      text-sky-600
                      py-3
                      rounded-xl
                      font-bold
                      hover:bg-sky-50
                      cursor-pointer
                    "
                  >
                    ✎ Write a Review
                  </button>

                  {/* =================================================
                      CUSTOMER REVIEWS
                  ================================================= */}

                  <div className="pt-7">
                    <div className="flex items-center justify-between pb-4">
                      <h3
                        className="
                          text-xl
                          font-bold
                          text-gray-800
                        "
                      >
                        Customer Reviews
                      </h3>

                      <span className="text-sm text-gray-500">
                        {totalReviews}
                      </span>
                    </div>

                    {/* LOADING */}

                    {reviewLoading ? (
                      <div className="text-center py-10">
                        <p className="text-gray-500">Loading reviews...</p>
                      </div>
                    ) : reviews.length === 0 ? (
                      /* =================================================
                         NO REVIEWS
                      ================================================= */

                      <div
                        className="
                          bg-gray-50
                          rounded-2xl
                          p-7
                          text-center
                        "
                      >
                        <div className="text-4xl mb-3">⭐</div>

                        <h4
                          className="
                            text-lg
                            font-bold
                            text-gray-700
                          "
                        >
                          No reviews yet
                        </h4>

                        <p className="text-gray-500 mt-1">
                          Be the first customer to review this product.
                        </p>
                      </div>
                    ) : (
                      /* =================================================
                         REVIEW LIST
                      ================================================= */

                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className="
                                bg-gray-50
                                rounded-2xl
                                p-4
                                border
                                border-gray-100
                              "
                          >
                            {/* USER + DATE */}

                            <div
                              className="
                                  flex
                                  items-start
                                  justify-between
                                  gap-3
                                "
                            >
                              <div>
                                <h4
                                  className="
                                      font-bold
                                      text-gray-800
                                    "
                                >
                                  {review.user_name ||
                                    review.name ||
                                    "Customer"}
                                </h4>

                                <p
                                  className="
                                      text-sm
                                      text-gray-400
                                      mt-1
                                    "
                                >
                                  {review.created_at
                                    ? new Date(
                                        review.created_at,
                                      ).toLocaleDateString("en-IN")
                                    : ""}
                                </p>
                              </div>

                              {renderStars(review.rating, false, "text-lg")}
                            </div>

                            {/* =================================================
                                  VERIFIED BUYER
                              ================================================= */}

                            <div className="mt-2">
                              <span
                                className="
                                    inline-flex
                                    items-center
                                    gap-1
                                    bg-green-100
                                    text-green-700
                                    px-2.5
                                    py-1
                                    rounded-full
                                    text-xs
                                    font-bold
                                  "
                              >
                                ✓ Verified Buyer
                              </span>
                            </div>

                            {/* REVIEW */}

                            <p
                              className="
                                  text-gray-600
                                  leading-6
                                  mt-3
                                "
                            >
                              {review.review || "No review text provided."}
                            </p>

                            {/* =================================================
                                  EDIT DELETE
                              ================================================= */}

                            {isMyReview(review) && (
                              <div
                                className="
                                    flex
                                    gap-4
                                    mt-4
                                  "
                              >
                                <button
                                  type="button"
                                  onClick={() => editReview(review)}
                                  className="
                                      text-sky-600
                                      font-semibold
                                      hover:underline
                                      cursor-pointer
                                    "
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => deleteReview(review.id)}
                                  className="
                                      text-red-500
                                      font-semibold
                                      hover:underline
                                      cursor-pointer
                                    "
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          DRAWER ANIMATION
      ========================================================= */}

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
            }

            to {
              transform: translateX(0);
            }
          }
        `}
      </style>
    </>
  );
}

export default ProductDetail;

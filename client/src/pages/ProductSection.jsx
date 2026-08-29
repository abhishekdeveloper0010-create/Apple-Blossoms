import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";

function ProductSection({
  products = [],
  selectedCategory = "All",
  onCategoryChange,
  filterData = {},
  searchTerm = "",
  loading = false,
  currentPage = 1,
  totalPages = 1,
  totalProducts = 0,
  onPageChange,
}) {
  // =====================================================
  // IMAGE URL
  // =====================================================

  const imageURL =
    import.meta.env.VITE_SERVER_IMAGES_URL ||
    "http://localhost:4000/images";

  // =====================================================
  // WISHLIST
  // =====================================================

  const API_URL =
    import.meta.env.VITE_SERVER_API_URL ||
    "http://localhost:4000/api";

  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // =====================================================
  // LOAD LOGGED-IN USER WISHLIST
  // =====================================================

  const loadWishlist = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setWishlistIds(new Set());
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

      const ids = (data.wishlist || [])
        .filter(
          (item) =>
            item &&
            (item.id !== undefined ||
              item.product_id !== undefined)
        )
        .map((item) =>
          Number(item.id ?? item.product_id)
        );

      setWishlistIds(new Set(ids));
    } catch (error) {
      console.error("Wishlist load error:", error);
      setWishlistIds(new Set());
    }
  };

  // =====================================================
  // LOAD WISHLIST
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
  // ADD / REMOVE WISHLIST
  // =====================================================

  const toggleWishlist = async (event, productId) => {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem("token");

    if (!token) {
      alert(
        "Please login first to add products to your wishlist."
      );
      return;
    }

    const id = Number(productId);

    const alreadyWishlisted = wishlistIds.has(id);

    try {
      setWishlistLoading(true);

      const response = await fetch(
        alreadyWishlisted
          ? `${API_URL}/wishlist/${id}`
          : `${API_URL}/wishlist`,
        {
          method: alreadyWishlisted ? "DELETE" : "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          ...(!alreadyWishlisted && {
            body: JSON.stringify({
              product_id: id,
            }),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (alreadyWishlisted
              ? "Failed to remove product from wishlist"
              : "Failed to add product to wishlist")
        );
      }

      // =================================================
      // UPDATE ICON IMMEDIATELY
      // =================================================

      setWishlistIds((prev) => {
        const next = new Set(prev);

        if (alreadyWishlisted) {
          next.delete(id);
        } else {
          next.add(id);
        }

        return next;
      });

      // =================================================
      // UPDATE OTHER WISHLIST COMPONENTS
      // =================================================

      window.dispatchEvent(
        new Event("wishlistChanged")
      );
    } catch (error) {
      console.error(
        "Wishlist update error:",
        error
      );

      alert(
        error.message ||
          "Wishlist update failed."
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // =====================================================
  // DEFAULT CATEGORIES
  // =====================================================

  const defaultCategories = [
    "All",
    "Shirts",
    "Dresses",
    "Beauty",
    "Bangles",
    "Shoes",
    "Slippers",
  ];

  // =====================================================
  // FILTER DATA
  // =====================================================

  const categories =
    filterData.categories?.length > 0
      ? ["All", ...filterData.categories]
      : defaultCategories;

  const brands =
    filterData.brands?.length > 0
      ? filterData.brands
      : [
          "U.S. POLO ASSN.",
          "Allen Solly",
          "LEVI'S",
          "RED TAPE",
          "VAN HEUSEN",
          "Pepe Jeans",
        ];

  const colors =
    filterData.colors?.length > 0
      ? filterData.colors
      : [
          "White",
          "Multicolor",
          "Black",
          "Blue",
          "Green",
          "Pink",
        ];

  const fabrics =
    filterData.fabrics?.length > 0
      ? filterData.fabrics
      : [
          "Cotton Blend",
          "Pure Cotton",
          "Polycotton",
          "Lycra Blend",
          "Satin",
          "Polyester",
        ];

  const sizes =
    filterData.sizes?.length > 0
      ? filterData.sizes
      : [
          "3XS",
          "2XS",
          "XS",
          "S",
          "M",
          "L",
          "XL",
          "2XL",
          "3XL",
          "4XL",
          "5XL",
          "6XL",
          "7XL",
        ];

  const patterns =
    filterData.patterns?.length > 0
      ? filterData.patterns
      : [
          "Solid",
          "Printed",
          "Checkered",
          "Striped",
          "Self Design",
          "Floral Print",
        ];

  const genders =
    filterData.genders?.length > 0
      ? filterData.genders
      : [
          "Men",
          "Women",
          "Boys",
          "Girls",
          "Unisex",
        ];

  const fits =
    filterData.fits?.length > 0
      ? filterData.fits
      : [
          "Regular",
          "Slim",
          "Relaxed",
          "Comfort",
          "Oversized",
          "Tailored",
          "Boxy",
        ];

  const occasions =
    filterData.occasions?.length > 0
      ? filterData.occasions
      : [
          "Casual",
          "Formal",
          "Party",
          "Festive",
          "Beach Wear",
          "Wedding",
          "Lounge Wear",
          "Sports",
        ];

  // =====================================================
  // SELECTED FILTERS
  // =====================================================

  const [selectedBrands, setSelectedBrands] =
    useState([]);

  const [selectedColors, setSelectedColors] =
    useState([]);

  const [selectedFabrics, setSelectedFabrics] =
    useState([]);

  const [selectedSizes, setSelectedSizes] =
    useState([]);

  const [selectedPatterns, setSelectedPatterns] =
    useState([]);

  const [selectedGenders, setSelectedGenders] =
    useState([]);

  const [selectedFits, setSelectedFits] =
    useState([]);

  const [selectedOccasions, setSelectedOccasions] =
    useState([]);

  const [selectedPrice, setSelectedPrice] =
    useState("");

  const [selectedRating, setSelectedRating] =
    useState("");

  const [selectedDiscount, setSelectedDiscount] =
    useState("");

  const [selectedOffers, setSelectedOffers] =
    useState([]);

  const [newArrivals, setNewArrivals] =
    useState(false);

  const [includeOutOfStock, setIncludeOutOfStock] =
    useState(false);

  // =====================================================
  // ACCORDION
  // =====================================================

  const [openSections, setOpenSections] =
    useState({
      categories: true,
      brand: true,
      color: false,
      fabric: false,
      size: false,
      pattern: false,
      gender: false,
      fit: false,
      occasion: false,
      price: true,
      ratings: false,
      discount: false,
      offers: false,
      newArrivals: false,
      availability: false,
    });

  // =====================================================
  // SHOW MORE
  // =====================================================

  const [showMoreBrands, setShowMoreBrands] =
    useState(false);

  const [showMoreColors, setShowMoreColors] =
    useState(false);

  const [showMoreFabrics, setShowMoreFabrics] =
    useState(false);

  const [showMorePatterns, setShowMorePatterns] =
    useState(false);

  // =====================================================
  // PRICE OPTIONS
  // =====================================================

  const priceOptions = [
    {
      label: "Under ₹300",
      value: "under-300",
      min: 0,
      max: 299,
    },
    {
      label: "₹300 - ₹500",
      value: "300-500",
      min: 300,
      max: 500,
    },
    {
      label: "₹500 - ₹700",
      value: "500-700",
      min: 500,
      max: 700,
    },
    {
      label: "₹700 - ₹1000",
      value: "700-1000",
      min: 700,
      max: 1000,
    },
    {
      label: "₹1000 - ₹1500",
      value: "1000-1500",
      min: 1000,
      max: 1500,
    },
    {
      label: "₹1500+",
      value: "1500-plus",
      min: 1500,
      max: Infinity,
    },
  ];

  // =====================================================
  // RATINGS
  // =====================================================

  const ratings = [
    {
      label: "4★ & above",
      value: "4",
    },
    {
      label: "3★ & above",
      value: "3",
    },
  ];

  // =====================================================
  // DISCOUNTS
  // =====================================================

  const discounts = [
    {
      label: "30% or more",
      value: 30,
    },
    {
      label: "40% or more",
      value: 40,
    },
    {
      label: "50% or more",
      value: 50,
    },
    {
      label: "60% or more",
      value: 60,
    },
    {
      label: "70% or more",
      value: 70,
    },
  ];

  // =====================================================
  // OFFERS
  // =====================================================

  const offers = [
    "Buy More, Save More",
    "Special Price",
  ];

  // =====================================================
  // TOGGLE ACCORDION
  // =====================================================

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // =====================================================
  // TOGGLE CHECKBOX
  // =====================================================

  const toggleCheckbox = (
    value,
    setter,
    currentValues
  ) => {
    if (currentValues.includes(value)) {
      setter(
        currentValues.filter(
          (item) => item !== value
        )
      );
    } else {
      setter([...currentValues, value]);
    }
  };

  // =====================================================
  // RESET PAGE WHEN FILTER CHANGES
  // =====================================================

  useEffect(() => {
    if (onPageChange) {
      onPageChange(1);
    }
  }, [
    selectedBrands,
    selectedColors,
    selectedFabrics,
    selectedSizes,
    selectedPatterns,
    selectedGenders,
    selectedFits,
    selectedOccasions,
    selectedPrice,
    selectedRating,
    selectedDiscount,
    selectedOffers,
    newArrivals,
    includeOutOfStock,
  ]);

  // =====================================================
  // LOCAL FILTERS
  // =====================================================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // ===================================================
    // SEARCH
    // ===================================================

    if (searchTerm?.trim()) {
      const searchText =
        searchTerm.toLowerCase().trim();

      result = result.filter((product) => {
        const title = String(
          product.title ||
            product.name ||
            ""
        ).toLowerCase();

        const description = String(
          product.description || ""
        ).toLowerCase();

        const category = String(
          product.category || ""
        ).toLowerCase();

        const brand = String(
          product.brand || ""
        ).toLowerCase();

        return (
          title.includes(searchText) ||
          description.includes(searchText) ||
          category.includes(searchText) ||
          brand.includes(searchText)
        );
      });
    }

    // ===================================================
    // BRAND
    // ===================================================

    if (selectedBrands.length > 0) {
      result = result.filter((product) =>
        selectedBrands.includes(
          product.brand
        )
      );
    }

    // ===================================================
    // COLOR
    // ===================================================

    if (selectedColors.length > 0) {
      result = result.filter((product) =>
        selectedColors.includes(
          product.color
        )
      );
    }

    // ===================================================
    // FABRIC
    // ===================================================

    if (selectedFabrics.length > 0) {
      result = result.filter((product) =>
        selectedFabrics.includes(
          product.fabric
        )
      );
    }

    // ===================================================
    // SIZE
    // ===================================================

    if (selectedSizes.length > 0) {
      result = result.filter((product) => {
        const productSize =
          product.sizes ??
          product.size ??
          "";

        if (Array.isArray(productSize)) {
          return productSize.some((size) =>
            selectedSizes.includes(
              String(size).trim()
            )
          );
        }

        if (
          typeof productSize === "string"
        ) {
          const productSizes =
            productSize
              .split(",")
              .map((size) =>
                size.trim()
              );

          return productSizes.some(
            (size) =>
              selectedSizes.includes(size)
          );
        }

        return false;
      });
    }

    // ===================================================
    // PATTERN
    // ===================================================

    if (selectedPatterns.length > 0) {
      result = result.filter((product) =>
        selectedPatterns.includes(
          product.pattern
        )
      );
    }

    // ===================================================
    // GENDER
    // ===================================================

    if (selectedGenders.length > 0) {
      result = result.filter((product) =>
        selectedGenders.includes(
          product.gender
        )
      );
    }

    // ===================================================
    // FIT
    // ===================================================

    if (selectedFits.length > 0) {
      result = result.filter((product) =>
        selectedFits.includes(
          product.fit
        )
      );
    }

    // ===================================================
    // OCCASION
    // ===================================================

    if (selectedOccasions.length > 0) {
      result = result.filter((product) =>
        selectedOccasions.includes(
          product.occasion
        )
      );
    }

    // ===================================================
    // PRICE
    // ===================================================

    if (selectedPrice) {
      const range =
        priceOptions.find(
          (item) =>
            item.value === selectedPrice
        );

      if (range) {
        result = result.filter(
          (product) => {
            const price = Number(
              product.price || 0
            );

            return (
              price >= range.min &&
              price <= range.max
            );
          }
        );
      }
    }

    // ===================================================
    // RATING
    // ===================================================

    if (selectedRating) {
      result = result.filter(
        (product) =>
          Number(product.rating || 0) >=
          Number(selectedRating)
      );
    }

    // ===================================================
    // DISCOUNT
    // ===================================================

    if (selectedDiscount) {
      result = result.filter(
        (product) => {
          const oldPrice = Number(
            product.oldPrice || 0
          );

          const price = Number(
            product.price || 0
          );

          if (
            !oldPrice ||
            oldPrice <= price
          ) {
            return false;
          }

          const discount =
            ((oldPrice - price) /
              oldPrice) *
            100;

          return (
            discount >=
            Number(selectedDiscount)
          );
        }
      );
    }

    // ===================================================
    // OFFERS
    // ===================================================

    if (selectedOffers.length > 0) {
      result = result.filter(
        (product) => {
          const offer = String(
            product.offerType ||
              product.offer ||
              ""
          ).toLowerCase();

          return selectedOffers.some(
            (selectedOffer) =>
              offer.includes(
                selectedOffer.toLowerCase()
              )
          );
        }
      );
    }

    // ===================================================
    // NEW ARRIVALS
    // ===================================================

    if (newArrivals) {
      result = result.filter(
        (product) =>
          product.newArrival === true ||
          product.newArrival === 1 ||
          product.newArrival === "1" ||
          product.newArrival === "true"
      );
    }

    // ===================================================
    // STOCK
    // ===================================================

    if (!includeOutOfStock) {
      result = result.filter(
        (product) => {
          if (
            product.inStock ===
              undefined &&
            product.stock === undefined
          ) {
            return true;
          }

          if (
            Number(product.stock) <= 0
          ) {
            return false;
          }

          if (
            product.inStock !== undefined
          ) {
            return (
              product.inStock === true ||
              product.inStock === 1 ||
              product.inStock === "1" ||
              product.inStock === "true"
            );
          }

          return true;
        }
      );
    }

    return result;
  }, [
    products,
    searchTerm,
    selectedBrands,
    selectedColors,
    selectedFabrics,
    selectedSizes,
    selectedPatterns,
    selectedGenders,
    selectedFits,
    selectedOccasions,
    selectedPrice,
    selectedRating,
    selectedDiscount,
    selectedOffers,
    newArrivals,
    includeOutOfStock,
  ]);

  // =====================================================
  // PAGE NUMBERS
  // =====================================================

  const getPageNumbers = () => {
    const pages = [];

    const total =
      Number(totalPages) || 1;

    const current =
      Number(currentPage) || 1;

    if (total <= 7) {
      for (
        let i = 1;
        i <= total;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (current > 3) {
      pages.push("left-dots");
    }

    const start = Math.max(
      2,
      current - 1
    );

    const end = Math.min(
      total - 1,
      current + 1
    );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push("right-dots");
    }

    pages.push(total);

    return pages;
  };

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedFabrics([]);
    setSelectedSizes([]);
    setSelectedPatterns([]);
    setSelectedGenders([]);
    setSelectedFits([]);
    setSelectedOccasions([]);
    setSelectedPrice("");
    setSelectedRating("");
    setSelectedDiscount([]);
    setSelectedOffers([]);
    setNewArrivals(false);
    setIncludeOutOfStock(false);

    if (onCategoryChange) {
      onCategoryChange("All");
    }

    if (onPageChange) {
      onPageChange(1);
    }
  };

  // =====================================================
  // CLEAR CATEGORY
  // =====================================================

  const clearCategory = () => {
    if (onCategoryChange) {
      onCategoryChange("All");
    }

    if (onPageChange) {
      onPageChange(1);
    }
  };

  // =====================================================
  // FILTER SECTION
  // =====================================================

  const FilterSection = ({
    title,
    section,
    children,
    hasValue = false,
    onClear,
  }) => {
    const isOpen =
      openSections[section];

    return (
      <div className="border-b border-slate-200 py-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              toggleSection(section)
            }
            className="flex flex-1 items-center justify-between text-left"
          >
            <span className="text-lg font-bold text-slate-800">
              {title}
            </span>

            <span className="mr-2 text-2xl text-slate-500">
              {isOpen ? "−" : "+"}
            </span>
          </button>

          {hasValue && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-bold text-cyan-700 hover:text-red-600"
            >
              Clear
            </button>
          )}
        </div>

        {isOpen && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
    );
  };

  // =====================================================
  // CHECKBOX
  // =====================================================

  const CheckboxOption = ({
    label,
    checked,
    onChange,
  }) => {
    return (
      <label className="flex cursor-pointer items-center gap-3 py-1.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-5 w-5 accent-cyan-800"
        />

        <span className="text-[15px] text-slate-700">
          {label}
        </span>
      </label>
    );
  };

  // =====================================================
  // RADIO
  // =====================================================

  const RadioOption = ({
    label,
    checked,
    onChange,
    name,
  }) => {
    return (
      <label className="flex cursor-pointer items-center gap-3 py-1.5">
        <input
          type="radio"
          name={name}
          checked={checked}
          onChange={onChange}
          className="h-5 w-5 accent-cyan-800"
        />

        <span className="text-[15px] text-slate-700">
          {label}
        </span>
      </label>
    );
  };

  // =====================================================
  // PRODUCT RANGE
  // =====================================================

  const productsPerPage = 8;

  const firstProductIndex =
    (Number(currentPage) - 1) *
    productsPerPage;

  const lastProductIndex =
    firstProductIndex +
    products.length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="bg-sky-50 p-4 sm:p-6 lg:p-10">
      <div className="rounded-3xl bg-cyan-800 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[350px_minmax(0,1fr)]">

          {/* =================================================
              FILTER SIDEBAR
          ================================================= */}

          <aside className="h-fit max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl bg-white p-6 sm:p-7 lg:sticky lg:top-24">

            {/* HEADER */}

            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-800">
                Filters
              </h3>

              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-semibold text-cyan-700 hover:text-red-600"
              >
                Clear All
              </button>
            </div>

            {/* SEARCH */}

            {searchTerm && (
              <div className="mt-4 rounded-lg bg-sky-50 p-3">
                <p className="text-xs text-slate-500">
                  Search results for
                </p>

                <p className="break-words font-semibold text-cyan-800">
                  "{searchTerm}"
                </p>
              </div>
            )}

            {/* =================================================
                CATEGORY
            ================================================= */}

            <FilterSection
              title="CATEGORIES"
              section="categories"
              hasValue={
                selectedCategory !== "All"
              }
              onClear={clearCategory}
            >
              {categories.map(
                (category) => (
                  <label
                    key={category}
                    className="flex cursor-pointer items-center gap-3 py-2"
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={
                        selectedCategory ===
                        category
                      }
                      onChange={() => {
                        if (
                          onCategoryChange
                        ) {
                          onCategoryChange(
                            category
                          );
                        }

                        if (
                          onPageChange
                        ) {
                          onPageChange(1);
                        }
                      }}
                      className="h-5 w-5 accent-cyan-800"
                    />

                    <span
                      className={
                        selectedCategory ===
                        category
                          ? "font-bold text-cyan-800"
                          : "text-slate-700"
                      }
                    >
                      {category}
                    </span>
                  </label>
                )
              )}
            </FilterSection>

            {/* =================================================
                BRAND
            ================================================= */}

            <FilterSection
              title="Brand"
              section="brand"
              hasValue={
                selectedBrands.length > 0
              }
              onClear={() =>
                setSelectedBrands([])
              }
            >
              {(
                showMoreBrands
                  ? brands
                  : brands.slice(0, 6)
              ).map((brand) => (
                <CheckboxOption
                  key={brand}
                  label={brand}
                  checked={selectedBrands.includes(
                    brand
                  )}
                  onChange={() =>
                    toggleCheckbox(
                      brand,
                      setSelectedBrands,
                      selectedBrands
                    )
                  }
                />
              ))}

              {brands.length > 6 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowMoreBrands(
                      !showMoreBrands
                    )
                  }
                  className="mt-2 text-sm font-semibold text-cyan-700"
                >
                  {showMoreBrands
                    ? "Show Less"
                    : `${brands.length - 6} MORE`}
                </button>
              )}
            </FilterSection>

            {/* =================================================
                COLOR
            ================================================= */}

            <FilterSection
              title="Color"
              section="color"
              hasValue={
                selectedColors.length > 0
              }
              onClear={() =>
                setSelectedColors([])
              }
            >
              {(
                showMoreColors
                  ? colors
                  : colors.slice(0, 6)
              ).map((color) => (
                <CheckboxOption
                  key={color}
                  label={color}
                  checked={selectedColors.includes(
                    color
                  )}
                  onChange={() =>
                    toggleCheckbox(
                      color,
                      setSelectedColors,
                      selectedColors
                    )
                  }
                />
              ))}

              {colors.length > 6 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowMoreColors(
                      !showMoreColors
                    )
                  }
                  className="mt-2 text-sm font-semibold text-cyan-700"
                >
                  {showMoreColors
                    ? "Show Less"
                    : `${colors.length - 6} MORE`}
                </button>
              )}
            </FilterSection>

            {/* =================================================
                FABRIC
            ================================================= */}

            <FilterSection
              title="Fabric"
              section="fabric"
              hasValue={
                selectedFabrics.length > 0
              }
              onClear={() =>
                setSelectedFabrics([])
              }
            >
              {(
                showMoreFabrics
                  ? fabrics
                  : fabrics.slice(0, 6)
              ).map((fabric) => (
                <CheckboxOption
                  key={fabric}
                  label={fabric}
                  checked={selectedFabrics.includes(
                    fabric
                  )}
                  onChange={() =>
                    toggleCheckbox(
                      fabric,
                      setSelectedFabrics,
                      selectedFabrics
                    )
                  }
                />
              ))}

              {fabrics.length > 6 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowMoreFabrics(
                      !showMoreFabrics
                    )
                  }
                  className="mt-2 text-sm font-semibold text-cyan-700"
                >
                  {showMoreFabrics
                    ? "Show Less"
                    : `${fabrics.length - 6} MORE`}
                </button>
              )}
            </FilterSection>

            {/* =================================================
                SIZE
            ================================================= */}

            <FilterSection
              title="Size"
              section="size"
              hasValue={
                selectedSizes.length > 0
              }
              onClear={() =>
                setSelectedSizes([])
              }
            >
              {sizes.map((size) => (
                <CheckboxOption
                  key={size}
                  label={size}
                  checked={selectedSizes.includes(
                    size
                  )}
                  onChange={() =>
                    toggleCheckbox(
                      size,
                      setSelectedSizes,
                      selectedSizes
                    )
                  }
                />
              ))}
            </FilterSection>

            {/* =================================================
                PATTERN
            ================================================= */}

            <FilterSection
              title="Pattern"
              section="pattern"
              hasValue={
                selectedPatterns.length > 0
              }
              onClear={() =>
                setSelectedPatterns([])
              }
            >
              {(
                showMorePatterns
                  ? patterns
                  : patterns.slice(0, 6)
              ).map((pattern) => (
                <CheckboxOption
                  key={pattern}
                  label={pattern}
                  checked={selectedPatterns.includes(
                    pattern
                  )}
                  onChange={() =>
                    toggleCheckbox(
                      pattern,
                      setSelectedPatterns,
                      selectedPatterns
                    )
                  }
                />
              ))}

              {patterns.length > 6 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowMorePatterns(
                      !showMorePatterns
                    )
                  }
                  className="mt-2 text-sm font-semibold text-cyan-700"
                >
                  {showMorePatterns
                    ? "Show Less"
                    : `${patterns.length - 6} MORE`}
                </button>
              )}
            </FilterSection>

            {/* =================================================
                GENDER
            ================================================= */}

            <FilterSection
              title="Gender"
              section="gender"
              hasValue={
                selectedGenders.length > 0
              }
              onClear={() =>
                setSelectedGenders([])
              }
            >
              {genders.map((gender) => (
                <CheckboxOption
                  key={gender}
                  label={gender}
                  checked={selectedGenders.includes(
                    gender
                  )}
                  onChange={() =>
                    toggleCheckbox(
                      gender,
                      setSelectedGenders,
                      selectedGenders
                    )
                  }
                />
              ))}
            </FilterSection>

            {/* =================================================
                FIT
            ================================================= */}

            <FilterSection
              title="Fit"
              section="fit"
              hasValue={
                selectedFits.length > 0
              }
              onClear={() =>
                setSelectedFits([])
              }
            >
              {fits.map((fit) => (
                <CheckboxOption
                  key={fit}
                  label={fit}
                  checked={selectedFits.includes(
                    fit
                  )}
                  onChange={() =>
                    toggleCheckbox(
                      fit,
                      setSelectedFits,
                      selectedFits
                    )
                  }
                />
              ))}
            </FilterSection>

            {/* =================================================
                OCCASION
            ================================================= */}

            <FilterSection
              title="Occasion"
              section="occasion"
              hasValue={
                selectedOccasions.length > 0
              }
              onClear={() =>
                setSelectedOccasions([])
              }
            >
              {occasions.map(
                (occasion) => (
                  <CheckboxOption
                    key={occasion}
                    label={occasion}
                    checked={selectedOccasions.includes(
                      occasion
                    )}
                    onChange={() =>
                      toggleCheckbox(
                        occasion,
                        setSelectedOccasions,
                        selectedOccasions
                      )
                    }
                  />
                )
              )}
            </FilterSection>

            {/* =================================================
                PRICE
            ================================================= */}

            <FilterSection
              title="Price"
              section="price"
              hasValue={
                selectedPrice !== ""
              }
              onClear={() =>
                setSelectedPrice("")
              }
            >
              {priceOptions.map(
                (price) => (
                  <RadioOption
                    key={price.value}
                    name="price"
                    label={price.label}
                    checked={
                      selectedPrice ===
                      price.value
                    }
                    onChange={() =>
                      setSelectedPrice(
                        price.value
                      )
                    }
                  />
                )
              )}
            </FilterSection>

            {/* =================================================
                RATING
            ================================================= */}

            <FilterSection
              title="Customer Ratings"
              section="ratings"
              hasValue={
                selectedRating !== ""
              }
              onClear={() =>
                setSelectedRating("")
              }
            >
              {ratings.map(
                (rating) => (
                  <RadioOption
                    key={rating.value}
                    name="rating"
                    label={rating.label}
                    checked={
                      selectedRating ===
                      rating.value
                    }
                    onChange={() =>
                      setSelectedRating(
                        rating.value
                      )
                    }
                  />
                )
              )}
            </FilterSection>

            {/* =================================================
                DISCOUNT
            ================================================= */}

            <FilterSection
              title="Discount"
              section="discount"
              hasValue={
                selectedDiscount !== ""
              }
              onClear={() =>
                setSelectedDiscount("")
              }
            >
              {discounts.map(
                (discount) => (
                  <RadioOption
                    key={discount.value}
                    name="discount"
                    label={
                      discount.label
                    }
                    checked={
                      Number(
                        selectedDiscount
                      ) ===
                      discount.value
                    }
                    onChange={() =>
                      setSelectedDiscount(
                        discount.value
                      )
                    }
                  />
                )
              )}
            </FilterSection>

            {/* =================================================
                OFFERS
            ================================================= */}

            <FilterSection
              title="Offers"
              section="offers"
              hasValue={
                selectedOffers.length > 0
              }
              onClear={() =>
                setSelectedOffers([])
              }
            >
              {offers.map((offer) => (
                <CheckboxOption
                  key={offer}
                  label={offer}
                  checked={selectedOffers.includes(
                    offer
                  )}
                  onChange={() =>
                    toggleCheckbox(
                      offer,
                      setSelectedOffers,
                      selectedOffers
                    )
                  }
                />
              ))}
            </FilterSection>

            {/* =================================================
                NEW ARRIVALS
            ================================================= */}

            <FilterSection
              title="New Arrivals"
              section="newArrivals"
              hasValue={newArrivals}
              onClear={() =>
                setNewArrivals(false)
              }
            >
              <CheckboxOption
                label="New Arrivals"
                checked={newArrivals}
                onChange={() =>
                  setNewArrivals(
                    !newArrivals
                  )
                }
              />
            </FilterSection>

            {/* =================================================
                AVAILABILITY
            ================================================= */}

            <FilterSection
              title="Availability"
              section="availability"
              hasValue={
                includeOutOfStock
              }
              onClear={() =>
                setIncludeOutOfStock(false)
              }
            >
              <CheckboxOption
                label="Include Out of Stock"
                checked={
                  includeOutOfStock
                }
                onChange={() =>
                  setIncludeOutOfStock(
                    !includeOutOfStock
                  )
                }
              />
            </FilterSection>

            {/* CLEAR ALL */}

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 w-full rounded-lg bg-cyan-800 py-3 font-semibold text-white hover:bg-cyan-950"
            >
              Clear All Filters
            </button>
          </aside>

          {/* =================================================
              PRODUCTS AREA
          ================================================= */}

          <div className="min-w-0">

            {/* HEADER */}

            <div className="mb-8 text-white">
              <h2 className="text-3xl font-bold">
                Products
              </h2>

              <p className="pt-2 text-[17px] text-slate-100">
                {searchTerm
                  ? `Search results for "${searchTerm}"`
                  : selectedCategory ===
                    "All"
                  ? "Browse all products available in the store."
                  : `Showing ${selectedCategory} products.`}
              </p>

              <p className="mt-2 text-sm text-slate-200">
                {totalProducts} products in database
              </p>
            </div>

            <br />

            {/* LOADING */}

            {loading ? (
              <div className="rounded-3xl bg-white p-14 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-800" />

                <p className="mt-4 text-slate-600">
                  Loading products...
                </p>
              </div>
            ) : filteredProducts.length ===
              0 ? (
              <div className="rounded-3xl bg-white p-14 text-center">
                <h3 className="text-2xl font-semibold text-slate-800">
                  No products found
                </h3>

                <p className="mt-3 text-slate-500">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-lg bg-cyan-800 px-6 py-3 font-semibold text-white hover:bg-cyan-950"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* =================================================
                    PRODUCTS GRID
                ================================================= */}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map(
                    (item) => {
                      const price =
                        Number(
                          item.price || 0
                        );

                      const oldPrice =
                        Number(
                          item.oldPrice ||
                            0
                        );

                      const hasOldPrice =
                        oldPrice >
                        price;

                      const discount =
                        hasOldPrice
                          ? Math.round(
                              ((oldPrice -
                                price) /
                                oldPrice) *
                                100
                            )
                          : 0;

                      const isWishlisted =
                        wishlistIds.has(
                          Number(item.id)
                        );

                      return (
                        <Link
                          key={item.id}
                          to={`/product/${item.id}`}
                          className="block"
                        >
                          <div className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-md transition duration-300 hover:scale-[1.02] hover:shadow-xl">

                            {/* =================================================
                                IMAGE
                            ================================================= */}

                            <div className="relative">

                              <img
                                src={`${imageURL}/${item.image}`}
                                alt={
                                  item.title ||
                                  item.name ||
                                  "Product"
                                }
                                className="h-72 w-full object-cover sm:h-80"
                                onError={(e) => {
                                  e.currentTarget.style.display =
                                    "none";
                                }}
                              />

                              {/* DISCOUNT */}

                              {hasOldPrice && (
                                <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">
                                  {discount}% OFF
                                </span>
                              )}

                              {/* =================================================
                                  WISHLIST HEART
                              ================================================= */}

                              <button
                                type="button"
                                aria-label={
                                  isWishlisted
                                    ? "Remove from wishlist"
                                    : "Add to wishlist"
                                }
                                disabled={
                                  wishlistLoading
                                }
                                onClick={(event) =>
                                  toggleWishlist(
                                    event,
                                    item.id
                                  )
                                }
                                className="
                                  absolute
                                  right-3
                                  top-3
                                  flex
                                  h-12
                                  w-12
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-white
                                  shadow-md
                                  transition-all
                                  duration-200
                                  hover:scale-110
                                  disabled:cursor-not-allowed
                                  disabled:opacity-60
                                "
                              >
                                {isWishlisted ? (
                                  <FaHeart
                                    className="
                                      text-[25px]
                                      text-red-600
                                    "
                                  />
                                ) : (
                                  <FaRegHeart
                                    className="
                                      text-[26px]
                                      text-slate-600
                                    "
                                  />
                                )}
                              </button>
                            </div>

                            {/* =================================================
                                PRODUCT INFO
                            ================================================= */}

                            <div className="flex flex-1 flex-col p-4 text-center">

                              <p className="text-sm text-slate-500">
                                {item.category}
                              </p>

                              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                                {item.title ||
                                  item.name ||
                                  "Product"}
                              </h2>

                              {item.brand && (
                                <p className="mt-1 text-sm text-slate-500">
                                  {item.brand}
                                </p>
                              )}

                              {/* PRICE */}

                              <div className="mt-3 flex items-center justify-center gap-3">
                                <span className="text-lg font-bold text-slate-900">
                                  ₹{price}
                                </span>

                                {hasOldPrice && (
                                  <span className="text-slate-400 line-through">
                                    ₹{oldPrice}
                                  </span>
                                )}
                              </div>

                              {/* OFFER */}

                              {hasOldPrice && (
                                <p className="mt-2 font-semibold text-green-600">
                                  {item.offer ||
                                    `${discount}% OFF`}
                                </p>
                              )}

                              {/* RATING */}

                              {item.rating !==
                                undefined &&
                                item.rating !==
                                  null &&
                                item.rating !==
                                  "" && (
                                  <p className="mt-2 text-sm font-semibold text-yellow-600">
                                    ★{" "}
                                    {
                                      item.rating
                                    }
                                  </p>
                                )}
                            </div>
                          </div>
                        </Link>
                      );
                    }
                  )}
                </div>

                <br />
                <br />

                {/* =================================================
                    PAGINATION
                ================================================= */}

                {totalPages > 1 && (
                  <div className="mt-12">

                    <div className="flex flex-wrap items-center justify-center gap-2">

                      {/* PREVIOUS */}

                      <button
                        type="button"
                        disabled={
                          currentPage ===
                          1
                        }
                        onClick={() =>
                          onPageChange(
                            currentPage - 1
                          )
                        }
                        className={`rounded-lg px-4 py-2 font-semibold transition ${
                          currentPage === 1
                            ? "cursor-not-allowed bg-slate-300 text-slate-500"
                            : "bg-white text-cyan-800 hover:bg-cyan-100"
                        }`}
                      >
                        ← Previous
                      </button>

                      {/* PAGE NUMBERS */}

                      {getPageNumbers().map(
                        (
                          page,
                          index
                        ) => {
                          if (
                            typeof page ===
                            "string"
                          ) {
                            return (
                              <span
                                key={`${page}-${index}`}
                                className="px-2 py-2 font-bold text-white"
                              >
                                ...
                              </span>
                            );
                          }

                          return (
                            <button
                              type="button"
                              key={page}
                              onClick={() =>
                                onPageChange(
                                  page
                                )
                              }
                              className={`min-w-[42px] rounded-lg px-4 py-2 font-semibold transition ${
                                currentPage ===
                                page
                                  ? "bg-cyan-950 text-white shadow-lg"
                                  : "bg-white text-cyan-800 hover:bg-cyan-100"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }
                      )}

                      {/* NEXT */}

                      <button
                        type="button"
                        disabled={
                          currentPage ===
                          totalPages
                        }
                        onClick={() =>
                          onPageChange(
                            currentPage + 1
                          )
                        }
                        className={`rounded-lg px-4 py-2 font-semibold transition ${
                          currentPage ===
                          totalPages
                            ? "cursor-not-allowed bg-slate-300 text-slate-500"
                            : "bg-white text-cyan-800 hover:bg-cyan-100"
                        }`}
                      >
                        Next →
                      </button>
                    </div>

                    {/* PAGE INFO */}

                    <div className="pt-5 text-center text-white">
                      <p>
                        Page{" "}
                        <span className="font-bold">
                          {currentPage}
                        </span>{" "}
                        of{" "}
                        <span className="font-bold">
                          {totalPages}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-slate-200">
                        Showing{" "}
                        {totalProducts ===
                        0
                          ? 0
                          : firstProductIndex +
                            1}
                        -
                        {Math.min(
                          lastProductIndex,
                          totalProducts
                        )}{" "}
                        of{" "}
                        {totalProducts}{" "}
                        products
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductSection;
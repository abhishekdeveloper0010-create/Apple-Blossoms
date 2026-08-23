import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductSection from "./ProductSection";
import api from "../config/api";

function Shop() {
  // =====================================================
  // URL SEARCH PARAMS
  // =====================================================

  const [searchParams] = useSearchParams();

  const searchTerm = searchParams.get("search") || "";

  // =====================================================
  // PRODUCTS
  // =====================================================

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // =====================================================
  // CATEGORIES
  // =====================================================

  const [categories, setCategories] = useState([]);

  // =====================================================
  // SELECTED CATEGORY
  // =====================================================

  const [selectedCategory, setSelectedCategory] = useState("All");

  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] = useState(false);

  // =====================================================
  // ERROR
  // =====================================================

  const [error, setError] = useState("");

  // =====================================================
  // PRODUCTS PER PAGE
  // =====================================================

  const productsPerPage = 8;

  // =====================================================
  // CATEGORY IMAGE URL
  // =====================================================

  const categoryImageUrl =
    import.meta.env.VITE_SERVER_CATEGORY_IMAGE_URL ||
    "http://localhost:4000/category-images";

  // =====================================================
  // GET CATEGORIES
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const getCategories = async () => {
      try {
        const response = await api.get("/categories");

        console.log("Categories API Response:", response.data);

        let categoryData = [];

        // ---------------------------------------------
        // RESPONSE FORMAT 1
        // ---------------------------------------------

        if (Array.isArray(response.data?.data)) {
          categoryData = response.data.data;
        }

        // ---------------------------------------------
        // RESPONSE FORMAT 2
        // ---------------------------------------------
        else if (Array.isArray(response.data)) {
          categoryData = response.data;
        }

        // ---------------------------------------------
        // REMOVE DUPLICATES
        // ---------------------------------------------

        const uniqueCategories = [];
        const categoryIds = new Set();
        const categoryNames = new Set();

        categoryData.forEach((category) => {
          if (!category) return;

          const id = Number(category.id);

          const name = String(category.name || "").trim();

          if (!id || !name) {
            return;
          }

          // Ignore "All" from database
          if (name.toLowerCase() === "all") {
            return;
          }

          const nameKey = name.toLowerCase();

          // Remove duplicate ID
          if (categoryIds.has(id)) {
            return;
          }

          // Remove duplicate name
          if (categoryNames.has(nameKey)) {
            return;
          }

          categoryIds.add(id);
          categoryNames.add(nameKey);

          uniqueCategories.push({
            ...category,
            id,
            name,
          });
        });

        if (mounted) {
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error("Category API Error:", err);

        if (mounted) {
          setCategories([]);
        }
      }
    };

    getCategories();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // FIND SELECTED CATEGORY ID
  // =====================================================

  const selectedCategoryId = useMemo(() => {
    if (!selectedCategory || selectedCategory.toLowerCase() === "all") {
      return null;
    }

    const selected = categories.find(
      (category) =>
        String(category.name).trim().toLowerCase() ===
        String(selectedCategory).trim().toLowerCase(),
    );

    return selected ? Number(selected.id) : null;
  }, [categories, selectedCategory]);

  // =====================================================
  // GET PRODUCTS
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const getProducts = async () => {
      try {
        setLoading(true);
        setError("");

        // ---------------------------------------------
        // API PARAMS
        // ---------------------------------------------

        const params = {
          page: currentPage,
          limit: productsPerPage,
          search: searchTerm.trim(),
        };

        // ---------------------------------------------
        // IMPORTANT:
        // ONLY SEND category_id WHEN CATEGORY IS SELECTED
        // ---------------------------------------------

        if (selectedCategoryId !== null) {
          params.category_id = selectedCategoryId;
        }

        console.log("Getting products:", params);

        // ---------------------------------------------
        // API REQUEST
        // ---------------------------------------------

        const response = await api.get("/products", {
          params,
        });

        console.log("Products API Response:", response.data);

        if (!mounted) {
          return;
        }

        const data = response.data;

        // =================================================
        // PRODUCTS
        // =================================================

        let productList = [];

        if (Array.isArray(data?.data)) {
          productList = data.data;
        } else if (Array.isArray(data?.products)) {
          productList = data.products;
        } else if (Array.isArray(data)) {
          productList = data;
        }

        setProducts(productList);

        // =================================================
        // TOTAL PRODUCTS
        // =================================================

        const total = Number(
          data?.total ?? data?.totalProducts ?? data?.count ?? 0,
        );

        setTotalProducts(total);

        // =================================================
        // TOTAL PAGES
        // =================================================

        let pages = Number(data?.totalPages ?? data?.pages ?? 0);

        // ---------------------------------------------
        // If backend does not send totalPages,
        // calculate it from total
        // ---------------------------------------------

        if (!pages && total > 0) {
          pages = Math.ceil(total / productsPerPage);
        }

        if (!pages) {
          pages = 1;
        }

        setTotalPages(pages);

        // =================================================
        // CURRENT PAGE SAFETY
        // =================================================

        if (currentPage > pages) {
          setCurrentPage(pages);
        }
      } catch (err) {
        console.error("Product API Error:", err);

        if (!mounted) {
          return;
        }

        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);

        setError("Products load nahi ho pa rahe hain.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getProducts();

    return () => {
      mounted = false;
    };
  }, [currentPage, searchTerm, selectedCategoryId]);

  // =====================================================
  // CATEGORY CHANGE
  // =====================================================

  const handleCategoryChange = (category) => {
    const newCategory = category || "All";

    console.log("Category changed:", newCategory);

    setSelectedCategory(newCategory);

    // Category change => page 1
    setCurrentPage(1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // PAGE CHANGE
  // =====================================================

  const handlePageChange = (page) => {
    const nextPage = Number(page);

    if (!Number.isInteger(nextPage)) {
      return;
    }

    if (nextPage < 1) {
      return;
    }

    if (nextPage > totalPages) {
      return;
    }

    if (nextPage === currentPage) {
      return;
    }

    console.log("Page changed:", nextPage);

    setCurrentPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // CATEGORY FILTERS
  // =====================================================

  const categoryFilters = [
    "All",
    ...categories.map((category) => category.name),
  ];

  // =====================================================
  // REMOVE DUPLICATES
  // =====================================================

  const uniqueCategoryFilters = [
    ...new Map(
      categoryFilters.map((category) => [category.toLowerCase(), category]),
    ).values(),
  ];

  // =====================================================
  // RETRY
  // =====================================================

  const handleRetry = () => {
    setError("");

    // Force API reload by going page 1
    setCurrentPage(1);
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <section className="w-full bg-[#d9f0fb] py-6 sm:py-8 lg:py-10">
      {/* =================================================
          MAIN CONTAINER
      ================================================= */}

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        {/* =================================================
            CATEGORY CARDS
        ================================================= */}

        {categories.length > 0 && (
          <div
            className="
              grid w-full
              grid-cols-1
              gap-5
              sm:grid-cols-2
              sm:gap-6
              md:grid-cols-3
              md:gap-7
              lg:grid-cols-6
              lg:gap-6
              xl:grid-cols-6
              xl:gap-8
              2xl:grid-cols-6
              2xl:gap-12
            "
          >
            {categories.map((item) => {
              const imageUrl = item.image
                ? `${categoryImageUrl}/${item.image}`
                : "";

              const isSelected =
                selectedCategory.toLowerCase() ===
                String(item.name).trim().toLowerCase();

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleCategoryChange(item.name)}
                  className={`
                    flex w-full flex-col items-center
                    rounded-3xl border p-4
                    text-center transition duration-300

                    ${
                      isSelected
                        ? "border-sky-500 bg-sky-100 shadow-lg"
                        : "border-transparent bg-white hover:border-sky-200 hover:shadow-md"
                    }
                  `}
                >
                  {/* IMAGE */}

                  <div
                    className="
                      flex w-full items-center justify-center
                      overflow-hidden bg-[#006b91] shadow-md
                      h-[140px]
                      rounded-[45px_15px_45px_15px]

                      sm:h-[155px]
                      md:h-[170px]
                      lg:h-[175px]
                      lg:rounded-[55px_20px_55px_20px]
                      xl:h-[190px]
                      2xl:h-[220px]
                    "
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="
                          h-auto w-auto max-w-[80%]
                          object-contain
                          max-h-[110px]
                          sm:max-h-[120px]
                          md:max-h-[135px]
                          lg:max-h-[140px]
                          xl:max-h-[150px]
                          2xl:max-h-[175px]
                        "
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-4xl text-white">🛍️</span>
                    )}
                  </div>

                  {/* CATEGORY NAME */}

                  <h2
                    className="
                      pt-3 font-bold text-[#0c4a6e]
                      text-xl
                      sm:text-2xl
                      md:text-[26px]
                      lg:text-[26px]
                      xl:text-[28px]
                      2xl:text-[30px]
                    "
                    style={{
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {item.name} 
                  </h2>

                  {/* CATEGORY ID - OPTIONAL DEBUG */}

                  {/* 
                  <span className="text-xs text-slate-500">
                    ID: {item.id}
                  </span>
                  */}
                </button>
              );
            })}
          </div>
        )}

        {/* =================================================
            CATEGORY FILTER BUTTONS
        ================================================= */}

        <div
          className="
            flex w-full
            flex-wrap
            justify-center
            gap-3
            pt-10
            pb-8
          "
        >
          {uniqueCategoryFilters.map((category) => {
            const isSelected =
              selectedCategory.toLowerCase() ===
              String(category).trim().toLowerCase();

            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`
                    rounded-full
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    transition
                    duration-300

                    ${
                      isSelected
                        ? "bg-sky-700 text-white shadow-md"
                        : "bg-sky-100 text-slate-700 hover:bg-sky-200"
                    }
                  `}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================
          PRODUCTS
      ================================================= */}

      <div className="mt-8 w-full">
        {/* =================================================
            ERROR
        ================================================= */}

        {error ? (
          <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center">
            <p className="font-semibold text-red-600">{error}</p>

            <button
              type="button"
              onClick={handleRetry}
              className="
                mt-5
                rounded-lg
                bg-cyan-800
                px-6
                py-3
                font-semibold
                text-white
                hover:bg-cyan-950
              "
            >
              Try Again
            </button>
          </div>
        ) : (
          <ProductSection
            products={products}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            searchTerm={searchTerm}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalProducts={totalProducts}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </section>
  );
}

export default Shop;

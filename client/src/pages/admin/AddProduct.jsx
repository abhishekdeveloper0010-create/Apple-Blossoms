 
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_SERVER_API_URL ||
  "http://localhost:4000/api";

// =====================================================
// CATEGORY WISE SIZES
// =====================================================

const CATEGORY_SIZES = {
  Shirts: ["S", "M", "L", "XL", "XXL"],
  Dresses: ["S", "M", "L", "XL", "XXL"],
  Bangles: ["2-2", "2-4", "2-6", "2-8"],
  Shoes: ["6", "7", "8", "9"],
  Slippers: ["6", "7", "8", "9"],
  Beauty: ["No Size"],
};

function AddProduct() {
  const navigate = useNavigate();

  // =====================================================
  // FORM
  // =====================================================

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    old_price: "",
    offer: "",
    category: "",
    size: "",
    stock: "",
  });

  // =====================================================
  // IMAGE
  // =====================================================

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // =====================================================
  // STATUS
  // =====================================================

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // =====================================================
  // AVAILABLE SIZES
  // =====================================================

  const availableSizes =
    CATEGORY_SIZES[form.category] || [];

  // =====================================================
  // AUTOMATIC DISCOUNT
  // =====================================================

  const discount = useMemo(() => {
    const oldPrice = Number(form.old_price);
    const currentPrice = Number(form.price);

    if (
      !oldPrice ||
      !currentPrice ||
      oldPrice <= 0 ||
      currentPrice <= 0 ||
      currentPrice >= oldPrice
    ) {
      return 0;
    }

    return Math.round(
      ((oldPrice - currentPrice) / oldPrice) * 100
    );
  }, [form.old_price, form.price]);

  // =====================================================
  // AUTO OFFER TEXT
  // =====================================================

  const offerText =
    discount > 0 ? `${discount}% OFF` : "";

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
  };

  // =====================================================
  // CATEGORY CHANGE
  // =====================================================

  const handleCategoryChange = (e) => {
    const category = e.target.value;

    const sizes = CATEGORY_SIZES[category] || [];

    setForm((prev) => ({
      ...prev,
      category,
      size:
        sizes.length > 0
          ? ""
          : "",
    }));

    setMessage("");
  };

  // =====================================================
  // SIZE SELECT
  // =====================================================

  const handleSizeClick = (size) => {
    setForm((prev) => {
      const currentSizes = prev.size
        ? prev.size
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      if (currentSizes.includes(size)) {
        const newSizes = currentSizes.filter(
          (item) => item !== size
        );

        return {
          ...prev,
          size: newSizes.join(", "),
        };
      }

      return {
        ...prev,
        size: [...currentSizes, size].join(", "),
      };
    });

    setMessage("");
  };

  // =====================================================
  // SELECT ALL SIZES
  // =====================================================

  const selectAllSizes = () => {
    setForm((prev) => ({
      ...prev,
      size: availableSizes.join(", "),
    }));
  };

  // =====================================================
  // CLEAR SIZES
  // =====================================================

  const clearSizes = () => {
    setForm((prev) => ({
      ...prev,
      size: "",
    }));
  };

  // =====================================================
  // CHECK SIZE SELECTED
  // =====================================================

  const isSizeSelected = (size) => {
    if (!form.size) return false;

    return form.size
      .split(",")
      .map((item) => item.trim())
      .includes(size);
  };

  // =====================================================
  // IMAGE CHANGE
  // =====================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    // 5MB validation
    if (file.size > 5 * 1024 * 1024) {
      setMessage(
        "Image size must be less than 5MB."
      );

      e.target.value = "";
      return;
    }

    setImageFile(file);

    const previewURL = URL.createObjectURL(file);

    setImagePreview(previewURL);

    setMessage("");
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!imageFile) {
      setMessage(
        "Please select a product image."
      );
      return;
    }

    if (!form.name.trim()) {
      setMessage(
        "Please enter product name."
      );
      return;
    }

    if (!form.category) {
      setMessage(
        "Please select a category."
      );
      return;
    }

    if (!form.price) {
      setMessage(
        "Please enter current price."
      );
      return;
    }

    if (
      form.old_price &&
      Number(form.price) >=
        Number(form.old_price)
    ) {
      setMessage(
        "Current price must be less than old price."
      );
      return;
    }

    if (!form.stock) {
      setMessage(
        "Please enter stock."
      );
      return;
    }

    // Beauty = No Size automatically
    if (
      form.category === "Beauty" &&
      !form.size
    ) {
      setForm((prev) => ({
        ...prev,
        size: "No Size",
      }));
    }

    // Other categories need size
    if (
      form.category !== "Beauty" &&
      availableSizes.length > 0 &&
      !form.size
    ) {
      setMessage(
        "Please select at least one size."
      );
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      // Current price
      formData.append(
        "price",
        form.price
      );

      // Old price
      formData.append(
        "old_price",
        form.old_price || ""
      );

      // AUTOMATIC OFFER
      formData.append(
        "offer",
        offerText
      );

      // Category
      formData.append(
        "category",
        form.category
      );

      // Sizes
      formData.append(
        "size",
        form.category === "Beauty"
          ? "No Size"
          : form.size
      );

      // Stock
      formData.append(
        "stock",
        form.stock
      );

      // Image
      formData.append(
        "image",
        imageFile
      );

      // -------------------------------------------------
      // API REQUEST
      // -------------------------------------------------

      const response = await fetch(
        `${API_URL}/products`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("token") || ""
            }`,
          },

          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create product"
        );
      }

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      setMessage(
        "Product added successfully!"
      );

      setForm({
        name: "",
        description: "",
        price: "",
        old_price: "",
        offer: "",
        category: "",
        size: "",
        stock: "",
      });

      setImageFile(null);
      setImagePreview("");

      const imageInput =
        document.getElementById(
          "product-image"
        );

      if (imageInput) {
        imageInput.value = "";
      }
    } catch (error) {
      console.error(
        "Add Product Error:",
        error
      );

      setMessage(
        error.message ||
          "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleCancel = () => {
    navigate("/admin");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen w-full bg-slate-50 px-3 py-5 sm:px-5 sm:py-6 md:px-7 lg:px-10 xl:px-12 2xl:px-16">

      <div className="w-full">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-5 sm:mb-6">

          <button
            type="button"
            onClick={handleCancel}
            className="
              mb-3
              inline-flex
              items-center
              rounded-lg
              px-2
              py-2
              text-sm
              font-semibold
              text-cyan-700
              transition
              hover:bg-cyan-50
              hover:text-cyan-800
            "
          >
            ← Back to Admin
          </button>

          <h1
            className="
              text-2xl
              font-bold
              leading-tight
              text-slate-900
              sm:text-3xl
              lg:text-4xl
            "
          >
            Add New Product
          </h1>

          <p
            className="
              mt-1
              max-w-2xl
              text-sm
              text-slate-500
              sm:text-base
            "
          >
            Add a new product to Apple Blossom.
          </p>

        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div
            className={`
              mb-5
              w-full
              rounded-xl
              border
              p-3
              text-sm
              font-medium
              sm:p-4
              sm:text-base
              ${
                message
                  .toLowerCase()
                  .includes("success")
                  ? "border-green-100 bg-green-50 text-green-700"
                  : "border-red-100 bg-red-50 text-red-700"
              }
            `}
          >
            {message}
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="
            w-full
            rounded-2xl
            bg-white
            p-4
            shadow-sm
            ring-1
            ring-slate-100
            sm:p-6
            md:p-8
            lg:p-10
          "
        >

          {/* =================================================
              BASIC PRODUCT INFO
          ================================================= */}

          <div className="mb-8">

            <h2
              className="
                mb-4
                text-lg
                font-bold
                text-slate-900
                sm:text-xl
              "
            >
              Product Information
            </h2>

            <div
              className="
                grid
                grid-cols-1
                gap-5
                md:grid-cols-2
                xl:grid-cols-3
              "
            >

              {/* =================================================
                  PRODUCT NAME
              ================================================= */}

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-600
                "
              >
                Product Name

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Classic Cotton Shirt"
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    p-3
                    text-sm
                    font-normal
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-cyan-500
                    focus:ring-2
                    focus:ring-cyan-100
                    sm:p-3.5
                  "
                />
              </label>

              {/* =================================================
                  CATEGORY
              ================================================= */}

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-600
                "
              >
                Category

                <select
                  name="category"
                  value={form.category}
                  onChange={handleCategoryChange}
                  required
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    p-3
                    text-sm
                    font-normal
                    text-slate-900
                    outline-none
                    transition
                    focus:border-cyan-500
                    focus:ring-2
                    focus:ring-cyan-100
                    sm:p-3.5
                  "
                >
                  <option value="">
                    Select Category
                  </option>

                  <option value="Shirts">
                    Shirts
                  </option>

                  <option value="Dresses">
                    Dresses
                  </option>

                  <option value="Bangles">
                    Bangles
                  </option>

                  <option value="Shoes">
                    Shoes
                  </option>

                  <option value="Slippers">
                    Slippers
                  </option>

                  <option value="Beauty">
                    Beauty
                  </option>
                </select>
              </label>

              {/* =================================================
                  STOCK
              ================================================= */}

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-600
                "
              >
                Stock

                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  required
                  placeholder="20"
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    p-3
                    text-sm
                    font-normal
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-cyan-500
                    focus:ring-2
                    focus:ring-cyan-100
                    sm:p-3.5
                  "
                />
              </label>

              {/* =================================================
                  CURRENT PRICE
              ================================================= */}

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-600
                "
              >
                Current Price

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="999"
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    p-3
                    text-sm
                    font-normal
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-cyan-500
                    focus:ring-2
                    focus:ring-cyan-100
                    sm:p-3.5
                  "
                />
              </label>

              {/* =================================================
                  OLD PRICE
              ================================================= */}

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-600
                "
              >
                Old Price

                <input
                  type="number"
                  name="old_price"
                  value={form.old_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="1299"
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    p-3
                    text-sm
                    font-normal
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-cyan-500
                    focus:ring-2
                    focus:ring-cyan-100
                    sm:p-3.5
                  "
                />
              </label>

              {/* =================================================
                  AUTOMATIC OFFER
              ================================================= */}

              <div
                className="
                  rounded-xl
                  border
                  border-green-200
                  bg-green-50
                  p-4
                "
              >
                <p className="text-sm font-semibold text-slate-600">
                  Automatic Offer
                </p>

                <div className="mt-2 flex items-center justify-between gap-3">

                  <span className="text-sm text-slate-500">
                    Discount
                  </span>

                  <span
                    className="
                      rounded-full
                      bg-green-600
                      px-4
                      py-1.5
                      text-sm
                      font-bold
                      text-white
                    "
                  >
                    {discount > 0
                      ? `${discount}% OFF`
                      : "0% OFF"}
                  </span>

                </div>

                {discount > 0 && (
                  <p className="mt-2 text-xs text-green-700">
                    Customer saves ₹
                    {(
                      Number(form.old_price) -
                      Number(form.price)
                    ).toFixed(2)}
                  </p>
                )}

              </div>

              {/* =================================================
                  SIZE SECTION
              ================================================= */}

              <div
                className="
                  md:col-span-2
                  xl:col-span-3
                "
              >

                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">

                  <div>

                    <p className="text-sm font-semibold text-slate-600">
                      Sizes
                    </p>

                    {form.category && (
                      <p className="mt-1 text-xs text-slate-400">
                        {form.category === "Beauty"
                          ? "Beauty products do not require size."
                          : "Select one or more sizes."}
                      </p>
                    )}

                  </div>

                  {availableSizes.length > 0 &&
                    form.category !== "Beauty" && (
                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={selectAllSizes}
                          className="
                            rounded-lg
                            bg-cyan-50
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-cyan-700
                            hover:bg-cyan-100
                          "
                        >
                          Select All
                        </button>

                        <button
                          type="button"
                          onClick={clearSizes}
                          className="
                            rounded-lg
                            bg-slate-100
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-slate-600
                            hover:bg-slate-200
                          "
                        >
                          Clear
                        </button>

                      </div>
                    )}

                </div>

                {form.category ? (

                  form.category === "Beauty" ? (

                    <div
                      className="
                        rounded-xl
                        border
                        border-cyan-200
                        bg-cyan-50
                        p-4
                        text-sm
                        font-semibold
                        text-cyan-700
                      "
                    >
                      No Size
                    </div>

                  ) : (

                    <div className="flex flex-wrap gap-3">

                      {availableSizes.map(
                        (size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() =>
                              handleSizeClick(
                                size
                              )
                            }
                            className={`
                              rounded-xl
                              border
                              px-5
                              py-3
                              text-sm
                              font-bold
                              transition
                              ${
                                isSizeSelected(
                                  size
                                )
                                  ? "border-cyan-700 bg-cyan-700 text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-cyan-400 hover:bg-cyan-50"
                              }
                            `}
                          >
                            {size}
                          </button>
                        )
                      )}

                    </div>

                  )

                ) : (

                  <div
                    className="
                      rounded-xl
                      border
                      border-dashed
                      border-slate-200
                      bg-slate-50
                      p-4
                      text-sm
                      text-slate-400
                    "
                  >
                    Select a category to see available sizes.
                  </div>

                )}

                {form.size && (
                  <p className="mt-3 text-sm text-slate-500">
                    Selected:{" "}
                    <span className="font-semibold text-cyan-700">
                      {form.size}
                    </span>
                  </p>
                )}

              </div>

              {/* =================================================
                  IMAGE
              ================================================= */}

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-600
                  md:col-span-2
                  xl:col-span-2
                "
              >
                Product Image

                <input
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  required
                  className="
                    mt-2
                    block
                    w-full
                    cursor-pointer
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    p-2
                    text-sm
                    font-normal
                    text-slate-600
                    file:mr-3
                    file:rounded-lg
                    file:border-0
                    file:bg-cyan-50
                    file:px-3
                    file:py-2
                    file:text-sm
                    file:font-semibold
                    file:text-cyan-700
                    hover:file:bg-cyan-100
                    sm:p-2.5
                  "
                />

                <span className="pt-2 block text-xs text-slate-400">
                  JPG, PNG, WEBP — Maximum 5MB
                </span>
              </label>

              {/* =================================================
                  IMAGE PREVIEW
              ================================================= */}

              {imagePreview && (
                <div className="flex items-center justify-center">

                  <div
                    className="
                      h-44
                      w-44
                      overflow-hidden
                      rounded-2xl
                      border
                      border-slate-200
                      bg-slate-50
                    "
                  >
                    <img
                      src={imagePreview}
                      alt="Product Preview"
                      className="
                        h-full
                        w-full
                        object-contain
                      "
                    />
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* =================================================
              DESCRIPTION
          ================================================= */}
<br/>
          <div className="mb-8">

            <h2
              className="
                mb-4
                text-lg
                font-bold
                text-slate-900
                sm:text-xl
              "
            >
              Product Description
            </h2>

            <label
              className="
                block
                text-sm
                font-semibold
                text-slate-600
              "
            >
              Description

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="6"
                placeholder="Write a detailed product description..."
                className="
                  mt-2
                  min-h-[140px]
                  w-full
                  resize-y
                  rounded-xl
                  border
                  border-slate-200
                  p-3
                  text-sm
                  font-normal
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-cyan-500
                  focus:ring-2
                  focus:ring-cyan-100
                  sm:p-4
                "
              />

            </label>

          </div>

          {/* =================================================
              PRICE PREVIEW
          ================================================= */}

          {(form.price || form.old_price) && (
            <div
              className="
                mb-8
                rounded-2xl
                border
                border-slate-100
                bg-slate-50
                p-5
              "
            >

              <p className="mb-3 text-sm font-semibold text-slate-500">
                Price Preview
              </p>

              <div className="flex flex-wrap items-center gap-3">

                {form.price && (
                  <span className="text-2xl font-bold text-slate-900">
                    ₹{form.price}
                  </span>
                )}

                {form.old_price && (
                  <span className="text-lg text-slate-400 line-through">
                    ₹{form.old_price}
                  </span>
                )}

                {discount > 0 && (
                  <span
                    className="
                      rounded-full
                      bg-green-600
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

            </div>
          )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div
            className="
              flex
              w-full
              flex-col
              gap-3
              border-t
              border-slate-100
              pt-6
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <button
              type="button"
              onClick={handleCancel}
              className="
                order-2
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-6
                py-3
                text-sm
                font-semibold
                text-slate-700
                transition
                hover:bg-slate-50
                sm:order-1
                sm:w-auto
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                order-1
                w-full
                rounded-xl
                bg-cyan-700
                px-7
                py-3
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-cyan-800
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:order-2
                sm:w-auto
                sm:min-w-[180px]
              "
            >
              {saving
                ? "Adding Product..."
                : "Add Product"}
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}

export default AddProduct;
 

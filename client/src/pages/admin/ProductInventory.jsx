import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_SERVER_API_URL ||
  "http://localhost:4000/api";

const IMAGE_URL =
  import.meta.env.VITE_SERVER_IMAGES_URL ||
  "http://localhost:4000/images";

function ProductInventory() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token") || "";

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/products?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load products"
        );
      }

      setProducts(data.data || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete product"
        );
      }

      setMessage("Product deleted successfully.");

      loadProducts();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="min-h-screen w-full bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 md:px-7 lg:px-10 xl:px-12 2xl:px-16">
      <div className="w-full">

        {/* ================= HEADER ================= */}
        <div className="mb-5 sm:mb-6">

          {/* Back Button */}
          <button
            onClick={() => navigate("/admin")}
            className="mb-4 inline-flex items-center text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
          >
            ← Back to Admin
          </button>

          {/* Title + Add Button */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
                Product Inventory
              </h1>

              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Manage all Apple Blossom products.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/admin/products/add")
              }
              className="w-full rounded-lg bg-cyan-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-800 sm:w-auto sm:shrink-0 sm:text-base"
            >
              + Add Product
            </button>

          </div>
        </div>

        {/* ================= MESSAGE ================= */}
        {message && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-800 sm:text-base">
            <span>{message}</span>

            <button
              onClick={() => setMessage("")}
              className="font-bold text-cyan-700 hover:text-cyan-900"
            >
              ×
            </button>
          </div>
        )}

        {/* ================= LOADING ================= */}
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-700" />

            <p className="text-sm text-slate-500 sm:text-base">
              Loading products...
            </p>
          </div>
        ) : products.length === 0 ? (
          /* ================= EMPTY ================= */
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm sm:p-12">

            <div className="mb-3 text-4xl">
              📦
            </div>

            <h2 className="text-lg font-bold text-slate-800">
              No products found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add your first product to the inventory.
            </p>

            <button
              onClick={() =>
                navigate("/admin/products/add")
              }
              className="mt-5 rounded-lg bg-cyan-700 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-800"
            >
              + Add Product
            </button>

          </div>
        ) : (
          <>
            {/* =====================================================
                MOBILE / TABLET CARD VIEW
                Visible below lg
            ====================================================== */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">

              {products.map((product) => (
                <div
                  key={product.id}
                  className="w-full overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
                >

                  {/* Product Top */}
                  <div className="flex gap-4">

                    {/* Image */}
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24">
                      {product.image ? (
                        <img
                          src={`${IMAGE_URL}/${product.image}`}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <div className="min-w-0 flex-1">
                      <h2 className="break-words text-base font-bold text-slate-900 sm:text-lg">
                        {product.name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {product.category || "No category"}
                      </p>

                      <p className="mt-2 text-lg font-bold text-cyan-700">
                        ₹{product.price}
                      </p>
                    </div>

                  </div>

                  {/* Product Details */}
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">

                    {/* Stock */}
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">
                        Stock
                      </p>

                      <p
                        className={`mt-1 text-sm font-bold ${
                          Number(product.stock) <= 5
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {product.stock}
                      </p>
                    </div>

                    {/* Offer */}
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">
                        Offer
                      </p>

                      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                        {product.offer || "-"}
                      </p>
                    </div>

                    {/* Category */}
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">
                        Category
                      </p>

                      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                        {product.category || "-"}
                      </p>
                    </div>

                    {/* Old Price */}
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">
                        Old Price
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {product.oldPrice
                          ? `₹${product.oldPrice}`
                          : "-"}
                      </p>
                    </div>

                  </div>

                  {/* Action */}
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <button
                      onClick={() =>
                        deleteProduct(product.id)
                      }
                      className="w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
                    >
                      Delete Product
                    </button>
                  </div>

                </div>
              ))}

            </div>

            {/* =====================================================
                DESKTOP / LARGE SCREEN TABLE
                Visible from lg
            ====================================================== */}
            <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm lg:block">

              <div className="w-full overflow-x-auto">

                <table className="w-full min-w-[900px] text-left">

                  <thead className="border-b bg-slate-50">
                    <tr>

                      <th className="whitespace-nowrap p-4 text-sm font-bold text-slate-700 xl:p-5">
                        Image
                      </th>

                      <th className="whitespace-nowrap p-4 text-sm font-bold text-slate-700 xl:p-5">
                        Product
                      </th>

                      <th className="whitespace-nowrap p-4 text-sm font-bold text-slate-700 xl:p-5">
                        Category
                      </th>

                      <th className="whitespace-nowrap p-4 text-sm font-bold text-slate-700 xl:p-5">
                        Price
                      </th>

                      <th className="whitespace-nowrap p-4 text-sm font-bold text-slate-700 xl:p-5">
                        Stock
                      </th>

                      <th className="whitespace-nowrap p-4 text-sm font-bold text-slate-700 xl:p-5">
                        Offer
                      </th>

                      <th className="whitespace-nowrap p-4 text-sm font-bold text-slate-700 xl:p-5">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b transition hover:bg-slate-50 last:border-0"
                      >

                        {/* Image */}
                        <td className="p-4 xl:p-5">
                          {product.image ? (
                            <img
                              src={`${IMAGE_URL}/${product.image}`}
                              alt={product.name}
                              className="h-16 w-16 rounded-xl object-cover xl:h-20 xl:w-20"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400 xl:h-20 xl:w-20">
                              No Image
                            </div>
                          )}
                        </td>

                        {/* Product */}
                        <td className="max-w-[280px] p-4 xl:p-5">
                          <p className="break-words font-semibold text-slate-900">
                            {product.name}
                          </p>

                          {product.oldPrice && (
                            <p className="mt-1 text-xs text-slate-400 line-through">
                              ₹{product.oldPrice}
                            </p>
                          )}
                        </td>

                        {/* Category */}
                        <td className="p-4 text-sm text-slate-600 xl:p-5">
                          {product.category || "-"}
                        </td>

                        {/* Price */}
                        <td className="p-4 font-semibold text-cyan-700 xl:p-5">
                          ₹{product.price}
                        </td>

                        {/* Stock */}
                        <td className="p-4 xl:p-5">
                          <span
                            className={`font-bold ${
                              Number(product.stock) <= 5
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {product.stock}
                          </span>

                          {Number(product.stock) <= 5 && (
                            <span className="ml-2 rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
                              Low
                            </span>
                          )}
                        </td>

                        {/* Offer */}
                        <td className="max-w-[180px] p-4 text-sm text-slate-600 xl:p-5">
                          {product.offer || "-"}
                        </td>

                        {/* Action */}
                        <td className="p-4 xl:p-5">
                          <button
                            onClick={() =>
                              deleteProduct(product.id)
                            }
                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            </div>
          </>
        )}

      </div>
    </main>
  );
}

export default ProductInventory;
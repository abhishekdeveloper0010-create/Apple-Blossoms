import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// =====================================================
// STEP 5 : IMAGE MANAGEMENT (Feature 6)
// GET    /api/admin/images
// DELETE /api/admin/images/:folder/:file  (sirf unused)
// =====================================================

function ImageManagement() {
  const navigate = useNavigate();
  const API_URL =
    import.meta.env.VITE_SERVER_API_URL || "http://localhost:4000/api";
  const PRODUCT_IMAGE_URL =
    import.meta.env.VITE_SERVER_IMAGES_URL || "http://localhost:4000/images";
  const CATEGORY_IMAGE_URL =
    import.meta.env.VITE_SERVER_CATEGORY_IMAGE_URL ||
    "http://localhost:4000/category-images";

  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("products");

  const token = localStorage.getItem("token") || "";

  const loadImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/images`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setImages(data);
      else setMessage(data.message || "Failed to load");
    } catch (err) {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleDelete = async (folder, file) => {
    if (!confirm(`Delete image "${file}"?`)) return;
    try {
      const response = await fetch(
        `${API_URL}/admin/images/${folder}/${encodeURIComponent(file)}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      if (data.success) {
        setMessage("Image deleted!");
        loadImages();
      } else {
        setMessage(data.message || "Failed");
      }
    } catch (err) {
      setMessage("Error deleting");
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const currentList = images
    ? tab === "products"
      ? images.products
      : images.categories
    : [];
  const baseUrl = tab === "products" ? PRODUCT_IMAGE_URL : CATEGORY_IMAGE_URL;

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-10 xl:px-12">
      <div className="w-full">
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="mb-2 inline-flex items-center text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900">
            Image Management
          </h1>
          <p className="mt-1 text-slate-500">
            Uploaded images dekho aur unused images delete karo
          </p>
        </div>
        <br />
        {message && (
          <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-blue-700">
            {message}
          </div>
        )}

        {/* TABS */}
        <div className="mb-6 flex rounded-xl bg-white shadow-sm sm:w-fit">
          {[
            ["products", `Product Images (${images?.products.length || 0})`],
            [
              "categories",
              `Category Images (${images?.categories.length || 0})`,
            ],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTab(val)}
              className={`px-5 py-3 text-sm font-semibold rounded-xl ${tab === val ? "bg-cyan-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <br />
        {loading ? (
          <p className="text-slate-500">Loading images...</p>
        ) : currentList.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center">
            <p className="text-slate-500">No images uploaded yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {currentList.map((img) => (
              <div
                key={img.file}
                className="rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex h-28 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                  <img
                    src={`${baseUrl}/${img.file}`}
                    alt={img.file}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <p
                  className="truncate text-xs font-medium text-slate-700"
                  title={img.file}
                >
                  {img.file}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatSize(img.size)}
                </p>
                {img.used_by ? (
                  <p
                    className="mt-2 truncate rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700"
                    title={img.used_by}
                  >
                    In use: {img.used_by}
                  </p>
                ) : (
                  <p className="mt-2 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                    Unused
                  </p>
                )}
                <button
                  onClick={() => handleDelete(tab, img.file)}
                  disabled={Boolean(img.used_by)}
                  className={`mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold ${img.used_by ? "cursor-not-allowed bg-slate-100 text-slate-400" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
                  title={
                    img.used_by
                      ? "In-use image delete nahi ho sakti"
                      : "Delete unused image"
                  }
                >
                  {img.used_by ? "In Use" : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default ImageManagement;

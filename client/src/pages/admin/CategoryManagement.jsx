import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// =====================================================
// STEP 5 : CATEGORY MANAGEMENT (Feature 5)
// GET    /api/categories       (public)
// POST   /api/categories       (admin, multipart)
// PUT    /api/categories/:id   (admin, multipart)
// DELETE /api/categories/:id   (admin)
// =====================================================

function CategoryManagement() {
  const navigate = useNavigate();
  const API_URL =
    import.meta.env.VITE_SERVER_API_URL ||
    "http://localhost:4000/api";
  const CATEGORY_IMAGE_URL =
    import.meta.env.VITE_SERVER_CATEGORY_IMAGE_URL ||
    "http://localhost:4000/category-images";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token") || "";
  const headers = (json = false) => ({
    ...(json ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      if (data.success) setCategories(data.categories);
      else setMessage(data.message || "Failed to load");
    } catch (err) {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setImageFile(null);
  };

  const openEdit = (cat) => {
    setShowForm(true);
    setEditingId(cat.id);
    setName(cat.name);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (imageFile) formData.append("image", imageFile);

      const url = editingId
        ? `${API_URL}/categories/${editingId}`
        : `${API_URL}/categories`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage(editingId ? "Category updated!" : "Category created!");
        resetForm();
        loadCategories();
      } else {
        setMessage(data.message || "Failed");
      }
    } catch (err) {
      setMessage("Error saving category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (!confirm(`Delete category "${catName}"? Products unaffected rahenge.`)) return;
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        headers: headers(),
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Category deleted!");
        loadCategories();
      } else {
        setMessage(data.message || "Failed");
      }
    } catch (err) {
      setMessage("Error deleting");
    }
  };

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:px-10 xl:px-12">
      <div className="w-full">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button onClick={() => navigate("/admin")} className="mb-2 inline-flex items-center text-sm font-semibold text-cyan-700 transition hover:text-cyan-900">← Back to Dashboard</button>
            <h1 className="text-3xl font-bold text-slate-900">Category Management</h1>
            <p className="mt-1 text-slate-500">Categories create, edit aur delete </p>
          </div>
          <br/>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white hover:bg-cyan-800">+ Add Category</button>
        </div>

        {message && <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700">{message}</div>}
<br/>
        {/* FORM */}
        {showForm && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">{editingId ? "Edit Category" : "Add New Category"}</h2>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Category Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="e.g., Bangles" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Image {editingId ? "(optional - blank = old image)" : "*"}
                </label>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImageFile(e.target.files[0] || null)} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" required={!editingId} />
              </div>
              <div className="flex items-end gap-3">
                <button type="submit" disabled={saving} className="rounded-lg bg-cyan-700 px-6 py-2.5 font-semibold text-white hover:bg-cyan-800 disabled:opacity-50">{saving ? "Saving..." : editingId ? "Update" : "Create"}</button>
                <button type="button" onClick={resetForm} className="rounded-lg border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          </div>
        )}
<br/>
        {/* CATEGORY GRID */}
        {loading ? (
          <p className="text-slate-500">Loading categories...</p>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center"><p className="text-slate-500">No categories yet.</p></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat) => (
              <div key={cat.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                  <img src={`${CATEGORY_IMAGE_URL}/${cat.image}`} alt={cat.name} className="h-full w-full object-contain" onError={(e) => { e.target.style.display = "none"; }} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{cat.name}</h3>
                <p className="text-xs text-slate-400">ID: {cat.id} · {cat.image}</p>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => openEdit(cat)} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">Edit</button>
                  <button onClick={() => handleDelete(cat.id, cat.name)} className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default CategoryManagement;

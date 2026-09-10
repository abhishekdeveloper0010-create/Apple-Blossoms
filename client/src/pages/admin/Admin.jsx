import { useNavigate } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">

      <div className="mx-auto max-w-6xl">

        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Apple Blossom
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your store from one place.
          </p>
        </div>
<br/>
        <div className="grid gap-6 md:grid-cols-3">

          {/* ADD PRODUCT */}

          <button
            onClick={() =>
              navigate("/admin/products/add")
            }
            className="rounded-2xl bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-5 text-4xl">
              ➕
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Add New Product
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add products, prices, stock,
              offers and product images.
            </p>

            <span className="mt-5 inline-block font-semibold text-cyan-700">
              Add Product →
            </span>
          </button>

          {/* INVENTORY */}

          <button
            onClick={() =>
              navigate("/admin/products")
            }
            className="rounded-2xl bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-5 text-4xl">
              📦
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Product Inventory
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              View products, stock, prices,
              offers and delete products.
            </p>

            <span className="mt-5 inline-block font-semibold text-cyan-700">
              Manage Products →
            </span>
          </button>

          {/* ORDERS */}

          <button
            onClick={() =>
              navigate("/admin/orders")
            }
            className="rounded-2xl bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-5 text-4xl">
              🛒
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Order Management
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              View customer orders, payments
              and update order status.
            </p>

            <span className="mt-5 inline-block font-semibold text-cyan-700">
              Manage Orders →
            </span>
          </button>

        </div>

      </div>

    </main>
  );
}

export default Admin;
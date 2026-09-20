 
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_SERVER_API_URL ||
  "http://localhost:4000/api";

const orderStatuses = [
  "Order Placed",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

function OrderManagement() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token") || "";

  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/orders/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load orders"
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(
        `${API_URL}/orders/admin/${orderId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update order"
        );
      }

      setMessage(
        "Order status updated successfully."
      );

      loadOrders();
    } catch (error) {
      setMessage(error.message);
    }
  };

  // =====================================================
  // STEP 4 : INVOICE (view / print / email)
  // =====================================================

  const openInvoice = async (orderId) => {
    try {
      const response = await fetch(
        `${API_URL}/invoices/order/${orderId}/html`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load invoice");
      }

      const html = await response.text();

      const blob = new Blob([html], {
        type: "text/html",
      });

      const url = URL.createObjectURL(blob);

      const win = window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

      if (!win) {
        setMessage(
          "Popup blocked - please allow popups for invoice"
        );
      }

      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const emailInvoice = async (orderId) => {
    try {
      const response = await fetch(
        `${API_URL}/invoices/order/${orderId}/email`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({}),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to email invoice"
        );
      }

      setMessage(data.message || "Invoice emailed");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-50 text-green-700 border-green-200";

      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      case "Shipped":
      case "Out for Delivery":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Packed":
      case "Processing":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "Confirmed":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";

      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <main className="min-h-screen w-full bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 md:px-7 lg:px-10 xl:px-12 2xl:px-16">
      <div className="w-full">

        {/* ================= HEADER ================= */}
        <div className="mb-5 sm:mb-6">

          <button
            onClick={() => navigate("/admin")}
            className="mb-4 inline-flex items-center text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
          >
            ← Back to Admin
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
              Order Management
            </h1>

            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              View and manage customer orders.
            </p>
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
              Loading orders...
            </p>

          </div>
        ) : orders.length === 0 ? (
          /* ================= EMPTY ================= */
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm sm:p-12">

            <div className="mb-3 text-4xl">
              📦
            </div>

            <h2 className="text-lg font-bold text-slate-800">
              No orders found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Customer orders will appear here.
            </p>

          </div>
        ) : (
          <>
            {/* =====================================================
                MOBILE + TABLET CARD VIEW
                Hidden on large desktop
            ====================================================== */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:hidden">

              {orders.map((order) => (

                <div
                  key={order.id}
                  className="w-full overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
                >

                  {/* ================= CARD HEADER ================= */}
                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="break-all text-base font-bold text-slate-900 sm:text-lg">
                        {order.order_number}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Order ID: {order.id}
                      </p>

                    </div>

                    {/* Status Badge */}
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                        order.status || "Order Placed"
                      )}`}
                    >
                      {order.status || "Order Placed"}
                    </span>

                  </div>

                  {/* ================= CUSTOMER ================= */}
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 sm:p-4">

                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Customer
                    </p>

                    <p className="break-words text-sm font-semibold text-slate-900 sm:text-base">
                      {order.customer_name ||
                        order.name ||
                        "Customer"}
                    </p>

                    {(order.customer_email ||
                      order.email) && (
                      <p className="mt-1 break-all text-xs text-slate-500 sm:text-sm">
                        {order.customer_email ||
                          order.email}
                      </p>
                    )}

                  </div>

                  {/* ================= ORDER INFO ================= */}
                  <div className="mt-4 grid grid-cols-2 gap-3">

                    {/* Total */}
                    <div className="rounded-xl border border-slate-100 p-3">
                      <p className="text-xs text-slate-400">
                        Total
                      </p>

                      <p className="mt-1 text-base font-bold text-cyan-700 sm:text-lg">
                        ₹{order.total_amount}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="rounded-xl border border-slate-100 p-3">
                      <p className="text-xs text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {order.created_at
                          ? new Date(
                              order.created_at
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "-"}
                      </p>
                    </div>

                    {/* Payment */}
                    <div className="rounded-xl border border-slate-100 p-3">
                      <p className="text-xs text-slate-400">
                        Payment
                      </p>

                      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                        {order.payment_method || "-"}
                      </p>

                      <p
                        className={`mt-1 text-xs font-semibold ${
                          order.payment_status === "paid"
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {order.payment_status || "pending"}
                      </p>
                    </div>

                    {/* Order ID */}
                    <div className="rounded-xl border border-slate-100 p-3">
                      <p className="text-xs text-slate-400">
                        Order ID
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        #{order.id}
                      </p>
                    </div>

                  </div>

                  {/* ================= STATUS UPDATE ================= */}
                  <div className="mt-4 border-t border-slate-100 pt-4">

                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Update Order Status
                    </label>

                    <select
                      value={
                        order.status ||
                        "Order Placed"
                      }
                      onChange={(e) =>
                        updateOrderStatus(
                          order.id,
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    >
                      {orderStatuses.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        )
                      )}
                    </select>

                  </div>

                  {/* ================= INVOICE ================= */}
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">

                    <button
                      onClick={() => openInvoice(order.id)}
                      className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
                    >
                      🧾 View Invoice
                    </button>

                    <button
                      onClick={() => emailInvoice(order.id)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      ✉️ Email Invoice
                    </button>

                  </div>

                </div>

              ))}

            </div>

            {/* =====================================================
                DESKTOP / MAC TABLE
                Visible from lg
            ====================================================== */}
            <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm lg:block">

              <div className="w-full overflow-x-auto">

                <table className="w-full min-w-[1100px] text-left">

                  <thead className="border-b bg-slate-50">

                    <tr>

                      <th className="whitespace-nowrap p-4 text-sm font-bold text-slate-700 xl:p-5">
                        Order
                      </th>

                      <th className="whitespace-nowrap p-4 text-sm font-bold text-slate-700 xl:p-5">
                        Customer
                      </th>

                      <th className="whitespace-nowrap p-4 text-sm font-bold text-slate-700 xl:p-5">
                        Total
                      </th>

                      <th className="whitespace-nowrap p-4 text-sm font-bold text-slate-700 xl:p-5">
                        Payment
                      </th>

                      <th className="whitespace-nowrap p-4 text-sm font-bold text-slate-700 xl:p-5">
                        Date
                      </th>

                      <th className="whitespace-nowrap p-4 text-sm font-bold text-slate-700 xl:p-5">
                        Status
                      </th>

                      <th className="whitespace-nowrap p-4 text-sm font-bold text-slate-700 xl:p-5">
                        Invoice
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {orders.map((order) => (

                      <tr
                        key={order.id}
                        className="border-b transition hover:bg-slate-50 last:border-0"
                      >

                        {/* Order */}
                        <td className="p-4 xl:p-5">

                          <p className="font-semibold text-slate-900">
                            {order.order_number}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            ID: {order.id}
                          </p>

                        </td>

                        {/* Customer */}
                        <td className="max-w-[260px] p-4 xl:p-5">

                          <p className="break-words font-semibold text-slate-900">
                            {order.customer_name ||
                              order.name ||
                              "Customer"}
                          </p>

                          <p className="mt-1 break-all text-xs text-slate-500">
                            {order.customer_email ||
                              order.email ||
                              ""}
                          </p>

                        </td>

                        {/* Total */}
                        <td className="whitespace-nowrap p-4 font-bold text-cyan-700 xl:p-5">
                          ₹{order.total_amount}
                        </td>

                        {/* Payment */}
                        <td className="p-4 xl:p-5">

                          <p className="text-sm text-slate-700">
                            {order.payment_method || "-"}
                          </p>

                          <p
                            className={`mt-1 text-xs font-semibold ${
                              order.payment_status ===
                              "paid"
                                ? "text-green-600"
                                : "text-orange-600"
                            }`}
                          >
                            {order.payment_status ||
                              "pending"}
                          </p>

                        </td>

                        {/* Date */}
                        <td className="whitespace-nowrap p-4 text-sm text-slate-500 xl:p-5">

                          {order.created_at
                            ? new Date(
                                order.created_at
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}

                        </td>

                        {/* Status */}
                        <td className="p-4 xl:p-5">

                          <select
                            value={
                              order.status ||
                              "Order Placed"
                            }
                            onChange={(e) =>
                              updateOrderStatus(
                                order.id,
                                e.target.value
                              )
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                          >

                            {orderStatuses.map(
                              (status) => (
                                <option
                                  key={status}
                                  value={status}
                                >
                                  {status}
                                </option>
                              )
                            )}

                          </select>

                        </td>

                        {/* Invoice */}
                        <td className="p-4 xl:p-5">

                          <div className="flex flex-col gap-2">

                            <button
                              onClick={() =>
                                openInvoice(order.id)
                              }
                              className="whitespace-nowrap rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100"
                            >
                               View
                            </button>

                            <button
                              onClick={() =>
                                emailInvoice(order.id)
                              }
                              className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                              ✉️ Email
                            </button>

                          </div>

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

export default OrderManagement;
 

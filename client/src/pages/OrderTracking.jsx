import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// =====================================================
// ORDER TRACKING
// =====================================================

function OrderTracking() {
  // =====================================================
  // ENV
  // =====================================================

  const API_URL =
    import.meta.env.VITE_SERVER_API_URL || "http://localhost:4000/api";

  const IMAGE_URL =
    import.meta.env.VITE_SERVER_IMAGES_URL || "http://localhost:4000/uploads";

  // =====================================================
  // STATES
  // =====================================================

  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // CANCEL / RETURN STATES
  // =====================================================

  const [actionType, setActionType] = useState(null);
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Item which user wants to return
  const [returnItemData, setReturnItemData] = useState(null);

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageURL = (image) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${IMAGE_URL}/${image.replace(/^\/+/, "")}`;
  };

  // =====================================================
  // LOAD ALL ORDERS
  // =====================================================

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login first to see your orders.");
        setOrders([]);
        return;
      }

      const response = await fetch(`${API_URL}/orders/my-orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error("NON JSON RESPONSE:", text);

        throw new Error("Server returned an invalid response.");
      }

      const data = await response.json();

      console.log("ORDERS API RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load orders");
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to load orders");
      }

      const serverOrders = Array.isArray(data.orders) ? data.orders : [];

      setOrders(serverOrders);

      if (serverOrders.length > 0) {
        setSelectedOrderId(serverOrders[0].id);
        setSelectedOrder(serverOrders[0]);
      } else {
        setSelectedOrderId(null);
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error("LOAD ORDERS ERROR:", err);

      setError(err.message || "Unable to load orders");

      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  // =====================================================
  // LOAD SINGLE ORDER
  // =====================================================

  const loadSingleOrder = async (orderId) => {
    try {
      setLoadingOrder(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response.");
      }

      const data = await response.json();

      console.log("SINGLE ORDER RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load order");
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to load order");
      }

      setSelectedOrder(data.order);
      setSelectedOrderId(orderId);
    } catch (err) {
      console.error("LOAD SINGLE ORDER ERROR:", err);

      setError(err.message || "Failed to load order");
    } finally {
      setLoadingOrder(false);
    }
  };

  // =====================================================
  // SELECT ORDER
  // =====================================================

  const handleSelectOrder = (order) => {
    setSelectedOrderId(order.id);
    setSelectedOrder(order);

    loadSingleOrder(order.id);
  };

  // =====================================================
  // CANCEL ORDER
  // =====================================================

  const cancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        `${API_URL}/orders/${selectedOrder.id}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: actionReason.trim() || "Changed my mind",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel order");
      }

      setSuccess("Order cancelled successfully.");

      setActionType(null);
      setActionReason("");

      await loadOrders();

      await loadSingleOrder(selectedOrder.id);
    } catch (err) {
      console.error("CANCEL ORDER ERROR:", err);

      setError(err.message || "Failed to cancel order");
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // RETURN ITEM
  // =====================================================

  const returnItem = async (item) => {
    if (!selectedOrder || !item) return;

    if (!actionReason.trim()) {
      setError("Please enter a return reason.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        `${API_URL}/orders/${selectedOrder.id}/items/${item.id}/return`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: actionReason.trim(),
          }),
        },
      );

      const data = await response.json();

      console.log("RETURN RESPONSE:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to request return");
      }

      setSuccess("Return request submitted successfully.");

      setActionType(null);
      setActionReason("");
      setReturnItemData(null);

      await loadOrders();
      await loadSingleOrder(selectedOrder.id);
    } catch (err) {
      console.error("RETURN ITEM ERROR:", err);

      setError(err.message || "Failed to request return");
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // CHECK CANCEL
  // =====================================================

  const canCancelOrder = (status) => {
    return ["Order Placed", "Confirmed", "Packed"].includes(status);
  };

  // =====================================================
  // CHECK RETURN
  // =====================================================

  const canReturnItem = (item) => {
    return (
      item?.status === "Delivered" &&
      !item?.rmaRequested &&
      !item?.rma_requested &&
      !item?.rmaStatus &&
      !item?.rma_status
    );
  };

  // =====================================================
  // STATUS
  // =====================================================

  const orderStatuses = [
    "Order Placed",
    "Confirmed",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  // =====================================================
  // STATUS INDEX
  // =====================================================

  const getStatusIndex = (status) => {
    return orderStatuses.indexOf(status);
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
    }

    return parsed.toLocaleString();
  };

  // =====================================================
  // LOAD PAGE
  // =====================================================

  useEffect(() => {
    loadOrders();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loadingOrders) {
    return (
      <div className="min-h-screen w-full bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-[1800px] items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />

            <h2 className="text-xl font-bold text-slate-800">
              Loading your orders...
            </h2>

            <p className="mt-2 text-sm text-slate-500">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1800px] px-3 py-5 sm:px-5 sm:py-7 md:px-7 lg:px-10 xl:px-12">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900 p-5 text-white shadow-xl sm:p-7 lg:p-9">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-200">
                Orders & Tracking
              </div>
             

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl pt-4 pb-2">
                Order Tracking
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Track your orders, check delivery status, manage returns and
                view complete order details.
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-flex w-fit items-center justify-center rounded-2xl bg-white px-5 py-3 font-bold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <br />
        <br />
        {/* =====================================================
            ALERTS
        ===================================================== */}

        {error && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm">
            <p className="text-sm font-medium">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-xl font-bold leading-none text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700 shadow-sm">
            {success}
          </div>
        )}

        {/* =====================================================
            NO ORDERS
        ===================================================== */}

        {orders.length === 0 ? (
          <div className="flex min-h-[500px] w-full items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-sky-50 text-5xl">
                📦
              </div>

              <h2 className="text-2xl font-black text-slate-800 sm:text-3xl">
                No Orders Found
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
                You haven't placed any orders yet. Complete your first purchase
                to start tracking your orders here.
              </p>

              <Link
                to="/shop"
                className="mt-7 inline-flex rounded-2xl bg-sky-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-700"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          /* =====================================================
             ORDERS + DETAILS
          ===================================================== */

          <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)] 2xl:grid-cols-[400px_minmax(0,1fr)]">
            {/* =====================================================
                ORDER LIST
            ===================================================== */}

            <aside className="h-fit xl:sticky xl:top-5">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/80 p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                        Your Orders
                      </p>

                      <h2 className="mt-1 text-xl font-black text-slate-800">
                        My Orders
                      </h2>
                    </div>

                    <span className="flex h-10 min-w-10 items-center justify-center rounded-full bg-sky-100 px-3 text-sm font-black text-sky-700">
                      {orders.length}
                    </span>
                  </div>
                </div>
                <br />
                <div className="max-h-[calc(100vh-230px)] space-y-3 overflow-y-auto p-4 sm:p-5">
                  {orders.map((order) => {
                    const active = Number(selectedOrderId) === Number(order.id);

                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => handleSelectOrder(order)}
                        className={`group w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                          active
                            ? "border-sky-500 bg-sky-50 shadow-md shadow-sky-100"
                            : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3  ">
                          <div className="min-w-0">
                            <p className="truncate text-base font-black text-slate-800">
                              #
                              {order.orderNumber ||
                                order.order_number ||
                                order.id}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(order.placedAt || order.placed_at)}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
                            {order.status}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-3">
                          <span className="text-xs font-medium text-slate-500">
                            {order.items?.length || 0}{" "}
                            {order.items?.length === 1 ? "item" : "items"}
                          </span>

                          <span className="text-base font-black text-slate-800">
                            ₹
                            {Number(
                              order.total ||
                                order.totalAmount ||
                                order.total_amount ||
                                0,
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* =====================================================
                ORDER DETAILS
            ===================================================== */}

            <main className="min-w-0">
              {loadingOrder ? (
                <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />

                    <p className="font-semibold text-slate-600">
                      Loading order details...
                    </p>
                  </div>
                </div>
              ) : selectedOrder ? (
                <div className="space-y-5">
                  {/* =====================================================
                      ORDER HEADER
                  ===================================================== */}

                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                          Order Number
                        </p>

                        <h2 className="mt-1 break-all text-2xl font-black text-slate-900 sm:text-3xl">
                          #
                          {selectedOrder.orderNumber ||
                            selectedOrder.order_number ||
                            selectedOrder.id}
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                          Placed on{" "}
                          {formatDate(
                            selectedOrder.placedAt || selectedOrder.placed_at,
                          )}
                        </p>
                      </div>

                      <div className="w-full rounded-2xl bg-sky-50 px-5 py-4 md:w-auto md:min-w-[190px]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-sky-600">
                          Current Status
                        </p>

                        <p className="mt-1 text-lg font-black text-sky-700">
                          {selectedOrder.status}
                        </p>
                      </div>
                    </div>
                  </section>
                  <br />
                  {/* =====================================================
                      TRACKING
                  ===================================================== */}

                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <div className="mb-7">
                      <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                        Delivery Progress
                      </p>

                      <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                        Order Status
                      </h2>
                    </div>

                    <div className="relative">
                      {orderStatuses.map((status, index) => {
                        const currentIndex = getStatusIndex(
                          selectedOrder.status,
                        );

                        const completed = currentIndex >= index;

                        const historyItem = selectedOrder.history?.find(
                          (item) => item.status === status,
                        );

                        const isLast = index === orderStatuses.length - 1;

                        return (
                          <div
                            key={status}
                            className="relative flex gap-4 sm:gap-5"
                          >
                            {/* LINE */}
                            {!isLast && (
                              <div
                                className={`absolute left-[18px] top-10 h-[calc(100%-5px)] w-0.5 ${
                                  currentIndex > index
                                    ? "bg-sky-500"
                                    : "bg-slate-200"
                                }`}
                              />
                            )}

                            {/* ICON */}
                            <div
                              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black ${
                                completed
                                  ? "border-sky-600 bg-sky-600 text-white shadow-md shadow-sky-100"
                                  : "border-slate-200 bg-white text-slate-400"
                              }`}
                            >
                              {completed ? "✓" : index + 1}
                            </div>

                            {/* CONTENT */}
                            <div
                              className={`min-w-0 flex-1 ${
                                isLast ? "pb-1" : "pb-7"
                              }`}
                            >
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <p
                                  className={`font-bold ${
                                    completed
                                      ? "text-slate-800"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {status}
                                </p>

                                {historyItem?.created_at && (
                                  <p className="text-xs text-slate-400">
                                    {formatDate(historyItem.created_at)}
                                  </p>
                                )}
                              </div>

                              {historyItem && (
                                <p className="mt-1 text-sm text-slate-500">
                                  {historyItem.message || "Status updated"}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                  <br />
                  {/* =====================================================
                      PRODUCTS
                  ===================================================== */}

                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <div className="mb-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                        Order Items
                      </p>

                      <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                        Ordered Products
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {selectedOrder.items?.length > 0 ? (
                        selectedOrder.items.map((item) => {
                          const image =
                            item.image ||
                            item.productImage ||
                            item.product_image;

                          const productName =
                            item.name ||
                            item.productName ||
                            item.product_name ||
                            "Product";

                          const itemStatus =
                            item.status || selectedOrder.status;

                          const returnRequested =
                            item.rmaRequested || item.rma_requested;

                          const returnStatus =
                            item.rmaStatus || item.rma_status;

                          const returnReason =
                            item.rmaReason || item.rma_reason;

                          return (
                            <div
                              key={item.id}
                              className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-sky-200 hover:shadow-md"
                            >
                              <div className="p-4 sm:p-5">
                                <div className="flex flex-col gap-4 sm:flex-row">
                                  {/* IMAGE */}

                                  <div className="shrink-0">
                                    {image ? (
                                      <img
                                        src={getImageURL(image)}
                                        alt={productName}
                                        className="h-28 w-full rounded-2xl object-cover sm:h-28 sm:w-28"
                                        onError={(event) => {
                                          event.currentTarget.style.display =
                                            "none";

                                          if (
                                            event.currentTarget
                                              .nextElementSibling
                                          ) {
                                            event.currentTarget.nextElementSibling.style.display =
                                              "flex";
                                          }
                                        }}
                                      />
                                    ) : null}

                                    <div
                                      className={`${
                                        image ? "hidden" : "flex"
                                      } h-28 w-full items-center justify-center rounded-2xl bg-slate-100 text-4xl sm:h-28 sm:w-28`}
                                    >
                                      📦
                                    </div>
                                  </div>

                                  {/* INFO */}

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                      <div>
                                        <h3 className="text-lg font-black text-slate-800">
                                          {productName}
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-400">
                                          Product ID:{" "}
                                          {item.productId ||
                                            item.product_id ||
                                            "-"}
                                        </p>
                                      </div>

                                      <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                        {itemStatus}
                                      </span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                        Qty: {item.quantity || 1}
                                      </span>

                                      {item.size && (
                                        <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                          Size: {item.size}
                                        </span>
                                      )}

                                      {item.color && (
                                        <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                          Color: {item.color}
                                        </span>
                                      )}
                                    </div>

                                    <p className="mt-4 text-xl font-black text-slate-900">
                                      ₹
                                      {Number(item.price || 0).toLocaleString(
                                        "en-IN",
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {/* RETURN */}

                                {itemStatus === "Delivered" && (
                                  <div className="mt-5 border-t border-slate-100 pt-4">
                                    {returnRequested ? (
                                      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                          <p className="font-bold text-orange-800">
                                            Return Request
                                          </p>

                                          <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                                            {returnStatus || "Requested"}
                                          </span>
                                        </div>

                                        {returnReason && (
                                          <p className="mt-2 text-sm text-orange-700">
                                            <strong>Reason:</strong>{" "}
                                            {returnReason}
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setReturnItemData(item);

                                          setActionType("return");

                                          setActionReason("");

                                          setError("");
                                          setSuccess("");
                                        }}
                                        className="w-full rounded-xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700 transition hover:border-orange-500 hover:bg-orange-100 sm:w-auto"
                                      >
                                        ↩ Return Product
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-2xl bg-slate-50 p-8 text-center">
                          <p className="text-slate-500">
                            No products found in this order.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                  <br />
                  {/* =====================================================
                      ADDRESS + PAYMENT
                  ===================================================== */}

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {/* ADDRESS */}

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                      <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                          Delivery
                        </p>

                        <h2 className="mt-1 text-xl font-black text-slate-900">
                          Shipping Address
                        </h2>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-5">
                        <p className="font-black text-slate-800">
                          {selectedOrder.fullName ||
                            selectedOrder.full_name ||
                            selectedOrder.addressDetails?.full_name ||
                            "Customer"}
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {selectedOrder.address ||
                            selectedOrder.address_line ||
                            selectedOrder.addressDetails?.address_line ||
                            "Address unavailable"}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          {selectedOrder.city || ""}
                          {selectedOrder.city && selectedOrder.state
                            ? ", "
                            : ""}
                          {selectedOrder.state || ""}{" "}
                          {selectedOrder.pincode || selectedOrder.pin || ""}
                        </p>

                        {selectedOrder.phone && (
                          <p className="mt-3 text-sm text-slate-600">
                            📞 {selectedOrder.phone}
                          </p>
                        )}

                        {selectedOrder.email && (
                          <p className="mt-1 break-all text-sm text-slate-600">
                            ✉ {selectedOrder.email}
                          </p>
                        )}
                      </div>
                    </section>

                    {/* PAYMENT */}

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                      <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                          Payment
                        </p>

                        <h2 className="mt-1 text-xl font-black text-slate-900">
                          Payment Details
                        </h2>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-5">
                        <p className="text-sm text-slate-500">Payment Method</p>

                        <p className="mt-1 text-lg font-black capitalize text-slate-800">
                          {selectedOrder.paymentMethod ||
                            selectedOrder.payment_method ||
                            "Not specified"}
                        </p>
                      </div>
                    </section>
                  </div>
                  <br />
                  {/* =====================================================
                      ORDER SUMMARY
                  ===================================================== */}

                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <div className="mb-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                        Billing
                      </p>

                      <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                        Order Summary
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
                        <span>Subtotal</span>

                        <span className="font-bold text-slate-800">
                          ₹
                          {Number(selectedOrder.subtotal || 0).toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
                        <span>Delivery Charge</span>

                        <span className="font-bold text-slate-800">
                          ₹
                          {Number(
                            selectedOrder.deliveryCharge ||
                              selectedOrder.delivery_charge ||
                              0,
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="border-t border-slate-200 pt-4">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-lg font-black text-slate-800">
                            Total
                          </span>

                          <span className="text-2xl font-black text-sky-600">
                            ₹
                            {Number(
                              selectedOrder.total ||
                                selectedOrder.totalAmount ||
                                selectedOrder.total_amount ||
                                0,
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>
                  <br />
                  {/* =====================================================
                      CANCEL ORDER
                  ===================================================== */}

                  {canCancelOrder(selectedOrder.status) && (
                    <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm sm:p-7">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-red-500">
                            Order Management
                          </p>

                          <h2 className="mt-1 text-xl font-black text-slate-900">
                            Cancel Order
                          </h2>

                          <p className="mt-1 text-sm text-slate-500">
                            You can cancel this order before it is shipped.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActionType("cancel");
                            setActionReason("");
                            setError("");
                          }}
                          className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white shadow-md shadow-red-100 transition hover:-translate-y-0.5 hover:bg-red-700"
                        >
                          Cancel Order
                        </button>
                      </div>
                    </section>
                  )}
                </div>
              ) : (
                <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <p className="text-slate-500">
                    Select an order to view details.
                  </p>
                </div>
              )}
            </main>
          </div>
        )}
        <br />
        {/* =====================================================
            ACTION MODAL
        ===================================================== */}

        {actionType && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-5">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
              {/* MODAL HEADER */}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className={`text-xs font-black uppercase tracking-wider ${
                      actionType === "cancel"
                        ? "text-red-500"
                        : "text-orange-500"
                    }`}
                  >
                    Confirmation Required
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-900">
                    {actionType === "cancel"
                      ? "Cancel Order"
                      : "Return Product"}
                  </h2>
                </div>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    setActionType(null);
                    setActionReason("");
                    setReturnItemData(null);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-500 transition hover:bg-slate-200"
                >
                  ×
                </button>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {actionType === "cancel"
                  ? "Please tell us why you want to cancel this order."
                  : "Please tell us why you want to return this product."}
              </p>

              {/* RETURN PRODUCT PREVIEW */}

              {actionType === "return" && returnItemData && (
                <div className="mt-5 flex gap-3 rounded-2xl bg-orange-50 p-3">
                  {returnItemData.image ||
                  returnItemData.productImage ||
                  returnItemData.product_image ? (
                    <img
                      src={getImageURL(
                        returnItemData.image ||
                          returnItemData.productImage ||
                          returnItemData.product_image,
                      )}
                      alt="Product"
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-2xl">
                      📦
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-800">
                      {returnItemData.name ||
                        returnItemData.productName ||
                        returnItemData.product_name ||
                        "Product"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Qty: {returnItemData.quantity || 1}
                    </p>
                  </div>
                </div>
              )}

              {/* TEXTAREA */}

              <textarea
                value={actionReason}
                onChange={(event) => setActionReason(event.target.value)}
                rows={4}
                disabled={actionLoading}
                className="mt-5 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                placeholder={
                  actionType === "cancel"
                    ? "Cancellation reason..."
                    : "Return reason..."
                }
              />

              {/* BUTTONS */}

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    setActionType(null);
                    setActionReason("");
                    setReturnItemData(null);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50 sm:w-auto"
                >
                  Close
                </button>

                {actionType === "cancel" ? (
                  <button
                    type="button"
                    disabled={actionLoading || !actionReason.trim()}
                    onClick={cancelOrder}
                    className="w-full rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {actionLoading ? "Cancelling..." : "Confirm Cancel"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={
                      actionLoading || !actionReason.trim() || !returnItemData
                    }
                    onClick={() => returnItem(returnItemData)}
                    className="w-full rounded-xl bg-orange-600 px-5 py-3 font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {actionLoading ? "Submitting..." : "Submit Return"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderTracking;

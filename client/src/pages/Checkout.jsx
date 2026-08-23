import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

function Checkout() {

  // =====================================================
  // ENV
  // =====================================================

  const API_URL =
    import.meta.env.VITE_SERVER_API_URL ||
    "http://localhost:4000/api";

  const IMAGE_URL =
    import.meta.env.VITE_SERVER_IMAGES_URL ||
    "http://localhost:4000/images";

  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [cart, setCart] = useState([]);

  const [orderPlaced, setOrderPlaced] = useState(false);

  const [placedOrder, setPlacedOrder] = useState(null);

  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pin: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState("card");

  const [paymentMessage, setPaymentMessage] =
    useState("");

  const [paymentDetails, setPaymentDetails] =
    useState({
      cardNumber: "",
      cardName: "",
      expiry: "",
      cvv: "",
      upiId: "",
      codNote: "",
    });

  // =====================================================
  // GET TOKEN
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
  // LOAD RAZORPAY SCRIPT
  // =====================================================

  const loadRazorpayScript = () => {

    return new Promise((resolve) => {

      // If already loaded
      if (window.Razorpay) {

        resolve(true);

        return;

      }

      const existingScript =
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

      if (existingScript) {

        existingScript.onload = () =>
          resolve(true);

        existingScript.onerror = () =>
          resolve(false);

        return;

      }

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () =>
        resolve(true);

      script.onerror = () =>
        resolve(false);

      document.body.appendChild(script);

    });

  };

  // =====================================================
  // GET IMAGE URL
  // =====================================================

  const getImageURL = (image) => {

    if (!image) return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {

      return image;

    }

    const cleanBaseURL =
      IMAGE_URL.replace(/\/$/, "");

    const cleanImage =
      String(image).replace(/^\//, "");

    return `${cleanBaseURL}/${cleanImage}`;

  };

  // =====================================================
  // GET CHECKOUT DATA
  // =====================================================

  useEffect(() => {

    try {

      const buyNowProduct = JSON.parse(
        localStorage.getItem(
          "buyNowProduct"
        ) || "null"
      );

      const cartData = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      console.log(
        "CHECKOUT - BUY NOW PRODUCT:",
        buyNowProduct
      );

      console.log(
        "CHECKOUT - CART DATA:",
        cartData
      );

      // Buy Now has priority

      if (buyNowProduct) {

        setCart([
          {
            ...buyNowProduct,
            quantity: Number(
              buyNowProduct.quantity || 1
            ),
          },
        ]);

      } else {

        setCart(
          Array.isArray(cartData)
            ? cartData
            : []
        );

      }

    } catch (error) {

      console.error(
        "CHECKOUT DATA ERROR:",
        error
      );

      setCart([]);

    }

  }, []);

  // =====================================================
  // PRICE CALCULATION
  // =====================================================

  const subtotal = cart.reduce(
    (totalPrice, item) => {

      return (
        totalPrice +
        Number(item.price || 0) *
          Number(item.quantity || 1)
      );

    },
    0
  );

  const delivery =
    cart.length > 0 ? 50 : 0;

  const total =
    subtotal + delivery;

  // =====================================================
  // SHIPPING INPUT
  // =====================================================

  const handleInput = (event) => {

    const { name, value } =
      event.target;

    setShipping((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  // =====================================================
  // PAYMENT INPUT
  // =====================================================

  const handlePaymentDetail =
    (event) => {

      const { name, value } =
        event.target;

      setPaymentDetails((prev) => ({
        ...prev,
        [name]: value,
      }));

    };

  // =====================================================
  // CONFIRM ORDER UI
  // =====================================================

  const confirmOrder = (
    serverOrder,
    items,
    methodLabel,
    paymentInfo
  ) => {

    const uiOrder = {

      ...serverOrder,

      products: cart,

      items,

      customerName:
        shipping.name,

      name:
        shipping.name,

      email:
        shipping.email,

      phone:
        shipping.phone,

      address:
        shipping.address,

      city:
        shipping.city,

      state:
        shipping.state,

      pin:
        shipping.pin,

      total:

        serverOrder.total ||

        serverOrder.totalAmount ||

        serverOrder.total_amount ||

        total,

      paymentMethod:
        methodLabel,

      paymentDetails:
        paymentInfo,

    };

    setPlacedOrder(uiOrder);

    // Clear cart

    localStorage.removeItem(
      "cart"
    );

    localStorage.removeItem(
      "buyNowProduct"
    );

    setCart([]);

    // Header cart count update

    window.dispatchEvent(
      new Event("cartChanged")
    );

    setOrderPlaced(true);

  };

  // =====================================================
  // VERIFY RAZORPAY PAYMENT
  // =====================================================

  const verifyRazorpayPayment =
    async (
      serverOrder,
      razorpayResponse,
      token,
      items,
      methodLabel,
      paymentInfo
    ) => {

      try {

        console.log(
          "VERIFY PAYMENT DATA:",
          razorpayResponse
        );

        const verifyResponse =
          await fetch(
            `${API_URL}/payments/verify`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                orderId:
                  serverOrder.id,

                razorpay_order_id:
                  razorpayResponse.razorpay_order_id,

                razorpay_payment_id:
                  razorpayResponse.razorpay_payment_id,

                razorpay_signature:
                  razorpayResponse.razorpay_signature,
              }),
            }
          );

        const verifyText =
          await verifyResponse.text();

        console.log(
          "VERIFY PAYMENT RAW RESPONSE:",
          verifyText
        );

        let verifyResult = {};

        try {

          verifyResult =
            verifyText
              ? JSON.parse(
                  verifyText
                )
              : {};

        } catch (parseError) {

          console.error(
            "VERIFY PAYMENT JSON ERROR:",
            parseError
          );

          throw new Error(
            "Payment verification server returned an invalid response."
          );

        }

        console.log(
          "VERIFY PAYMENT RESPONSE:",
          verifyResult
        );

        if (
          !verifyResponse.ok ||
          !verifyResult.success
        ) {

          throw new Error(
            verifyResult.message ||
              "Payment verification failed"
          );

        }

        setPaymentMessage(
          "Payment successful! Order confirmed."
        );

        confirmOrder(
          serverOrder,
          items,
          methodLabel,
          paymentInfo
        );

      } catch (error) {

        console.error(
          "VERIFY PAYMENT ERROR:",
          error
        );

        setPaymentMessage(
          error.message ||
            "Payment was completed but verification failed. Please contact support."
        );

      } finally {

        setLoading(false);

      }

    };

  // =====================================================
  // OPEN RAZORPAY PAYMENT
  // =====================================================

  const openRazorpayPayment =
    async (
      serverOrder,
      token,
      items,
      methodLabel,
      paymentInfo
    ) => {

      try {

        // Load Razorpay

        const razorpayLoaded =
          await loadRazorpayScript();

        if (!razorpayLoaded) {

          throw new Error(
            "Unable to load Razorpay. Please check your internet connection."
          );

        }

        // Create Razorpay order

        const paymentResponse =
          await fetch(
            `${API_URL}/payments/create-order`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                orderId:
                  serverOrder.id,
              }),
            }
          );

        const paymentText =
          await paymentResponse.text();

        console.log(
          "CREATE PAYMENT RAW RESPONSE:",
          paymentText
        );

        let paymentResult = {};

        try {

          paymentResult =
            paymentText
              ? JSON.parse(
                  paymentText
                )
              : {};

        } catch (parseError) {

          console.error(
            "CREATE PAYMENT JSON ERROR:",
            parseError
          );

          throw new Error(
            "Payment server returned an invalid response."
          );

        }

        console.log(
          "CREATE PAYMENT RESPONSE:",
          paymentResult
        );

        if (
          !paymentResponse.ok ||
          !paymentResult.success
        ) {

          throw new Error(
            paymentResult.message ||
              "Unable to create payment"
          );

        }

        if (!paymentResult.key) {

          throw new Error(
            "Razorpay Key ID is missing."
          );

        }

        if (
          !paymentResult.razorpayOrderId
        ) {

          throw new Error(
            "Razorpay Order ID is missing."
          );

        }

        // Razorpay options

        const options = {

          key:
            paymentResult.key,

          amount:
            paymentResult.amount,

          currency:
            paymentResult.currency ||
            "INR",

          name:
            "Apple Blossom",

          description:
            `Order ${
              paymentResult.orderNumber ||
              serverOrder.order_number ||
              serverOrder.orderNumber ||
              ""
            }`,

          order_id:
            paymentResult.razorpayOrderId,

          prefill: {

            name:
              shipping.name,

            email:
              shipping.email,

            contact:
              shipping.phone,

          },

          notes: {

            appleBlossomOrderId:
              String(
                serverOrder.id
              ),

            orderNumber:
              serverOrder.order_number ||
              serverOrder.orderNumber ||
              "",

          },

          theme: {
            color: "#0284c7",
          },

          // Payment success

          handler:
            async (
              razorpayResponse
            ) => {

              await verifyRazorpayPayment(
                serverOrder,
                razorpayResponse,
                token,
                items,
                methodLabel,
                paymentInfo
              );

            },

          // Razorpay modal close

          modal: {

            ondismiss: () => {

              console.log(
                "RAZORPAY PAYMENT POPUP CLOSED"
              );

              setPaymentMessage(
                "Payment was cancelled."
              );

              setLoading(false);

            },

          },

        };

        const razorpay =
          new window.Razorpay(
            options
          );

        razorpay.on(
          "payment.failed",
          function (response) {

            console.error(
              "RAZORPAY PAYMENT FAILED:",
              response.error
            );

            setPaymentMessage(
              response.error?.description ||
                "Payment failed. Please try again."
            );

            setLoading(false);

          }
        );

        razorpay.open();

      } catch (error) {

        console.error(
          "OPEN RAZORPAY ERROR:",
          error
        );

        setPaymentMessage(
          error.message ||
            "Unable to start payment."
        );

        setLoading(false);

      }

    };

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const placeOrder =
    async (event) => {

      event.preventDefault();

      setPaymentMessage("");

      // ===================================================
      // CHECK CART
      // ===================================================

      if (cart.length === 0) {

        setPaymentMessage(
          "Your cart is empty."
        );

        return;

      }

      // ===================================================
      // TOKEN
      // ===================================================

      const token =
        getToken();

      console.log(
        "CHECKOUT TOKEN EXISTS:",
        Boolean(token)
      );

      if (!token) {

        setPaymentMessage(
          "Please login before placing an order."
        );

        setTimeout(() => {

          navigate("/login");

        }, 800);

        return;

      }

      // ===================================================
      // PAYMENT METHOD LABEL
      // ===================================================

      const methodLabel =

        paymentMethod === "card"
          ? "Credit / Debit Card"
          : paymentMethod === "upi"
          ? "UPI"
          : "Cash on Delivery";

      // ===================================================
      // CARD VALIDATION
      // ===================================================

      if (
        paymentMethod === "card" &&
        (!paymentDetails.cardNumber ||
          !paymentDetails.cardName ||
          !paymentDetails.expiry ||
          !paymentDetails.cvv)
      ) {

        setPaymentMessage(
          "Please complete your card details before placing the order."
        );

        return;

      }

      // ===================================================
      // UPI VALIDATION
      // ===================================================

      if (
        paymentMethod === "upi" &&
        !paymentDetails.upiId
      ) {

        setPaymentMessage(
          "Please enter your UPI ID before placing the order."
        );

        return;

      }

      // ===================================================
      // PAYMENT INFO
      // ===================================================

      const paymentInfo =

        paymentMethod === "card"
          ? {

              cardNumber:
                paymentDetails.cardNumber.replace(
                  /\d(?=\d{4})/g,
                  "*"
                ),

              cardName:
                paymentDetails.cardName,

              expiry:
                paymentDetails.expiry,

            }
          : paymentMethod === "upi"
          ? {

              upiId:
                paymentDetails.upiId,

            }
          : {

              codNote:
                paymentDetails.codNote ||
                "Pay at delivery",

            };

      // ===================================================
      // CONVERT CART TO API ITEMS
      // ===================================================

      const items =
        cart.map((item) => ({

          productId:

            item.productId ||

            item.product_id ||

            item.id,

          productName:

            item.productName ||

            item.product_name ||

            item.name ||

            item.title ||

            "Product",

          productImage:

            item.productImage ||

            item.product_image ||

            item.image ||

            null,

          price:
            Number(
              item.price || 0
            ),

          quantity:
            Number(
              item.quantity || 1
            ),

          size:
            item.size || null,

          color:
            item.color || null,

        }));

      // ===================================================
      // VALIDATE PRODUCT IDs
      // ===================================================

      const invalidProduct =
        items.find(
          (item) =>
            !item.productId
        );

      if (invalidProduct) {

        setPaymentMessage(
          "Product information is missing. Please go back and add the product again."
        );

        return;

      }

      // ===================================================
      // API ORDER DATA
      // ===================================================

      const orderData = {

        items,

        subtotal,

        deliveryCharge:
          delivery,

        totalAmount:
          total,

        paymentMethod:
          methodLabel,

        // Backend field compatibility

        addressId:
          null,

        address_id:
          null,

        shipping: {

          name:
            shipping.name,

          email:
            shipping.email,

          phone:
            shipping.phone,

          address:
            shipping.address,

          city:
            shipping.city,

          state:
            shipping.state,

          pin:
            shipping.pin,

        },

        paymentDetails:
          paymentInfo,

      };

      console.log(
        "================================="
      );

      console.log(
        "ORDER DATA SENT TO SERVER:",
        orderData
      );

      console.log(
        "================================="
      );

      // ===================================================
      // API REQUEST
      // ===================================================

      try {

        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/orders`,
            {

              method:
                "POST",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,

              },

              body:
                JSON.stringify(
                  orderData
                ),

            }
          );

        // =================================================
        // RESPONSE TEXT FIRST
        // =================================================

        const responseText =
          await response.text();

        console.log(
          "ORDER API RAW RESPONSE:",
          responseText
        );

        let result = {};

        try {

          result =
            responseText
              ? JSON.parse(
                  responseText
                )
              : {};

        } catch (parseError) {

          console.error(
            "ORDER API JSON PARSE ERROR:",
            parseError
          );

          throw new Error(
            "Server returned an invalid response. Please check the backend API."
          );

        }

        console.log(
          "ORDER API RESPONSE:",
          result
        );

        // =================================================
        // API ERROR
        // =================================================

        if (
          !response.ok ||
          !result.success
        ) {

          throw new Error(
            result.message ||
              "Failed to place order"
          );

        }

        // =================================================
        // SERVER ORDER
        // =================================================

        const serverOrder =
          result.order || {};

        console.log(
          "================================="
        );

        console.log(
          "ORDER CREATED IN DATABASE:",
          serverOrder
        );

        console.log(
          "================================="
        );

        if (!serverOrder.id) {

          throw new Error(
            "Order was created but Order ID was not returned by the server."
          );

        }

        // =================================================
        // COD
        // =================================================

        if (
          paymentMethod === "cod"
        ) {

          setPaymentMessage(
            "Order placed successfully!"
          );

          confirmOrder(
            serverOrder,
            items,
            methodLabel,
            paymentInfo
          );

          setLoading(false);

          return;

        }

        // =================================================
        // UPI + CARD
        // =================================================

        setPaymentMessage(
          "Opening secure payment window..."
        );

        await openRazorpayPayment(
          serverOrder,
          token,
          items,
          methodLabel,
          paymentInfo
        );

      } catch (error) {

        console.error(
          "PLACE ORDER ERROR:",
          error
        );

        setPaymentMessage(
          error.message ||
            "Failed to place order. Please try again."
        );

        setLoading(false);

      }

    };

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="min-h-screen w-full bg-gray-100 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-16">

      <div className="w-full">

        {/* =================================================
            TITLE
        ================================================= */}

        <h1 className="pb-6 text-3xl font-bold text-gray-700 sm:text-4xl lg:text-5xl">

          Checkout

        </h1>

        {/* =================================================
            ORDER CONFIRMED
        ================================================= */}

        {orderPlaced ? (

          <div className="w-full rounded-3xl bg-white p-6 shadow-sm sm:p-8 lg:p-10">

            <div className="mb-6">

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">

                ✓

              </div>

              <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">

                Order Confirmed

              </h2>

              <p className="mt-3 text-gray-600">

                Thank you for your purchase. Your order has been

                successfully placed and is now being processed.

              </p>

            </div>

            {/* ORDER NUMBER */}

            {(placedOrder?.orderNumber ||

              placedOrder?.order_number) && (

              <div className="mb-6 rounded-2xl bg-slate-50 p-5">

                <p className="text-sm text-gray-500">

                  Order Number

                </p>

                <p className="mt-1 text-xl font-bold text-gray-800">

                  {placedOrder.orderNumber ||

                    placedOrder.order_number}

                </p>

                <p className="mt-2 text-gray-600">

                  Total: ₹

                  {Number(
                    placedOrder.total || 0
                  ).toFixed(2)}

                </p>

              </div>

            )}

            {/* BUTTONS */}

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">

              <button

                type="button"

                onClick={() =>
                  navigate("/")
                }

                className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700"

              >

                Continue Shopping

              </button>

              <button

                type="button"

                onClick={() =>
                  navigate(
                    "/order-tracking"
                  )
                }

                className="inline-flex items-center justify-center rounded-xl border border-sky-600 px-6 py-3 font-semibold text-sky-600 hover:bg-sky-50"

              >

                View Order Tracking

              </button>

              <Link

                to="/"

                className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-600 hover:bg-gray-50"

              >

                Back to Home

              </Link>

            </div>

          </div>

        ) : (

          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">

            {/* =================================================
                SHIPPING + PAYMENT
            ================================================= */}

            <div className="w-full rounded-3xl bg-white p-4 shadow-sm sm:p-6 lg:col-span-2 lg:p-8">

              <h2 className="pb-4 text-2xl font-bold text-gray-700">

                Shipping & Payment

              </h2>

              {cart.length === 0 ? (

                <div className="rounded-3xl border border-dashed border-gray-300 p-6 text-center sm:p-8">

                  <p className="pb-5 text-lg text-gray-500 sm:text-xl">

                    Your cart is empty. Add items before checking out.

                  </p>

                  <Link

                    to="/shop"

                    className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700"

                  >

                    Browse Products

                  </Link>

                </div>

              ) : (

                <form

                  onSubmit={placeOrder}

                  className="space-y-6"

                >

                  {/* NAME + EMAIL */}

                  <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2">

                    <label className="block">

                      <span className="text-sm font-semibold text-gray-600">

                        Full Name

                      </span>

                      <input

                        type="text"

                        name="name"

                        value={shipping.name}

                        onChange={handleInput}

                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-sky-500"

                        required

                      />

                    </label>

                    <label className="block">

                      <span className="text-sm font-semibold text-gray-600">

                        Email

                      </span>

                      <input

                        type="email"

                        name="email"

                        value={shipping.email}

                        onChange={handleInput}

                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-sky-500"

                        required

                      />

                    </label>

                  </div>

                  {/* PHONE + PIN */}

                  <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2">

                    <label className="block">

                      <span className="text-sm font-semibold text-gray-600">

                        Phone

                      </span>

                      <input

                        type="tel"

                        name="phone"

                        value={shipping.phone}

                        onChange={handleInput}

                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-sky-500"

                        required

                      />

                    </label>

                    <label className="block">

                      <span className="text-sm font-semibold text-gray-600">

                        Postal Code

                      </span>

                      <input

                        type="text"

                        name="pin"

                        value={shipping.pin}

                        onChange={handleInput}

                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-sky-500"

                        required

                      />

                    </label>

                  </div>

                  {/* ADDRESS */}

                  <label className="block">

                    <span className="text-sm font-semibold text-gray-600">

                      Address

                    </span>

                    <textarea

                      name="address"

                      value={shipping.address}

                      onChange={handleInput}

                      rows={4}

                      className="mt-2 w-full resize-none rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-sky-500"

                      required

                    />

                  </label>

                  {/* CITY + STATE */}

                  <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2">

                    <label className="block">

                      <span className="text-sm font-semibold text-gray-600">

                        City

                      </span>

                      <input

                        type="text"

                        name="city"

                        value={shipping.city}

                        onChange={handleInput}

                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-sky-500"

                        required

                      />

                    </label>

                    <label className="block">

                      <span className="text-sm font-semibold text-gray-600">

                        State

                      </span>

                      <input

                        type="text"

                        name="state"

                        value={shipping.state}

                        onChange={handleInput}

                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-sky-500"

                        required

                      />

                    </label>

                  </div>

                  {/* =================================================
                      PAYMENT
                  ================================================= */}

                  <div className="rounded-3xl bg-slate-50 p-4 sm:p-5">

                    <h3 className="text-xl font-semibold text-gray-700">

                      Payment Method

                    </h3>

                    <div className="space-y-3 pt-4">

                      {/* CARD */}

                      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-300 bg-white p-4">

                        <input

                          type="radio"

                          name="payment"

                          value="card"

                          checked={paymentMethod === "card"}

                          onChange={() =>
                            setPaymentMethod(
                              "card"
                            )
                          }

                          className="h-4 w-4"

                        />

                        <span className="text-gray-700">

                          Credit / Debit Card

                        </span>

                      </label>

<br/>

                      {/* UPI */}

                      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-300 bg-white p-4">

                        <input

                          type="radio"

                          name="payment"

                          value="upi"

                          checked={paymentMethod === "upi"}

                          onChange={() =>
                            setPaymentMethod(
                              "upi"
                            )
                          }

                          className="h-4 w-4"

                        />

                        <span className="text-gray-700">

                          UPI

                        </span>

                      </label>

<br/>

                      {/* COD */}

                      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-300 bg-white p-4">

                        <input

                          type="radio"

                          name="payment"

                          value="cod"

                          checked={paymentMethod === "cod"}

                          onChange={() =>
                            setPaymentMethod(
                              "cod"
                            )
                          }

                          className="h-4 w-4"

                        />

                        <span className="text-gray-700">

                          Cash on Delivery

                        </span>

                      </label>

                    </div>

                    {/* CARD DETAILS */}

                    {paymentMethod === "card" && (

                      <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">

                        <label className="block text-sm text-gray-600">

                          <span className="mb-2 block font-semibold">

                            Cardholder Name

                          </span>

                          <input

                            type="text"

                            name="cardName"

                            value={
                              paymentDetails.cardName
                            }

                            onChange={
                              handlePaymentDetail
                            }

                            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-sky-500"

                            placeholder="Ayesha Khan"

                            required

                          />

                        </label>

                        <label className="block text-sm text-gray-600">

                          <span className="mb-2 block font-semibold">

                            Card Number

                          </span>

                          <input

                            type="text"

                            name="cardNumber"

                            value={
                              paymentDetails.cardNumber
                            }

                            onChange={
                              handlePaymentDetail
                            }

                            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-sky-500"

                            placeholder="4242 4242 4242 4242"

                            maxLength="19"

                            required

                          />

                        </label>

                        <label className="block text-sm text-gray-600">

                          <span className="mb-2 block font-semibold">

                            Expiry

                          </span>

                          <input

                            type="text"

                            name="expiry"

                            value={
                              paymentDetails.expiry
                            }

                            onChange={
                              handlePaymentDetail
                            }

                            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-sky-500"

                            placeholder="MM/YY"

                            required

                          />

                        </label>

                        <label className="block text-sm text-gray-600">

                          <span className="mb-2 block font-semibold">

                            CVV

                          </span>

                          <input

                            type="password"

                            name="cvv"

                            value={
                              paymentDetails.cvv
                            }

                            onChange={
                              handlePaymentDetail
                            }

                            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-sky-500"

                            placeholder="***"

                            maxLength="4"

                            required

                          />

                        </label>

                      </div>

                    )}

                    {/* UPI */}

                    {paymentMethod === "upi" && (

                      <label className="block pt-4 text-sm text-gray-600">

                        <span className="mb-2 block font-semibold">

                          UPI ID

                        </span>

                        <input

                          type="text"

                          name="upiId"

                          value={
                            paymentDetails.upiId
                          }

                          onChange={
                            handlePaymentDetail
                          }

                          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-sky-500"

                          placeholder="yourname@upi"

                          required

                        />

                      </label>

                    )}

                    {/* COD */}

                    {paymentMethod === "cod" && (

                      <label className="block pt-4 text-sm text-gray-600">

                        <span className="mb-2 block font-semibold">

                          Delivery Note

                        </span>

                        <textarea

                          name="codNote"

                          value={
                            paymentDetails.codNote
                          }

                          onChange={
                            handlePaymentDetail
                          }

                          rows={3}

                          className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-sky-500"

                          placeholder="Leave at reception or call before delivery"

                        />

                      </label>

                    )}

                  </div>

                  {/* PAYMENT MESSAGE */}

                  {paymentMessage && (

                    <div

                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        paymentMessage.includes(
                          "successful"
                        ) ||
                        paymentMessage.includes(
                          "Opening"
                        )
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}

                    >

                      {paymentMessage}

                    </div>

                  )}

                  {/* PLACE ORDER */}

<br/><br/>

                  <button

                    type="submit"

                    disabled={loading}

                    className="w-full rounded-2xl bg-sky-600 px-6 py-4 text-lg font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"

                  >

                    {loading

                      ? "Processing..."

                      : paymentMethod === "cod"
                      ? `Place Order • ₹${total}`
                      : `Pay Securely • ₹${total}`}

                  </button>

                </form>

              )}

            </div>

            {/* =================================================
                ORDER SUMMARY
            ================================================= */}

            <div className="w-full rounded-3xl bg-white p-4 shadow-sm sm:p-6">

              <h2 className="pb-4 text-2xl font-bold text-gray-700">

                Order Summary

              </h2>

              <div className="space-y-4">

                {/* PRODUCTS */}

                {cart.map(
                  (item, index) => {

                    const image =

                      item.image ||

                      item.productImage ||

                      item.product_image;

                    return (

                      <div

                        key={
                          item.cartItemId ||
                          `${
                            item.id ||
                            item.productId
                          }-${index}`
                        }

                        className="rounded-3xl border border-gray-200 p-4"

                      >

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start lg:flex-col xl:flex-row">

                          {image ? (

                            <img

                              src={
                                getImageURL(
                                  image
                                )
                              }

                              alt={
                                item.title ||
                                item.name ||
                                item.productName ||
                                "Product"
                              }

                              className="h-20 w-20 shrink-0 rounded-2xl object-cover"

                              onError={(
                                event
                              ) => {

                                event.currentTarget.style.display =
                                  "none";

                              }}

                            />

                          ) : (

                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-xs text-gray-400">

                              No Image

                            </div>

                          )}

                          <div className="flex-1">

                            <h3 className="font-semibold text-gray-800">

                              {item.title ||
                                item.name ||
                                item.productName ||
                                "Product"}

                            </h3>

                            {item.size && (

                              <p className="mt-1 text-gray-500">

                                Size: {item.size}

                              </p>

                            )}

                            {item.color && (

                              <p className="mt-1 text-gray-500">

                                Color: {item.color}

                              </p>

                            )}

                            <p className="mt-1 text-gray-500">

                              Qty: {
                                item.quantity || 1
                              }

                            </p>

                            <p className="mt-2 font-semibold text-gray-700">

                              ₹{
                                Number(
                                  item.price || 0
                                )
                              }

                            </p>

                            {item.oldPrice && (

                              <p className="text-sm text-gray-400 line-through">

                                ₹{
                                  Number(
                                    item.oldPrice
                                  )
                                }

                              </p>

                            )}

                          </div>

                          <p className="text-lg font-semibold text-gray-700">

                            ₹

                            {Number(
                              item.price || 0
                            ) *
                              Number(
                                item.quantity || 1
                              )}

                          </p>

                        </div>

                      </div>

                    );

                  }
                )}

                {/* PRICE SUMMARY */}
<br/>
                <div className="rounded-3xl bg-slate-50 p-4">

                  <div className="flex justify-between text-gray-600">

                    <span>Subtotal</span>

                    <span>
                      ₹{subtotal.toFixed(2)}
                    </span>

                  </div>

                  <div className="flex justify-between pt-3 text-gray-600">

                    <span>Delivery</span>

                    <span>
                      ₹{delivery.toFixed(2)}
                    </span>

                  </div>

                  <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 text-xl font-bold text-gray-800">

                    <span>Total</span>

                    <span>
                      ₹{total.toFixed(2)}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}

export default Checkout;
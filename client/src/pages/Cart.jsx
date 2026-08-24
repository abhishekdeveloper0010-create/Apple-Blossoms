import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  // =====================================================
  // LOGIN CHECK
  // =====================================================

  const askLogin = () => {
    alert("Please login to view your cart.");
    navigate("/login");
  };

  // =====================================================
  // CHECKOUT
  // =====================================================

  const handleCheckout = () => {
    const user = getCurrentUser();

    if (!user) {
      askLogin();
      return;
    }

    navigate("/checkout");
  };

  // =====================================================
  // LOAD CART
  // =====================================================

  useEffect(() => {
    const user = getCurrentUser();

    if (!user) {
      askLogin();
      return;
    }

    try {
      const cartData =
        JSON.parse(localStorage.getItem("cart")) || [];

      setCart(Array.isArray(cartData) ? cartData : []);
    } catch (error) {
      console.error("CART LOAD ERROR:", error);
      setCart([]);
    }
  }, [navigate]);

  // =====================================================
  // SAVE CART
  // =====================================================

  const saveCart = (updatedCart) => {
    setCart(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(
      new Event("cartChanged")
    );
  };

  // =====================================================
  // REMOVE PRODUCT
  // =====================================================

  const removeItem = (cartItemId) => {
    const updatedCart = cart.filter(
      (item) =>
        item.cartItemId !== cartItemId
    );

    saveCart(updatedCart);
  };

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  const increaseQty = (cartItemId) => {
    const updatedCart = cart.map((item) => {
      if (item.cartItemId === cartItemId) {
        return {
          ...item,
          quantity:
            Number(item.quantity || 0) + 1,
        };
      }

      return item;
    });

    saveCart(updatedCart);
  };

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  const decreaseQty = (cartItemId) => {
    const updatedCart = cart.map((item) => {
      if (item.cartItemId === cartItemId) {
        return {
          ...item,
          quantity:
            Number(item.quantity) > 1
              ? Number(item.quantity) - 1
              : 1,
        };
      }

      return item;
    });

    saveCart(updatedCart);
  };

  // =====================================================
  // SUBTOTAL
  // PRODUCT PRICE × QUANTITY
  // =====================================================

  const subtotal = cart.reduce(
    (total, item) => {
      const price = Number(item.price || 0);
      const quantity = Number(item.quantity || 1);

      return total + price * quantity;
    },
    0
  );

  // =====================================================
  // SHIPPING CHARGE
  // DATABASE SE AAYEGA
  //
  // shipping_free = 1 -> FREE
  // shipping_free = 0 -> shipping_charge
  //
  // Quantity ke according har product ka charge
  // add hoga.
  // =====================================================

  const shipping = cart.reduce(
    (total, item) => {
      const quantity = Number(
        item.quantity || 1
      );

      const shippingCharge = Number(
        item.shipping_charge ||
        item.shippingCharge ||
        0
      );

      const isShippingFree =
        Number(
          item.shipping_free ??
          item.shippingFree ??
          0
        ) === 1;

      if (isShippingFree) {
        return total;
      }

      return (
        total +
        shippingCharge * quantity
      );
    },
    0
  );

  // =====================================================
  // DELIVERY CHARGE
  // DATABASE SE AAYEGA
  //
  // delivery_free = 1 -> FREE
  // delivery_free = 0 -> delivery_charge
  //
  // Quantity ke according har product ka charge
  // add hoga.
  // =====================================================

  const delivery = cart.reduce(
    (total, item) => {
      const quantity = Number(
        item.quantity || 1
      );

      const deliveryCharge = Number(
        item.delivery_charge ||
        item.deliveryCharge ||
        0
      );

      const isDeliveryFree =
        Number(
          item.delivery_free ??
          item.deliveryFree ??
          0
        ) === 1;

      if (isDeliveryFree) {
        return total;
      }

      return (
        total +
        deliveryCharge * quantity
      );
    },
    0
  );

  // =====================================================
  // TOTAL
  // =====================================================

  const total = Math.max(
    0,
    subtotal +
      shipping +
      delivery -
      discount
  );

  // =====================================================
  // APPLY COUPON
  // =====================================================

  const applyCoupon = () => {
    const code =
      couponCode.trim().toUpperCase();

    if (!code) {
      setDiscount(0);

      setCouponMessage(
        "Enter a coupon code to save more."
      );

      return;
    }

    if (code === "APPLE10") {
      const value = Math.min(
        Math.round(subtotal * 0.1),
        200
      );

      setDiscount(value);

      setCouponMessage(
        `Coupon applied! You saved ₹${value}.`
      );

      return;
    }

    if (code === "STYLE20") {
      const value = Math.min(
        Math.round(subtotal * 0.2),
        300
      );

      setDiscount(value);

      setCouponMessage(
        `Coupon applied! You saved ₹${value}.`
      );

      return;
    }

    setDiscount(0);

    setCouponMessage(
      "Invalid coupon code. Try APPLE10 or STYLE20."
    );
  };

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (value) => {
    return Number(value || 0).toFixed(0);
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ================================================= */}
        {/* CART SECTION */}
        {/* ================================================= */}

        <div
          className={`
            bg-white
            text-left
            p-6
            rounded-3xl

            ${
              cart.length === 0
                ? "w-full"
                : "w-full lg:w-[70%]"
            }
          `}
        >

          <h1
            className="
              text-3xl
              font-bold
              text-gray-700
              pb-5
            "
          >
            My Shopping Cart
          </h1>

          <hr className="border-gray-300" />

          {/* EMPTY CART */}

          {cart.length === 0 ? (

            <div className="py-24 text-center">

              <h2
                className="
                  text-2xl
                  font-semibold
                  text-gray-500
                "
              >
                Your Cart is Empty
              </h2>

              <p
                className="
                  text-gray-400
                  mt-3
                "
              >
                Add some products to continue shopping.
              </p>

            </div>

          ) : (

            <div className="mt-6 space-y-5">

              {cart.map((item) => (

                <CartItem
                  key={item.cartItemId}
                  item={item}
                  removeItem={removeItem}
                  increaseQty={increaseQty}
                  decreaseQty={decreaseQty}
                />

              ))}

            </div>

          )}

        </div>

        {/* ================================================= */}
        {/* ORDER SUMMARY */}
        {/* ================================================= */}

        {cart.length > 0 && (

          <div
            className="
              w-full
              lg:w-[30%]
              bg-white
              rounded-3xl
              p-6
              h-fit
            "
          >

            <h2
              className="
                text-[25px]
                font-bold
                text-gray-700
                pb-4
              "
            >
              Order Summary
            </h2>

            <hr className="mt-4 border-gray-300" />

            <div className="mt-6 space-y-4">

              {/* SUBTOTAL */}

              <div className="flex justify-between text-2xl pt-4">

                <span>
                  Subtotal
                </span>

                <span>
                  ₹{formatPrice(subtotal)}
                </span>

              </div>

              {/* SHIPPING */}

              <div className="flex justify-between text-2xl pt-4">

                <span>
                  Shipping
                </span>

                <span
                  className={
                    shipping === 0
                      ? "text-green-600"
                      : ""
                  }
                >
                  {shipping === 0
                    ? "Free"
                    : `₹${formatPrice(shipping)}`}
                </span>

              </div>

              {/* DELIVERY */}

              <div className="flex justify-between text-2xl pt-4">

                <span>
                  Delivery
                </span>

                <span
                  className={
                    delivery === 0
                      ? "text-green-600"
                      : ""
                  }
                >
                  {delivery === 0
                    ? "Free"
                    : `₹${formatPrice(delivery)}`}
                </span>

              </div>

              {/* COUPON */}

              <div className="flex justify-between text-2xl pt-4">

                <span>
                  Coupon
                </span>

                <span className="text-green-600">
                  -₹{formatPrice(discount)}
                </span>

              </div>

              {/* OFFERS */}

              <div
                className="
                  rounded-2xl
                  border
                  border-sky-100
                  bg-sky-50
                  p-3
                  text-sm
                  text-slate-600
                "
              >

                <p className="font-semibold text-slate-800">
                  Offers for you
                </p>

                <p className="mt-1">
                  Use APPLE10 or STYLE20 for extra savings on fashion essentials.
                </p>

              </div>

              {/* COUPON INPUT */}

              <div className="pt-4 pb-2 flex gap-2">

                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) =>
                    setCouponCode(
                      event.target.value
                    )
                  }
                  placeholder="Coupon code"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    px-3
                    py-2
                    text-base
                    outline-none
                    focus:border-sky-500
                  "
                />

                <button
                  type="button"
                  onClick={applyCoupon}
                  className="
                    rounded-xl
                    bg-slate-800
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-slate-700
                    cursor-pointer
                  "
                >
                  Apply
                </button>

              </div>

              {/* COUPON MESSAGE */}

              {couponMessage && (

                <p className="text-sm text-slate-600">

                  {couponMessage}

                </p>

              )}

              <hr className="mt-4" />

              {/* TOTAL */}

              <div
                className="
                  flex
                  justify-between
                  font-bold
                  text-2xl
                  pt-5
                  pb-5
                "
              >

                <span>
                  Total
                </span>

                <span>
                  ₹{formatPrice(total)}
                </span>

              </div>

              {/* CHECKOUT */}

              <button
                type="button"
                onClick={handleCheckout}
                className="
                  w-full
                  mt-2
                  bg-sky-600
                  hover:bg-sky-700
                  text-white
                  py-3
                  rounded-xl
                  cursor-pointer
                  text-2xl
                "
              >
                Proceed To Checkout
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default Cart;
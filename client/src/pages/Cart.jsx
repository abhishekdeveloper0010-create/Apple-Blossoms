 
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";

function Cart() {
  const navigate = useNavigate();

  const API_URL =
    import.meta.env.VITE_SERVER_API_URL ||
    "http://localhost:4000/api";

  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [validatingCart, setValidatingCart] = useState(false);
  const [cartValidationMessage, setCartValidationMessage] = useState("");

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
  // GET USER ID
  // =====================================================

  const getUserId = () => {
    const user = getCurrentUser();

    if (!user) {
      return null;
    }

    return (
      user.id ||
      user.user_id ||
      user.userId ||
      null
    );
  };

  // =====================================================
  // GET USER-SPECIFIC CART KEY
  // =====================================================

  const getCartKey = () => {
    const userId = getUserId();

    if (!userId) {
      return null;
    }

    return `cart_user_${userId}`;
  };

  // =====================================================
  // LOGIN CHECK
  // =====================================================

  const askLogin = () => {
    alert("Please login to view your cart.");
    navigate("/login");
  };

  // =====================================================
  // SAVE USER-SPECIFIC CART
  // =====================================================

  const saveCart = (updatedCart) => {
    const cartKey = getCartKey();

    if (!cartKey) {
      askLogin();
      return;
    }

    setCart(updatedCart);

    localStorage.setItem(
      cartKey,
      JSON.stringify(updatedCart)
    );

    // Old common cart remove
    localStorage.removeItem("cart");

    window.dispatchEvent(
      new Event("cartChanged")
    );
  };

  // =====================================================
  // GET PRODUCT ID
  // =====================================================

  const getProductId = (item) => {
    return (
      item.productId ||
      item.product_id ||
      item.id ||
      null
    );
  };

  // =====================================================
  // GET PRODUCT DATA FROM RESPONSE
  // =====================================================

  const getProductFromResponse = (data) => {
    if (!data) {
      return null;
    }

    return (
      data.product ||
      data.data?.product ||
      data.data ||
      data
    );
  };

  // =====================================================
  // VALIDATE CART PRODUCTS
  // DATABASE SE LATEST DATA CHECK
  // =====================================================

  const validateCartProducts = async (
    cartItems,
    showMessage = true
  ) => {
    if (
      !Array.isArray(cartItems) ||
      cartItems.length === 0
    ) {
      return {
        valid: true,
        cart: [],
        issues: [],
      };
    }

    try {
      setValidatingCart(true);

      if (showMessage) {
        setCartValidationMessage(
          "Checking product availability..."
        );
      }

      const results = await Promise.all(
        cartItems.map(async (item) => {
          const productId =
            getProductId(item);

          if (!productId) {
            return {
              item,
              product: null,
              error: "Product ID missing",
            };
          }

          try {
            const response = await fetch(
              `${API_URL}/products/${productId}`
            );

            const text =
              await response.text();

            let data = {};

            try {
              data = text
                ? JSON.parse(text)
                : {};
            } catch {
              data = {};
            }

            if (!response.ok) {
              return {
                item,
                product: null,
                error:
                  data.message ||
                  "Product not found",
              };
            }

            const product =
              getProductFromResponse(data);

            return {
              item,
              product,
              error: null,
            };
          } catch (error) {
            return {
              item,
              product: null,
              error: error.message,
            };
          }
        })
      );

      let updatedCart = [];
      let hasIssue = false;
      let issueMessages = [];

      results.forEach(
        ({
          item,
          product,
          error,
        }) => {
          // =============================================
          // PRODUCT NOT FOUND
          // =============================================

          if (!product) {
            hasIssue = true;

            issueMessages.push(
              `${
                item.name ||
                item.title ||
                "Product"
              } is no longer available.`
            );

            return;
          }

          // =============================================
          // STOCK
          // =============================================

          const stock = Number(
            product.stock ?? 0
          );

          const quantity = Number(
            item.quantity || 1
          );

          // =============================================
          // OUT OF STOCK
          // =============================================

          if (stock <= 0) {
            hasIssue = true;

            issueMessages.push(
              `${
                product.name ||
                item.name ||
                "Product"
              } is out of stock.`
            );

            return;
          }

          // =============================================
          // QUANTITY > STOCK
          // =============================================

          let finalQuantity = quantity;

          if (quantity > stock) {
            finalQuantity = stock;
            hasIssue = true;

            issueMessages.push(
              `${
                product.name ||
                item.name ||
                "Product"
              } quantity reduced to ${stock} because only ${stock} item(s) are available.`
            );
          }

          // =============================================
          // PRICE VALIDATION
          // =============================================

          const oldPrice = Number(
            item.price ?? 0
          );

          const newPrice = Number(
            product.price ?? oldPrice
          );

          if (
            oldPrice > 0 &&
            newPrice !== oldPrice
          ) {
            hasIssue = true;

            issueMessages.push(
              `${
                product.name ||
                item.name ||
                "Product"
              } price has been updated.`
            );
          }

          // =============================================
          // UPDATED CART ITEM
          // =============================================

          updatedCart.push({
            ...item,

            productId:
              product.id ??
              item.productId ??
              item.product_id,

            product_id:
              product.id ??
              item.product_id ??
              item.productId,

            id:
              product.id ??
              item.id,

            name:
              product.name ||
              item.name ||
              item.title,

            title:
              product.name ||
              item.title ||
              item.name,

            description:
              product.description ??
              item.description ??
              "",

            price: newPrice,

            image:
              product.image ||
              item.image ||
              null,

            category:
              product.category ??
              item.category ??
              "",

            stock,

            quantity: finalQuantity,

            shipping_charge:
              product.shipping_charge ??
              product.shippingCharge ??
              item.shipping_charge ??
              item.shippingCharge ??
              0,

            shippingCharge:
              product.shippingCharge ??
              product.shipping_charge ??
              item.shippingCharge ??
              item.shipping_charge ??
              0,

            shipping_free:
              product.shipping_free ??
              product.shippingFree ??
              item.shipping_free ??
              item.shippingFree ??
              0,

            shippingFree:
              product.shippingFree ??
              product.shipping_free ??
              item.shippingFree ??
              item.shipping_free ??
              0,

            delivery_charge:
              product.delivery_charge ??
              product.deliveryCharge ??
              item.delivery_charge ??
              item.deliveryCharge ??
              0,

            deliveryCharge:
              product.deliveryCharge ??
              product.delivery_charge ??
              item.deliveryCharge ??
              item.delivery_charge ??
              0,

            delivery_free:
              product.delivery_free ??
              product.deliveryFree ??
              item.delivery_free ??
              item.deliveryFree ??
              0,

            deliveryFree:
              product.deliveryFree ??
              product.delivery_free ??
              item.deliveryFree ??
              item.delivery_free ??
              0,
          });
        }
      );

      // =============================================
      // SAVE ONLY AVAILABLE PRODUCTS
      // =============================================

      const finalCart =
        updatedCart.filter(
          (item) =>
            Number(item.quantity || 0) > 0
        );

      if (
        finalCart.length !==
        cartItems.length
      ) {
        hasIssue = true;
      }

      saveCart(finalCart);

      // =============================================
      // MESSAGE
      // =============================================

      if (showMessage) {
        if (hasIssue) {
          setCartValidationMessage(
            issueMessages.join(" ")
          );
        } else {
          setCartValidationMessage(
            "All products are available."
          );
        }
      }

      return {
        valid: !hasIssue,
        cart: finalCart,
        issues: issueMessages,
      };
    } catch (error) {
      console.error(
        "CART VALIDATION ERROR:",
        error
      );

      setCartValidationMessage(
        "Unable to check latest product availability."
      );

      return {
        valid: false,
        cart: cartItems,
        issues: [
          "Unable to validate cart products.",
        ],
      };
    } finally {
      setValidatingCart(false);
    }
  };

  // =====================================================
  // LOAD CART
  // USER-WISE CART
  // =====================================================

  useEffect(() => {
    const user = getCurrentUser();
    const userId = getUserId();

    if (!user || !userId) {
      askLogin();
      return;
    }

    try {
      const cartKey =
        `cart_user_${userId}`;

      const cartData =
        JSON.parse(
          localStorage.getItem(
            cartKey
          )
        ) || [];

      const validCart =
        Array.isArray(cartData)
          ? cartData
          : [];

      setCart(validCart);

      if (validCart.length > 0) {
        validateCartProducts(
          validCart,
          true
        );
      }
    } catch (error) {
      console.error(
        "CART LOAD ERROR:",
        error
      );

      setCart([]);
    }
  }, [navigate]);

  // =====================================================
  // REMOVE PRODUCT
  // =====================================================

  const removeItem = (cartItemId) => {
    const updatedCart =
      cart.filter(
        (item) =>
          item.cartItemId !==
          cartItemId
      );

    saveCart(updatedCart);
  };

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  const increaseQty = (cartItemId) => {
    const updatedCart =
      cart.map((item) => {
        if (
          item.cartItemId !==
          cartItemId
        ) {
          return item;
        }

        const currentQuantity =
          Number(
            item.quantity || 1
          );

        const availableStock =
          Number(
            item.stock ?? 0
          );

        if (availableStock <= 0) {
          alert(
            "This product is currently out of stock."
          );

          return item;
        }

        if (
          currentQuantity >=
          availableStock
        ) {
          alert(
            `Only ${availableStock} item(s) available in stock.`
          );

          return item;
        }

        return {
          ...item,
          quantity:
            currentQuantity + 1,
        };
      });

    saveCart(updatedCart);
  };

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  const decreaseQty = (cartItemId) => {
    const updatedCart =
      cart.map((item) => {
        if (
          item.cartItemId ===
          cartItemId
        ) {
          return {
            ...item,
            quantity:
              Number(
                item.quantity || 1
              ) > 1
                ? Number(
                    item.quantity
                  ) - 1
                : 1,
          };
        }

        return item;
      });

    saveCart(updatedCart);
  };

  // =====================================================
  // CHECKOUT
  // =====================================================

  const handleCheckout =
    async () => {
      const user =
        getCurrentUser();

      if (!user) {
        askLogin();
        return;
      }

      if (cart.length === 0) {
        alert(
          "Your cart is empty."
        );
        return;
      }

      const validation =
        await validateCartProducts(
          cart,
          true
        );

      const latestCart =
        validation.cart ||
        cart;

      const invalidStock =
        latestCart.some(
          (item) => {
            const quantity =
              Number(
                item.quantity || 0
              );

            const stock =
              Number(
                item.stock ?? 0
              );

            return (
              quantity <= 0 ||
              stock <= 0 ||
              quantity > stock
            );
          }
        );

      if (invalidStock) {
        alert(
          "Please check product availability and quantity before checkout."
        );

        return;
      }

      navigate("/checkout");
    };

  // =====================================================
  // SUBTOTAL
  // =====================================================

  const subtotal =
    cart.reduce(
      (total, item) => {
        const price =
          Number(
            item.price || 0
          );

        const quantity =
          Number(
            item.quantity || 1
          );

        return (
          total +
          price * quantity
        );
      },
      0
    );

  // =====================================================
  // SHIPPING CHARGE
  // =====================================================

  const shipping =
    cart.reduce(
      (total, item) => {
        const quantity =
          Number(
            item.quantity || 1
          );

        const shippingCharge =
          Number(
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
          shippingCharge *
            quantity
        );
      },
      0
    );

  // =====================================================
  // DELIVERY CHARGE
  // =====================================================

  const delivery =
    cart.reduce(
      (total, item) => {
        const quantity =
          Number(
            item.quantity || 1
          );

        const deliveryCharge =
          Number(
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
          deliveryCharge *
            quantity
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
      couponCode
        .trim()
        .toUpperCase();

    if (!code) {
      setDiscount(0);

      setCouponMessage(
        "Enter a coupon code to save more."
      );

      return;
    }

    if (code === "APPLE10") {
      const value =
        Math.min(
          Math.round(
            subtotal * 0.1
          ),
          200
        );

      setDiscount(value);

      setCouponMessage(
        `Coupon applied! You saved ₹${value}.`
      );

      return;
    }

    if (code === "STYLE20") {
      const value =
        Math.min(
          Math.round(
            subtotal * 0.2
          ),
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
    return Number(
      value || 0
    ).toFixed(0);
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* =================================================
            CART SECTION
        ================================================= */}

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

          {/* CART VALIDATION MESSAGE */}

          {validatingCart && (
            <div className="mt-4 rounded-xl bg-sky-50 border border-sky-100 px-4 py-3 text-sm text-sky-700">
              Checking latest product availability...
            </div>
          )}

          {!validatingCart &&
            cartValidationMessage && (
              <div
                className={`
                  mt-4
                  rounded-xl
                  border
                  px-4
                  py-3
                  text-sm
                  ${
                    cartValidationMessage.includes(
                      "All products"
                    )
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-orange-200 bg-orange-50 text-orange-700"
                  }
                `}
              >
                {cartValidationMessage}
              </div>
            )}

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
                  key={
                    item.cartItemId
                  }
                  item={item}
                  removeItem={
                    removeItem
                  }
                  increaseQty={
                    increaseQty
                  }
                  decreaseQty={
                    decreaseQty
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* =================================================
            ORDER SUMMARY
        ================================================= */}

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
                  ₹
                  {formatPrice(
                    subtotal
                  )}
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
                    : `₹${formatPrice(
                        shipping
                      )}`}
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
                    : `₹${formatPrice(
                        delivery
                      )}`}
                </span>
              </div>

              {/* COUPON */}

              <div className="flex justify-between text-2xl pt-4">
                <span>
                  Coupon
                </span>

                <span className="text-green-600">
                  -₹
                  {formatPrice(
                    discount
                  )}
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
                  onClick={
                    applyCoupon
                  }
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
                  ₹
                  {formatPrice(
                    total
                  )}
                </span>
              </div>

              {/* CHECKOUT */}

              <button
                type="button"
                onClick={
                  handleCheckout
                }
                disabled={
                  validatingCart
                }
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
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >
                {validatingCart
                  ? "Checking..."
                  : "Proceed To Checkout"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
 

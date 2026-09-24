const db = require("../config/db");

const {
  createOrder,
  createOrderItem,
  createStatusHistory,
  getUserOrders,
  getUserOrderById,
  requestReturn,
} = require("../models/orderModel");

// =====================================================
// STEP 4 : ORDER OPERATIONS
// =====================================================

const {
  notifySafe,
} = require("../services/notificationService");

const {
  getOrderWithDetails,
  createReturnRequest,
} = require("../models/orderOpsModel");

// =====================================================
// STEP 6 : BUSINESS ESSENTIALS
// =====================================================

const {
  calculateShipping,
} = require("../services/pincodeService");

const {
  calculateOrderTax,
} = require("../services/taxService");

// =====================================================
// HELPER: GET USER ID
// =====================================================

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?.user_id ||
    req.user?.userId ||
    null
  );
};

// =====================================================
// HELPER: EXPECTED DELIVERY DATE
// Default: 8 days from order date
// =====================================================

const getExpectedDeliveryDate = () => {
  const date = new Date();

  date.setDate(
    date.getDate() + 8
  );

  return date
    .toISOString()
    .split("T")[0];
};

// =====================================================
// HELPER: FORMAT DATE ONLY
// =====================================================

const formatDateOnly = (
  date
) => {
  if (!date) return null;

  const d = new Date(date);

  return d.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
    }
  );
};

// =====================================================
// HELPER: GET PRODUCT ID
// =====================================================

const getProductId = (
  item
) => {
  return (
    item.productId ??
    item.product_id ??
    item.id ??
    null
  );
};

// =====================================================
// CREATE ORDER
// POST /api/orders
// =====================================================

exports.placeOrder = async (
  req,
  res
) => {
  let connection;

  try {
    // =================================================
    // USER
    // =================================================

    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required",
      });
    }

    // =================================================
    // BODY
    // =================================================

    const {
      items,
      paymentMethod,
      addressId,
      address_id,
      couponDiscount,
      couponCode,
    } = req.body;

    // =================================================
    // VALIDATE ITEMS
    // =================================================

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Order items are required",
      });
    }

    // =================================================
    // ADDRESS
    // =================================================

    const finalAddressId =
      addressId ||
      address_id ||
      null;

    // =================================================
    // PAYMENT
    // =================================================

    const finalPaymentMethod =
      paymentMethod || "COD";

    // =================================================
    // ORDER NUMBER
    // =================================================

    const orderNumber =
      `AB-${Date.now()}-${Math.floor(
        1000 +
          Math.random() *
            9000
      )}`;

    // =================================================
    // EXPECTED DELIVERY DATE
    // =================================================

    const expectedDeliveryDate =
      getExpectedDeliveryDate();

    // =================================================
    // DATABASE
    // =================================================

    connection =
      db.promise();

    // =================================================
    // START TRANSACTION
    // =================================================

    await connection.beginTransaction();

    // =================================================
    // COMBINE DUPLICATE PRODUCTS
    // =================================================

    const groupedItems =
      new Map();

    for (
      const item of items
    ) {
      const productId =
        getProductId(item);

      const quantity = Number(
        item.quantity ??
          item.qty ??
          1
      );

      const size =
        item.size || null;

      const color =
        item.color || null;

      if (!productId) {
        throw new Error(
          "Product ID is required"
        );
      }

      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity <= 0
      ) {
        throw new Error(
          "Product quantity must be a positive whole number"
        );
      }

      const variantKey =
        `${productId}|${size || ""}|${color || ""}`;

      if (
        groupedItems.has(
          variantKey
        )
      ) {
        const existing =
          groupedItems.get(
            variantKey
          );

        existing.quantity +=
          quantity;
      } else {
        groupedItems.set(
          variantKey,
          {
            ...item,
            productId,
            quantity,
            size,
            color,
          }
        );
      }
    }

    const finalItems =
      Array.from(
        groupedItems.values()
      );

    // =================================================
    // VALIDATE PRODUCTS + STOCK
    // =================================================

    let calculatedSubtotal = 0;

    const validatedItems = [];

    for (
      const item of finalItems
    ) {
      const productId =
        item.productId;

      const quantity =
        Number(
          item.quantity
        );

      // -----------------------------------------------
      // LOCK PRODUCT ROW
      // -----------------------------------------------

      const [
        productRows,
      ] =
        await connection.execute(
          `
            SELECT
              id,
              name,
              description,
              price,
              image,
              category,
              stock
            FROM products
            WHERE id = ?
            FOR UPDATE
          `,
          [productId]
        );

      // -----------------------------------------------
      // PRODUCT NOT FOUND
      // -----------------------------------------------

      if (
        productRows.length ===
        0
      ) {
        throw new Error(
          `Product with ID ${productId} no longer exists.`
        );
      }

      const product =
        productRows[0];

      // -----------------------------------------------
      // STOCK
      // -----------------------------------------------

      const availableStock =
        Number(
          product.stock ?? 0
        );

      if (
        availableStock <= 0
      ) {
        throw new Error(
          `${product.name} is out of stock.`
        );
      }

      if (
        quantity >
        availableStock
      ) {
        throw new Error(
          `Only ${availableStock} item(s) of ${product.name} are available.`
        );
      }

      // -----------------------------------------------
      // DATABASE PRICE
      // -----------------------------------------------

      const databasePrice =
        Number(
          product.price ?? 0
        );

      if (
        databasePrice < 0
      ) {
        throw new Error(
          `Invalid price for ${product.name}.`
        );
      }

      // -----------------------------------------------
      // SUBTOTAL
      // -----------------------------------------------

      calculatedSubtotal +=
        databasePrice *
        quantity;

      // -----------------------------------------------
      // VALIDATED ITEM
      // -----------------------------------------------

      validatedItems.push({
        orderItem: {
          productId:
            product.id,

          productName:
            product.name,

          productImage:
            product.image,

          price:
            databasePrice,

          quantity,

          size:
            item.size || null,

          color:
            item.color || null,
        },

        productId:
          product.id,

        quantity,

        availableStock,

        // STEP 6 : GST ke liye category
        category: product.category,
      });
    }

    // =================================================
    // DELIVERY CHARGE + GST  (STEP 6)
    // =================================================

    // IMPORTANT:
    // Frontend delivery amount ko blindly trust nahi karna.
    //
    // STEP 6: Ab pincode/location based shipping + GST
    // backend pe calculate hota hai:
    //   1) Address (ya order ke shipping fields) se pincode
    //   2) Pincode se zone-wise shipping charge
    //   3) COD ho to COD extra charge
    //   4) Category + state ke hisaab se GST

    // -------------------------------------------------
    // PINCODE + STATE
    // (address table se, warna body ke shipping se)
    // -------------------------------------------------

    let destPincode = null;
    let destState = null;

    if (finalAddressId) {
      const [addressRows] =
        await connection.execute(
          `SELECT pincode, state FROM addresses WHERE id = ? LIMIT 1`,
          [finalAddressId]
        );

      if (addressRows.length > 0) {
        destPincode = addressRows[0].pincode;
        destState = addressRows[0].state;
      }
    }

    if (!destPincode && req.body?.shipping) {
      destPincode =
        req.body.shipping.pin ||
        req.body.shipping.pincode ||
        null;

      destState =
        destState || req.body.shipping.state || null;
    }

    // -------------------------------------------------
    // SHIPPING CHARGE
    // -------------------------------------------------

    const shippingQuote = calculateShipping({
      pincode: destPincode || "152128",
      subtotal: calculatedSubtotal,
      paymentMethod: finalPaymentMethod,
    });

    const finalDeliveryCharge =
      shippingQuote.serviceable
        ? shippingQuote.shippingCharge
        : 0;

    const finalCodCharge = shippingQuote.codCharge || 0;

    // -------------------------------------------------
    // GST
    // -------------------------------------------------

    const taxSummary = calculateOrderTax({
      items: validatedItems.map((item) => ({
        category: item.category,
        price: Number(item.orderItem?.price ?? 0),
        quantity: item.quantity,
      })),
      destState,
    });

    const finalTaxAmount = taxSummary.totalTaxAmount;

    // =================================================
    // FINAL TOTAL
    // =================================================

    const finalTotalAmount =
      calculatedSubtotal +
      finalDeliveryCharge +
      finalCodCharge +
      finalTaxAmount -
      (couponDiscount || 0);

    // =================================================
    // CREATE ORDER
    // =================================================

    const orderId =
      await createOrder(
        connection,
        {
          orderNumber,

          userId,

          status:
            "Order Placed",

          expectedDeliveryDate,

          subtotal:
            calculatedSubtotal,

          deliveryCharge:
            finalDeliveryCharge,

          codCharge: finalCodCharge,

          taxAmount: finalTaxAmount,

          taxRatePercent:
            validatedItems.length > 0
              ? Math.round(
                  (finalTaxAmount /
                    Math.max(calculatedSubtotal, 1)) *
                    100 *
                    100
                ) / 100
              : 0,

          cgstAmount: taxSummary.cgstAmount,

          sgstAmount: taxSummary.sgstAmount,

          igstAmount: taxSummary.igstAmount,

          shippingPincode: destPincode,

          shippingState: destState,

          shippingZone:
            shippingQuote.zone || null,

          couponDiscount: couponDiscount || 0,

          couponCode: couponCode || null,

          totalAmount:
            finalTotalAmount,

          paymentMethod:
            finalPaymentMethod,

          addressId:
            finalAddressId,
        }
      );

    // =================================================
    // CREATE ORDER ITEMS
    // =================================================

    for (
      const validatedItem of
        validatedItems
    ) {
      const {
        orderItem,
        productId,
        quantity,
      } =
        validatedItem;

      await createOrderItem(
        connection,
        {
          orderId,

          productId:
            orderItem.productId,

          productName:
            orderItem.productName,

          productImage:
            orderItem.productImage,

          price:
            orderItem.price,

          quantity:
            orderItem.quantity,

          size:
            orderItem.size,

          color:
            orderItem.color,
        }
      );

      // =================================================
      // REDUCE STOCK
      // =================================================

      const [
        stockUpdate,
      ] =
        await connection.execute(
          `
            UPDATE products
            SET stock = stock - ?
            WHERE id = ?
            AND stock >= ?
          `,
          [
            quantity,
            productId,
            quantity,
          ]
        );

      if (
        stockUpdate.affectedRows ===
        0
      ) {
        throw new Error(
          `Stock changed while placing the order for product ID ${productId}. Please try again.`
        );
      }
    }

    // =================================================
    // STATUS HISTORY
    // =================================================

    await createStatusHistory(
      connection,
      {
        orderId,

        status:
          "Order Placed",

        message:
          "Your order has been successfully placed.",
      }
    );

    // =================================================
    // COMMIT
    // =================================================

    await connection.commit();

    // =================================================
    // NOTIFICATION (EMAIL + SMS + WHATSAPP)
    // Order place hone par customer ko message jaata hai.
    // Ye block fail ho to bhi order fail nahi hoga.
    // =================================================

    try {
      const placedOrder = await getOrderWithDetails(
        orderId
      );

      if (placedOrder) {
        await notifySafe({
          event: "order_placed",

          order: placedOrder,

          user: {
            id: userId,
            email: placedOrder.customer_email,
            phone:
              placedOrder.customer_phone ||
              placedOrder.address?.phone,
          },
        });
      }
    } catch (notificationError) {
      console.error(
        "ORDER PLACED NOTIFICATION ERROR:",
        notificationError.message
      );
    }

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "Order placed successfully",

      order: {
        id:
          orderId,

        orderNumber:
          orderNumber,

        order_number:
          orderNumber,

        userId:
          userId,

        user_id:
          userId,

        status:
          "Order Placed",

        subtotal:
          calculatedSubtotal,

        deliveryCharge:
          finalDeliveryCharge,

        delivery_charge:
          finalDeliveryCharge,

        total:
          finalTotalAmount,

        totalAmount:
          finalTotalAmount,

        total_amount:
          finalTotalAmount,

        paymentMethod:
          finalPaymentMethod,

        payment_method:
          finalPaymentMethod,

        addressId:
          finalAddressId,

        address_id:
          finalAddressId,

        expectedDeliveryDate:
          expectedDeliveryDate,

        expected_delivery_date:
          expectedDeliveryDate,

        expectedDeliveryDateFormatted:
          formatDateOnly(
            expectedDeliveryDate
          ),
      },
    });
  } catch (error) {
    // =================================================
    // ROLLBACK
    // =================================================

    if (connection) {
      try {
        await connection.rollback();
      } catch (
        rollbackError
      ) {
        console.error(
          "ROLLBACK ERROR:",
          rollbackError
        );
      }
    }

    console.error(
      "PLACE ORDER ERROR:",
      error
    );

    // Product/stock validation error
    if (
      error.message &&
      (
        error.message.includes(
          "out of stock"
        ) ||
        error.message.includes(
          "available"
        ) ||
        error.message.includes(
          "no longer exists"
        ) ||
        error.message.includes(
          "Stock changed"
        )
      )
    ) {
      return res.status(409).json({
        success: false,
        message:
          error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to place order",
      error:
        error.message,
    });
  }
};

// =====================================================
// GET MY ORDERS
// GET /api/orders/my-orders
// =====================================================

exports.getMyOrders = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required",
      });
    }

    const orders =
      await getUserOrders(
        userId
      );

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "GET MY ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load orders",
      error:
        error.message,
    });
  }
};

// =====================================================
// GET SINGLE ORDER
// GET /api/orders/:id
// =====================================================

exports.getOrder = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    const orderId =
      Number(
        req.params.id
      );

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required",
      });
    }

    if (
      !orderId ||
      Number.isNaN(orderId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID",
      });
    }

    const order =
      await getUserOrderById(
        userId,
        orderId
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "GET SINGLE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load order",
      error:
        error.message,
    });
  }
};

// =====================================================
// CANCEL ORDER
// POST /api/orders/:id/cancel
// =====================================================

exports.cancelOrder = async (
  req,
  res
) => {
  let connection;

  try {
    const userId =
      getUserId(req);

    const orderId =
      Number(
        req.params.id
      );

    const reason =
      req.body?.reason ||
      req.body?.cancellationReason ||
      "Changed my mind";

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required",
      });
    }

    if (
      !orderId ||
      Number.isNaN(orderId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID",
      });
    }

    const order =
      await getUserOrderById(
        userId,
        orderId
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    const cancelableStatuses = [
      "Order Placed",
      "Confirmed",
      "Packed",
    ];

    if (
      !cancelableStatuses.includes(
        order.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Order cannot be cancelled when status is "${order.status}"`,
      });
    }

    connection =
      db.promise();

    await connection.beginTransaction();

    const [
      orderUpdate,
    ] =
      await connection.execute(
        `
          UPDATE orders
          SET
            status = 'Cancelled',
            cancellation_reason = ?,
            cancelled_at = NOW(),
            updated_at = NOW()
          WHERE
            id = ?
            AND user_id = ?
        `,
        [
          reason,
          orderId,
          userId,
        ]
      );

    if (
      orderUpdate.affectedRows ===
      0
    ) {
      throw new Error(
        "Order could not be cancelled"
      );
    }

    await connection.execute(
      `
        UPDATE order_items
        SET
          status = 'Cancelled'
        WHERE
          order_id = ?
      `,
      [orderId]
    );

    await createStatusHistory(
      connection,
      {
        orderId,

        status:
          "Cancelled",

        message:
          `Order cancelled by customer. Reason: ${reason}`,
      }
    );

    // =================================================
    // STOCK WAPAS ADD KARO
    // (Step 4 : order cancel hone par stock wapas)
    // =================================================

    const [cancelledItems] = await connection.execute(
      `
        SELECT
          id,
          product_id,
          quantity
        FROM order_items
        WHERE order_id = ?
      `,
      [orderId]
    );

    for (const item of cancelledItems) {
      if (!item.product_id) continue;

      await connection.execute(
        `
          UPDATE products
          SET stock = stock + ?
          WHERE id = ?
        `,
        [
          Number(item.quantity || 1),
          item.product_id,
        ]
      );
    }

    await connection.commit();

    // =================================================
    // CUSTOMER KO NOTIFY
    // =================================================

    try {
      const cancelledOrder = await getOrderWithDetails(
        orderId
      );

      if (cancelledOrder) {
        await notifySafe({
          event: "cancelled",

          order: {
            ...cancelledOrder,
            cancellation_reason: reason,
          },

          user: {
            id: userId,
            email: cancelledOrder.customer_email,
            phone:
              cancelledOrder.customer_phone ||
              cancelledOrder.address?.phone,
          },
        });
      }
    } catch (notificationError) {
      console.error(
        "CANCEL NOTIFICATION ERROR:",
        notificationError.message
      );
    }

    return res.status(200).json({
      success: true,

      message:
        "Order cancelled successfully",

      orderId,

      status:
        "Cancelled",

      cancellationReason:
        reason,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (
        rollbackError
      ) {
        console.error(
          "ROLLBACK ERROR:",
          rollbackError
        );
      }
    }

    console.error(
      "CANCEL ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel order",
      error:
        error.message,
    });
  }
};

// =====================================================
// RETURN ITEM
// POST /api/orders/:orderId/items/:itemId/return
// =====================================================

exports.returnOrderItem =
  async (
    req,
    res
  ) => {
    let connection;

    try {
      const userId =
        getUserId(req);

      const orderId =
        Number(
          req.params.orderId
        );

      const itemId =
        Number(
          req.params.itemId
        );

      const reason =
        req.body?.reason?.trim();

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "User authentication required",
        });
      }

      if (
        !orderId ||
        Number.isNaN(orderId) ||
        !itemId ||
        Number.isNaN(itemId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order or item ID",
        });
      }

      if (!reason) {
        return res.status(400).json({
          success: false,
          message:
            "Return reason is required",
        });
      }

      connection =
        db.promise();

      await connection.beginTransaction();

      const result =
        await requestReturn(
          connection,
          {
            userId,
            orderId,
            itemId,
            reason,
          }
        );

      // =================================================
      // STEP 4 : NAYE order_returns TABLE ME BHI ENTRY
      // (admin panel isi table se return dekhta hai)
      // =================================================

      let returnId = null;

      try {
        returnId = await createReturnRequest(
          connection,
          {
            orderId,
            orderItemId: result.itemId,
            userId,
            productId: result.productId,
            productName: result.productName,
            quantity: 1,
            reason,
          }
        );
      } catch (returnTableError) {
        console.error(
          "ORDER_RETURNS INSERT ERROR:",
          returnTableError.message
        );
      }

      await connection.commit();

      // =================================================
      // CUSTOMER KO NOTIFY
      // =================================================

      try {
        const orderDetails = await getOrderWithDetails(
          orderId
        );

        if (orderDetails) {
          await notifySafe({
            event: "return_requested",
            order: orderDetails,
            user: {
              id: userId,
              email: orderDetails.customer_email,
              phone:
                orderDetails.customer_phone ||
                orderDetails.address?.phone,
            },
            returnId,
          });
        }
      } catch (notificationError) {
        console.error(
          "RETURN REQUEST NOTIFICATION ERROR:",
          notificationError.message
        );
      }

      return res.status(200).json({
        success: true,

        message:
          "Return request submitted successfully",

        returnRequest:
          result,
      });
    } catch (error) {
      if (connection) {
        try {
          await connection.rollback();
        } catch (
          rollbackError
        ) {
          console.error(
            "ROLLBACK ERROR:",
            rollbackError
          );
        }
      }

      console.error(
        "RETURN ORDER ITEM ERROR:",
        error
      );

      return res.status(400).json({
        success: false,

        message:
          error.message ||
          "Failed to request return",
      });
    }
  };

// =====================================================
// GET ALL ORDERS
// =====================================================

exports.getAllOrders =
  async (
    req,
    res
  ) => {
    try {
      const [
        orders,
      ] =
        await db
          .promise()
          .execute(
            `
              SELECT
                o.id,
                o.order_number,
                o.user_id,
                o.status,
                o.total_amount,
                o.payment_method,
                o.payment_status,
                o.created_at,
                u.name AS customer_name,
                u.email AS customer_email
              FROM orders o
              INNER JOIN users u
                ON u.id = o.user_id
              ORDER BY o.created_at DESC
            `
          );

      return res.json({
        success: true,
        orders,
      });
    } catch (error) {
      console.error(
        "GET ALL ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load orders",
      });
    }
  };

// =====================================================
// UPDATE ORDER STATUS
// =====================================================

exports.updateOrderStatus =
  async (
    req,
    res
  ) => {
    const orderId =
      Number(
        req.params.id
      );

    const {
      status,
    } = req.body;

    const allowedStatuses = [
      "Order Placed",
      "Confirmed",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (
      !Number.isInteger(
        orderId
      ) ||
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order status",
      });
    }

    try {
      const [
        result,
      ] =
        await db
          .promise()
          .execute(
            `
              UPDATE orders
              SET status = ?
              WHERE id = ?
            `,
            [
              status,
              orderId,
            ]
          );

      if (
        !result.affectedRows
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      await db
        .promise()
        .execute(
          `
            INSERT INTO order_status_history
            (
              order_id,
              status,
              message
            )
            VALUES (?, ?, ?)
          `,
          [
            orderId,
            status,
            `Order status updated to ${status} by admin.`,
          ]
        );

      // =================================================
      // STEP 4 : ITEM STATUS + DATE FIELDS
      // =================================================

      await db
        .promise()
        .execute(
          `
            UPDATE order_items
            SET status = ?
            WHERE order_id = ?
              AND status NOT IN ('Returned', 'Cancelled')
          `,
          [status, orderId]
        );

      if (status === "Delivered") {
        await db.promise().execute(
          `
            UPDATE orders
            SET delivered_at = COALESCE(delivered_at, NOW())
            WHERE id = ?
          `,
          [orderId]
        );
      }

      if (status === "Shipped") {
        await db.promise().execute(
          `
            UPDATE orders
            SET shipped_at = COALESCE(shipped_at, NOW())
            WHERE id = ?
          `,
          [orderId]
        );
      }

      // =================================================
      // STEP 4 : CUSTOMER KO NOTIFY
      // (email + sms + whatsapp)
      // =================================================

      const notificationEventByStatus = {
        Confirmed: "order_confirmed",
        Processing: "order_confirmed",
        Packed: "order_packed",
        Shipped: "order_shipped",
        "Out for Delivery": "out_for_delivery",
        Delivered: "delivered",
        Cancelled: "cancelled",
      };

      const eventName =
        notificationEventByStatus[status];

      if (eventName) {
        try {
          const orderDetails =
            await getOrderWithDetails(orderId);

          if (orderDetails) {
            await notifySafe({
              event: eventName,

              order: orderDetails,

              user: {
                id: orderDetails.user_id,

                email: orderDetails.customer_email,

                phone:
                  orderDetails.customer_phone ||
                  orderDetails.address?.phone,
              },
            });
          }
        } catch (notificationError) {
          console.error(
            "STATUS UPDATE NOTIFICATION ERROR:",
            notificationError.message
          );
        }
      }

      return res.json({
        success: true,
        message:
          "Order status updated",
        status,
      });
    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update order status",
      });
    }
  };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  placeOrder:
    exports.placeOrder,

  getMyOrders:
    exports.getMyOrders,

  getOrder:
    exports.getOrder,

  cancelOrder:
    exports.cancelOrder,

  returnOrderItem:
    exports.returnOrderItem,

  getAllOrders:
    exports.getAllOrders,

  updateOrderStatus:
    exports.updateOrderStatus,
};
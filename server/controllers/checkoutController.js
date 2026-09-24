const {
  checkPincodeServiceability,
  calculateShipping,
} = require("../services/pincodeService");
const { calculateOrderTax } = require("../services/taxService");

// =====================================================
// APPLE BLOSSOM
// STEP 6 : CHECKOUT CONTROLLER
//
// PUBLIC
//   GET /api/checkout/pincode/:pin  -> serviceability check
//
// USER (auth)
//   POST /api/checkout/quote        -> shipping + GST + total
// =====================================================

const promiseDb = () => require("../config/db").promise();

// -----------------------------------------------------
// HELPER : ADDRESS ID SE PINCODE + STATE NIKALO
// -----------------------------------------------------
const getAddressById = async (addressId) => {
  if (!addressId) return null;

  const [rows] = await promiseDb().execute(
    `SELECT pincode, state, city FROM addresses WHERE id = ? LIMIT 1`,
    [addressId]
  );

  return rows[0] || null;
};

// =====================================================
// PUBLIC : PINCODE CHECK
// GET /api/checkout/pincode/:pin
// =====================================================

exports.checkPincode = async (req, res) => {
  try {
    const pincode = String(req.params.pin || "").trim();

    const result = checkPincodeServiceability(pincode);

    return res.json({
      success: result.serviceable,
      ...result,
    });
  } catch (error) {
    console.error("PINCODE CHECK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check pincode",
    });
  }
};

// =====================================================
// USER : SHIPPING + TAX QUOTE
// POST /api/checkout/quote
// body: {
//   items: [{productId, quantity}],
//   addressId? / address_id?,
//   pincode?, state?, paymentMethod?
// }
// =====================================================

exports.getQuote = async (req, res) => {
  try {
    const {
      items,
      addressId,
      address_id,
      pincode,
      state,
      paymentMethod,
    } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required for a quote",
      });
    }

    // -------------------------------------------------
    // PINCODE / STATE : body ya address table se
    // -------------------------------------------------

    const finalAddressId = addressId || address_id || null;

    let destPincode = pincode || null;
    let destState = state || null;

    if ((!destPincode || !destState) && finalAddressId) {
      const address = await getAddressById(finalAddressId);

      if (address) {
        destPincode = destPincode || address.pincode;
        destState = destState || address.state;
      }
    }

    if (!destPincode) {
      return res.status(400).json({
        success: false,
        message: "Pincode or addressId is required",
      });
    }

    // -------------------------------------------------
    // PRODUCTS : DB PRICES
    // (frontend ke prices trust nahi karte)
    // -------------------------------------------------

    const quoteItems = [];

    for (const item of items) {
      const productId =
        item.productId ?? item.product_id ?? item.id ?? null;

      const quantity = Math.max(
        1,
        Number(item.quantity ?? item.qty ?? 1)
      );

      if (!productId) continue;

      const [rows] = await promiseDb().execute(
        `SELECT id, name, price, category
         FROM products
         WHERE id = ? LIMIT 1`,
        [productId]
      );

      if (rows.length === 0) continue;

      const product = rows[0];

      quoteItems.push({
        productId: product.id,
        name: product.name,
        category: product.category,
        price: Number(product.price),
        quantity,
      });
    }

    if (quoteItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid products found for a quote",
      });
    }

    const calculatedSubtotal = quoteItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // -------------------------------------------------
    // SHIPPING
    // -------------------------------------------------

    const shipping = calculateShipping({
      pincode: destPincode,
      subtotal: calculatedSubtotal,
      paymentMethod,
    });

    if (!shipping.serviceable) {
      return res.json({
        success: false,
        message: shipping.message,
        serviceable: false,
        reason: shipping.reason,
      });
    }

    // -------------------------------------------------
    // GST
    // -------------------------------------------------

    const tax = calculateOrderTax({
      items: quoteItems,
      destState,
    });

    // -------------------------------------------------
    // TOTAL
    // -------------------------------------------------

    const total =
      calculatedSubtotal +
      shipping.shippingCharge +
      shipping.codCharge +
      tax.totalTaxAmount;

    return res.json({
      success: true,
      serviceable: true,
      quote: {
        subtotal:
          Math.round(calculatedSubtotal * 100) / 100,

        shipping: {
          zone: shipping.zone,
          zoneLabel: shipping.zoneLabel,
          charge: shipping.shippingCharge,
          codCharge: shipping.codCharge,
          freeShippingApplied:
            shipping.freeShippingApplied,
          etaDays: shipping.etaDays,
          estimatedDeliveryText:
            shipping.estimatedDeliveryText,
        },

        tax: {
          enabled: tax.enabled,
          isIntraState: tax.isIntraState,
          rateSummary:
            tax.cgstAmount > 0
              ? "CGST + SGST"
              : "IGST",
          cgstAmount: tax.cgstAmount,
          sgstAmount: tax.sgstAmount,
          igstAmount: tax.igstAmount,
          totalTaxAmount: tax.totalTaxAmount,
        },

        total: Math.round(total * 100) / 100,
      },
    });
  } catch (error) {
    console.error("CHECKOUT QUOTE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to calculate quote",
    });
  }
};

module.exports = {
  checkPincode: exports.checkPincode,
  getQuote: exports.getQuote,
};

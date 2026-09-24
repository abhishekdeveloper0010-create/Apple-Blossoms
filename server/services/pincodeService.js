const {
  shippingRatesConfig,
  getZoneForPincode,
} = require("../config/shippingRates");
const { round2 } = require("./taxService");

// =====================================================
// APPLE BLOSSOM
// STEP 6 : PINCODE VALIDATION + SHIPPING CALCULATOR
// =====================================================

// -----------------------------------------------------
// FORMAT CHECK : 6 digits, pehla digit 1-8/9
// (India me 0 aur 1-... pincodes exist nahi karte,
//  lekin 9 Army PO ke liye allowed hai)
// -----------------------------------------------------
const isValidPincodeFormat = (pincode) => {
  const pin = String(pincode || "").trim();

  return /^[1-9][0-9]{5}$/.test(pin);
};

// -----------------------------------------------------
// SERVICEABILITY + ZONE + RATE
// -----------------------------------------------------
const checkPincodeServiceability = (pincode) => {
  const pin = String(pincode || "").trim();

  // 1) FORMAT
  if (!isValidPincodeFormat(pin)) {
    return {
      serviceable: false,
      reason: "invalid_format",
      message:
        "Please enter a valid 6-digit Indian pincode.",
    };
  }

  // 2) BLACKLIST
  const blocked =
    shippingRatesConfig.unserviceablePrefixes.some(
      (prefix) =>
        pin.startsWith(prefix)
    );

  if (blocked) {
    return {
      serviceable: false,
      reason: "unserviceable",
      message:
        "Sorry, we do not deliver to this pincode yet.",
    };
  }

  // 3) ZONE
  const zone = getZoneForPincode(pin);

  if (!zone) {
    return {
      serviceable: false,
      reason: "unknown_zone",
      message:
        "We could not determine a delivery zone for this pincode.",
    };
  }

  const rate = shippingRatesConfig.rates[zone];

  // Punjab state check (pin prefix 1 + store state match)
  // Punjab pincodes: 140xxx - 160xxx roughly.
  // Simple rule: prefix 1 => SAME_STATE, LOCAL alag se pakda gaya.
  const isSameState = zone === "SAME_STATE" || pin.startsWith("1");

  return {
    serviceable: true,
    pincode: pin,
    zone,
    zoneLabel: rate.label,
    shippingCharge: rate.charge,
    etaDays: rate.etaDays,
    estimatedDeliveryText: `${rate.etaDays} ${
      rate.etaDays === 1 ? "day" : "days"
    }`,
    codAvailable: true,
    isSameState,
  };
};

// -----------------------------------------------------
// FULL SHIPPING QUOTE (zone charge + COD fee + free shipping)
// -----------------------------------------------------
const calculateShipping = ({
  pincode,
  subtotal = 0,
  paymentMethod = "prepaid",
}) => {
  const check = checkPincodeServiceability(pincode);

  if (!check.serviceable) {
    return {
      ...check,
      shippingCharge: 0,
      codCharge: 0,
      freeShippingApplied: false,
    };
  }

  let shippingCharge = check.shippingCharge;

  // Free shipping threshold
  const freeShippingApplied =
    Number(subtotal) >=
    shippingRatesConfig.freeShippingThreshold;

  if (freeShippingApplied) {
    shippingCharge = 0;
  }

  // COD extra charge
  const method = String(paymentMethod || "").toLowerCase();
  const isCod =
    method === "cod" || method.includes("cash");

  const codCharge =
    isCod && shippingRatesConfig.codExtraCharge > 0
      ? shippingRatesConfig.codExtraCharge
      : 0;

  return {
    ...check,
    shippingCharge: round2(shippingCharge),
    codCharge,
    freeShippingApplied,
  };
};

module.exports = {
  isValidPincodeFormat,
  checkPincodeServiceability,
  calculateShipping,
  round2,
};

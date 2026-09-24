require("dotenv").config();

// =====================================================
// APPLE BLOSSOM
// STEP 6 : LOCATION-WISE SHIPPING RATES
//
// Store Abohar (Punjab - 152128) se ship hota hai.
// Pincode ke first digit se zone decide hota hai:
//
//   1 (Punjab/HR/HP/J&K...)  -> SAME_STATE / NORTH
//   2 (UP/UK/DEL/RAJ...)     -> NORTH
//   3 (GJ/MP/CG/CHH...)      -> WEST
//   4 (MH/GOA...)            -> WEST
//   5 (TG/AP/KA/TN/KL...)    -> SOUTH
//   6 (WB/OD/NE/JH...)       -> EAST / NORTH-EAST
//   7-8 (serviceability mix) -> REMOTE
//   9 (APO/APD Army)         -> REMOTE
// =====================================================

const FREE_SHIPPING_THRESHOLD = Number(
  process.env.FREE_SHIPPING_THRESHOLD || 999
);

const COD_EXTRA_CHARGE = Number(
  process.env.COD_EXTRA_CHARGE || 40
);

// Ye pincodes / prefixes par delivery nahi karte
const UNSERVICEABLE_PREFIXES = (
  process.env.UNSERVICEABLE_PINCODES || ""
)
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);

// Intra-state local city (Abohar area)
const LOCAL_PINCODES = (
  process.env.LOCAL_PINCODES || "152128"
)
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);

const shippingRatesConfig = {
  storeState: process.env.STORE_STATE || "Punjab",

  rates: {
    LOCAL: {
      charge: Number(process.env.SHIP_LOCAL || 30),
      etaDays: 2,
      label: "Local (Abohar)",
    },
    SAME_STATE: {
      charge: Number(process.env.SHIP_SAME_STATE || 40),
      etaDays: 3,
      label: "Punjab",
    },
    NORTH: {
      charge: Number(process.env.SHIP_NORTH || 60),
      etaDays: 5,
      label: "North India",
    },
    WEST: {
      charge: Number(process.env.SHIP_WEST || 70),
      etaDays: 6,
      label: "West India",
    },
    SOUTH: {
      charge: Number(process.env.SHIP_SOUTH || 90),
      etaDays: 7,
      label: "South India",
    },
    EAST: {
      charge: Number(process.env.SHIP_EAST || 90),
      etaDays: 7,
      label: "East India",
    },
    REMOTE: {
      charge: Number(process.env.SHIP_REMOTE || 120),
      etaDays: 9,
      label: "Remote / North-East",
    },
  },

  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  codExtraCharge: COD_EXTRA_CHARGE,
  unserviceablePrefixes: UNSERVICEABLE_PREFIXES,
  localPincodes: LOCAL_PINCODES,
};

// -----------------------------------------------------
// PINCODE -> ZONE
// -----------------------------------------------------
const getZoneForPincode = (pincode) => {
  const pin = String(pincode || "").trim();

  // Local area
  if (
    shippingRatesConfig.localPincodes.some(
      (p) => pin === p || pin.startsWith(p)
    )
  ) {
    return "LOCAL";
  }

  const prefix = pin.charAt(0);

  const zoneMap = {
    1: "NORTH", // Punjab etc. (SAME_STATE alag se handle hota hai)
    2: "NORTH",
    3: "WEST",
    4: "WEST",
    5: "SOUTH",
    6: "EAST",
    7: "REMOTE",
    8: "REMOTE",
    9: "REMOTE",
  };

  return zoneMap[prefix] || null;
};

module.exports = {
  shippingRatesConfig,
  getZoneForPincode,
};

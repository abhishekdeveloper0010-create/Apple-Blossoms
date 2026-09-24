require("dotenv").config();

// =====================================================
// APPLE BLOSSOM
// STEP 6 : GST TAX CONFIG
//
// Store Abohar (Punjab) me hai:
//   - Punjab ke andar delivery  -> CGST + SGST (split)
//   - Baaki states              -> IGST
//
// Apparel GST slabs (current India rules):
//   - Garment Rs 2500 tak   -> 5%
//   - Garment Rs 2500 se up -> 18%
// Env se override bhi kar sakte hain.
// =====================================================

const taxConfig = {
  // GST enabled ya nahi (testing ke liye off kar sakte hain)
  enabled:
    String(process.env.GST_ENABLED || "true").toLowerCase() ===
    "true",

  // Jis state se shipping hoti hai (store location)
  storeState:
    process.env.STORE_STATE || "Punjab",

  // Store GSTIN (invoice me print hota hai)
  gstin: process.env.STORE_GSTIN || "",

  // Legal / trade name (invoice header)
  legalName:
    process.env.STORE_LEGAL_NAME || "Apple Blossom",

  // Default slab rate (%), jab product ka koi tax rate na ho
  defaultRatePercent: Number(
    process.env.GST_DEFAULT_RATE || 5
  ),

  // Apparel slab threshold (Rs) aur uske upar ka rate (%)
  apparelSlabThreshold: Number(
    process.env.GST_APPAREL_THRESHOLD || 2500
  ),
  apparelLowerRate: Number(
    process.env.GST_APPAREL_LOWER_RATE || 5
  ),
  apparelUpperRate: Number(
    process.env.GST_APPAREL_UPPER_RATE || 18
  ),

  // Beauty / cosmetics ka slab (default 18%)
  beautyRate: Number(process.env.GST_BEAUTY_RATE || 18),

  // HSN codes (invoice + slab detect karne ke kaam aate hain)
  hsn: {
    garment: process.env.GST_HSN_GARMENT || "6204",
    footwear: process.env.GST_HSN_FOOTWEAR || "6404",
    beauty: process.env.GST_HSN_BEAUTY || "3304",
    accessory: process.env.GST_HSN_ACCESSORY || "7117",
  },
};

// =====================================================
// GST RATE NIKALO (product category + price ke hisaab se)
// =====================================================

const getRatePercentForProduct = (product) => {
  const category = String(
    product?.category || product?.category_name || ""
  ).toLowerCase();

  const price = Number(
    product?.price ?? product?.unit_price ?? 0
  );

  // Beauty / cosmetics -> 18%
  if (category.includes("beauty") || category.includes("cosmetic")) {
    return taxConfig.beautyRate;
  }

  // Footwear bhi apparel slab follow karta hai
  if (
    category.includes("shoe") ||
    category.includes("slipper") ||
    category.includes("footwear")
  ) {
    return price <= taxConfig.apparelSlabThreshold
      ? taxConfig.apparelLowerRate
      : taxConfig.apparelUpperRate;
  }

  // Garments (shirts / dresses) + accessories -> slab
  return price <= taxConfig.apparelSlabThreshold
    ? taxConfig.apparelLowerRate
    : taxConfig.apparelUpperRate;
};

const isTaxEnabled = () => taxConfig.enabled;

module.exports = {
  taxConfig,
  getRatePercentForProduct,
  isTaxEnabled,
};

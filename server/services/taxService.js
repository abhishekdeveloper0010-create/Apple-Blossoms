const {
  taxConfig,
  getRatePercentForProduct,
  isTaxEnabled,
} = require("../config/tax");

// =====================================================
// APPLE BLOSSOM
// STEP 6 : GST TAX SERVICE
//
// Rules:
//   - Intra-state (Punjab -> Punjab) : CGST 50% + SGST 50%
//   - Inter-state                    : IGST 100%
//   - Har line pe round (paise level)
// =====================================================

const round2 = (value) => {
  return Math.round(Number(value || 0) * 100) / 100;
};

// -----------------------------------------------------
// Ek line item ka tax calculate karo
// -----------------------------------------------------
const computeLineTax = ({ product, quantity, destState }) => {
  const unitPrice = Number(
    product?.price ?? product?.unit_price ?? 0
  );

  const qty = Math.max(0, Number(quantity || 0));

  const lineAmount = round2(unitPrice * qty);

  // Tax disabled -> zero return
  if (!isTaxEnabled()) {
    return {
      ratePercent: 0,
      taxableAmount: lineAmount,
      taxAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      isIntraState: false,
    };
  }

  const ratePercent = getRatePercentForProduct({
    category: product?.category,
    price: unitPrice,
  });

  // Inter-state check (case-insensitive)
  const dest = String(destState || "").trim().toLowerCase();
  const store = String(taxConfig.storeState || "")
    .trim()
    .toLowerCase();

  const isIntraState = Boolean(dest) && dest === store;

  const taxAmount = round2((lineAmount * ratePercent) / 100);

  return {
    ratePercent,
    taxableAmount: lineAmount,
    taxAmount,
    cgstAmount: isIntraState ? round2(taxAmount / 2) : 0,
    sgstAmount: isIntraState ? round2(taxAmount - taxAmount / 2) : 0,
    igstAmount: isIntraState ? 0 : taxAmount,
    isIntraState,
  };
};

// -----------------------------------------------------
// Poori cart ka tax summary
// items: [{ category, price, quantity }]
// -----------------------------------------------------
const calculateOrderTax = ({ items = [], destState }) => {
  const result = {
    enabled: isTaxEnabled(),
    storeState: taxConfig.storeState,
    gstin: taxConfig.gstin,
    isIntraState: false,
    taxableAmount: 0,
    totalTaxAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    lines: [],
  };

  for (const item of items) {
    const line = computeLineTax({
      product: item,
      quantity: item.quantity,
      destState,
    });

    result.taxableAmount += line.taxableAmount;
    result.totalTaxAmount += line.taxAmount;
    result.cgstAmount += line.cgstAmount;
    result.sgstAmount += line.sgstAmount;
    result.igstAmount += line.igstAmount;

    result.lines.push(line);
  }

  result.taxableAmount = round2(result.taxableAmount);
  result.totalTaxAmount = round2(result.totalTaxAmount);
  result.cgstAmount = round2(result.cgstAmount);
  result.sgstAmount = round2(result.sgstAmount);
  result.igstAmount = round2(result.igstAmount);

  result.isIntraState =
    result.cgstAmount > 0 || result.sgstAmount > 0;

  return result;
};

module.exports = {
  calculateOrderTax,
  computeLineTax,
  round2,
};

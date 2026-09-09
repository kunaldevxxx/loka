/**
 * server/src/lib/pricing.js
 * Source of truth for price calculations
 *
 * Business Rules:
 * - Quantity is coerced to a positive integer, minimum 1.
 * - Unit price = menu base price + selected size extra + parsed milk extra + allowed add-on prices.
 * - Size and add-on labels are matched to the authoritative menu item; unrecognized labels add nothing.
 * - Milk price is parsed only from a label in the form `(+₹N)`.
 * - Subtotal = sum of item line totals.
 * - GST = round(subtotal × 5%).
 * - Returning visitors receive round(subtotal × 5%) loyalty discount.
 * - Total = subtotal + GST − loyalty discount.
 */

/**
 * Parses milk extra price from label like "(+₹40)", "(+₹30)", "(+Rs.40)"
 * @param {string|null|undefined} milkLabel 
 * @returns {number}
 */
export function parseMilkPrice(milkLabel) {
  if (!milkLabel || typeof milkLabel !== 'string') return 0;
  const match = milkLabel.match(/\(\+[₹Rs.]*\s*(\d+)\)/);
  if (match && match[1]) {
    return parseInt(match[1], 10) || 0;
  }
  return 0;
}

/**
 * Calculates pricing for an order
 * @param {Array} requestedItems - [{ itemId, qty, customization }]
 * @param {Array|Object} menuCatalog - List of authoritative menu items or lookup map
 * @param {boolean} isReturning - Whether patron is returning visitor
 * @returns {Object} Calculated pricing breakdown
 */
export function calculatePricing(requestedItems, menuCatalog, isReturning = false) {
  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    throw new Error('Order items cannot be empty');
  }

  // Create fast lookup map from array or use object directly
  const menuMap = Array.isArray(menuCatalog)
    ? new Map(menuCatalog.map((item) => [item.itemId, item]))
    : new Map(Object.entries(menuCatalog));

  let subtotal = 0;
  const processedItems = [];

  for (const reqItem of requestedItems) {
    if (!reqItem || !reqItem.itemId) {
      throw new Error('Invalid item request: missing itemId');
    }

    const menuItem = menuMap.get(reqItem.itemId);
    if (!menuItem) {
      throw new Error(`Unknown menu item: ${reqItem.itemId}`);
    }

    // 1. Quantity is coerced to a positive integer, minimum 1
    const qty = Math.max(1, Math.floor(Number(reqItem.qty) || 1));

    // Base menu price
    const basePrice = Number(menuItem.price) || 0;
    let sizeExtra = 0;
    let milkExtra = 0;
    let addOnsExtra = 0;

    const customization = reqItem.customization || {};
    const summaryParts = [];

    // 2. Size label matched to authoritative menu item; unrecognized adds nothing
    if (customization.size && Array.isArray(menuItem.sizes)) {
      const matchedSize = menuItem.sizes.find(
        (s) => s.label && s.label.trim().toLowerCase() === String(customization.size).trim().toLowerCase()
      );
      if (matchedSize) {
        sizeExtra = Number(matchedSize.extra) || 0;
        summaryParts.push(matchedSize.label);
      }
    }

    // 3. Milk price is parsed only from label in the form `(+₹N)`
    if (customization.milk) {
      const matchedMilk = Array.isArray(menuItem.milkOptions)
        ? menuItem.milkOptions.find(
            (m) => m && m.trim().toLowerCase() === String(customization.milk).trim().toLowerCase()
          )
        : null;

      const targetLabel = matchedMilk || customization.milk;
      milkExtra = parseMilkPrice(targetLabel);
      if (matchedMilk) {
        summaryParts.push(matchedMilk);
      }
    }

    // 4. Add-on labels matched to authoritative menu item; unrecognized adds nothing
    const matchedAddOns = [];
    if (Array.isArray(customization.addOns) && Array.isArray(menuItem.addOns)) {
      for (const addonReq of customization.addOns) {
        const addonLabel = typeof addonReq === 'string' ? addonReq : addonReq?.label;
        if (!addonLabel) continue;

        const matched = menuItem.addOns.find(
          (a) => a.label && a.label.trim().toLowerCase() === String(addonLabel).trim().toLowerCase()
        );
        if (matched) {
          addOnsExtra += Number(matched.price) || 0;
          matchedAddOns.push(matched.label);
          summaryParts.push(matched.label);
        }
      }
    }

    // Unit price = menu base price + selected size extra + parsed milk extra + allowed add-on prices
    const unitPrice = basePrice + sizeExtra + milkExtra + addOnsExtra;
    const lineTotal = unitPrice * qty;

    subtotal += lineTotal;

    processedItems.push({
      itemId: menuItem.itemId,
      name: menuItem.name,
      qty,
      unitPrice,
      lineTotal,
      customization: {
        size: customization.size || null,
        milk: customization.milk || null,
        addOns: matchedAddOns
      },
      customizationSummary: summaryParts.length > 0 ? summaryParts.join(', ') : ''
    });
  }

  // GST = round(subtotal × 5%)
  const gst = Math.round(subtotal * 0.05);

  // Returning visitors receive round(subtotal × 5%) loyalty discount
  const loyaltyDiscount = isReturning ? Math.round(subtotal * 0.05) : 0;

  // Total = subtotal + GST − loyalty discount
  const total = subtotal + gst - loyaltyDiscount;

  // Loyalty points earned: floor(total / 10)
  const pointsEarned = Math.floor(total / 10);

  return {
    items: processedItems,
    subtotal,
    gst,
    loyaltyDiscount,
    total,
    pointsEarned,
    isReturning
  };
}

export default {
  parseMilkPrice,
  calculatePricing
};

const FREE_SHIPPING_THRESHOLD = 1500;
const FLAT_SHIPPING_FEE = 75;

export function effectiveVariantPrice(
  variant: { priceOverride: number | null },
  product: { basePrice: number },
): number {
  return variant.priceOverride ?? product.basePrice;
}

export function calcSubtotal(items: { unitPrice: number; quantity: number }[]): number {
  const cents = items.reduce((sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity, 0);
  return cents / 100;
}

export function calcShippingFee(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
}

const CHARGEABLE_CANVAS_TYPES = new Set(["i-text", "text", "textbox", "image"]);

/** How many print-worthy elements (text blocks, images -- each one added via the designer's
 *  "Add to canvas" action or an upload/library pick) are in a saved design's canvasJson. This is
 *  what customizationSurcharge actually charges for, not just "this side has something on it". */
export function countDesignElements(canvasJson: string): number {
  let parsed: unknown;
  try {
    parsed = JSON.parse(canvasJson);
  } catch {
    return 0;
  }
  const objects = (parsed as { objects?: unknown[] } | null)?.objects;
  if (!Array.isArray(objects)) return 0;
  return objects.filter((raw) => CHARGEABLE_CANVAS_TYPES.has(String((raw as { type?: string })?.type ?? "").toLowerCase()))
    .length;
}

/** +surchargeEgp per customization element (each text block or uploaded/library image), summed
 *  across both sides -- not a flat per-side fee, so a shirt with three design elements on it
 *  costs more than one with a single small logo. */
export function customizationSurcharge(frontElementCount: number, backElementCount: number, surchargeEgp: number): number {
  return (frontElementCount + backElementCount) * surchargeEgp;
}

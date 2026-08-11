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

/** +surchargeEgp per printed side (front and back are priced independently). */
export function customizationSurcharge(hasFront: boolean, hasBack: boolean, surchargeEgp: number): number {
  return (hasFront ? surchargeEgp : 0) + (hasBack ? surchargeEgp : 0);
}

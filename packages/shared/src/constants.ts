export const DEFAULT_SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const FREE_SHIPPING_THRESHOLD_EGP = 1500;
export const FLAT_SHIPPING_FEE_EGP = 75;

/** Flat-rate, subtotal-only -- never depends on address/governorate -- so it's exactly knowable
 *  (not just estimable) anywhere the subtotal is, including the cart before checkout even starts.
 *  Single source of truth for both the API (order.service.ts) and the storefront (CartPage). */
export function calcShippingFee(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD_EGP ? 0 : FLAT_SHIPPING_FEE_EGP;
}

export const CANVAS_PX_PER_CM = 12;

export const MAX_UPLOAD_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_DESIGN_PREVIEW_BYTES = 6 * 1024 * 1024;
export const MAX_FONT_FILE_BYTES = 4 * 1024 * 1024;

export const ACCEPTED_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const ACCEPTED_FONT_MIME_TYPES = [
  "font/ttf",
  "font/otf",
  "font/woff",
  "font/woff2",
  "application/font-woff",
  "application/octet-stream",
] as const;

export const DEFAULT_SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"] as const;

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

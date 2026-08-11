/**
 * Placeholder garment artwork for the designer canvas, until real product photography replaces
 * it. Drawn on the same 100x116 reference frame as the designer canvas (see
 * @d-shirtak/shared's canvas-frame.ts, the single source of truth for CANVAS_WIDTH/HEIGHT and
 * TORSO_FRAME) so cm-based print-area/measurement data lines up with the artwork.
 *
 * TORSO_FRAME is each garment shape's FIXED printable-torso rectangle in that frame —
 * independent of the customer-facing chest/length/waist measurements for a given size. Real
 * garments come in different real-world sizes but are photographed once; only the *print area*
 * (how big a design can be) should grow with size, not where the torso sits in the photo. Print
 * area offsets must be computed against TORSO_FRAME, never against a size's chestWidthCm — that
 * was the bug that put the print-area guide over the sleeve instead of the chest.
 *
 * Shared by prisma/seed.ts (fresh installs) and prisma/fix-existing-mockups.ts (patching an
 * already-seeded database in place without losing orders/designs/users).
 */
import { TORSO_FRAME, type GarmentType } from "@d-shirtak/shared";

export interface PrintAreaCm {
  widthCm: number;
  heightCm: number;
  offsetXCm: number;
  offsetYCm: number;
}

/** Centers a print area of the given size within the garment's fixed torso frame (see
 *  TORSO_FRAME) — never within the size's own chestWidthCm, which is a body measurement, not a
 *  photo-space coordinate. */
export function centeredPrintArea(kind: GarmentType, widthCm: number, heightCm: number, topCm: number): PrintAreaCm {
  const torso = TORSO_FRAME[kind];
  return { widthCm, heightCm, offsetXCm: torso.left + (torso.width - widthCm) / 2, offsetYCm: topCm };
}

export const TEE_BODY_PATH = `
  M 42 10 Q 50 19 58 10 Q 66 7 70 8 Q 84 12 91 22 L 89 31 Q 80 27 71 33
  L 71 107 Q 71 110 68 110 L 32 110 Q 29 110 29 107 L 29 33
  Q 20 27 11 31 L 9 22 Q 16 12 30 8 Q 33 6 42 10 Z
`;
export const HOODIE_BODY_PATH = `
  M 32 22 Q 20 24 10 32 L 9 40 Q 20 36 27 42 L 27 108 Q 27 111 30 111
  L 70 111 Q 73 111 73 108 L 73 42 Q 80 36 91 40 L 90 32 Q 80 24 68 22
  Q 66 21 64 19 Q 58 12 50 12 Q 42 12 36 19 Q 34 21 32 22 Z
`;

const LIGHT_HEX = ["#f8fafc", "#ffffff", "#e5e7eb", "#e3c7a0"];

export function garmentSvg(kind: GarmentType, side: "front" | "back", hex: string): string {
  const body = kind === "TEE" ? TEE_BODY_PATH : HOODIE_BODY_PATH;
  const isLight = LIGHT_HEX.includes(hex.toLowerCase());
  const shade = isLight ? "#00000012" : "#ffffff14";
  const shadeStrong = isLight ? "#00000040" : "#ffffff55";
  const outline = isLight ? "#00000055" : "#00000030";
  const label = side === "front" ? "FRONT" : "BACK";

  let hoodieDetail = "";
  if (kind === "HOODIE") {
    hoodieDetail += `<path d="M 39 18 Q 50 27 61 18" fill="none" stroke="${shade}" stroke-width="1.8" stroke-linecap="round"/>`;
    hoodieDetail += `<path d="M 36 19 Q 50 30 64 19" fill="none" stroke="${outline}" stroke-width="0.5"/>`;
    if (side === "front") {
      hoodieDetail += `<path d="M 44 15 Q 43 22 41 30" stroke="${shadeStrong}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
      hoodieDetail += `<path d="M 56 15 Q 57 22 59 30" stroke="${shadeStrong}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
      hoodieDetail += `<circle cx="41" cy="31" r="1.3" fill="${shadeStrong}"/>`;
      hoodieDetail += `<circle cx="59" cy="31" r="1.3" fill="${shadeStrong}"/>`;
      hoodieDetail += `<path d="M 36 66 L 64 66 L 60 84 L 40 84 Z" fill="none" stroke="${outline}" stroke-width="0.6"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 116" width="900" height="1044">
    <rect width="100" height="116" fill="#f4f4f5" />
    <path d="${body}" fill="${hex}" stroke="${outline}" stroke-width="0.5" />
    <path d="${body}" fill="url(#shading)" opacity="0.5" />
    ${hoodieDetail}
    <text x="50" y="114" text-anchor="middle" font-family="sans-serif" font-size="4" fill="#00000055">${label}</text>
    <defs>
      <linearGradient id="shading" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="white" stop-opacity="${isLight ? 0.5 : 0.12}" />
        <stop offset="45%" stop-color="white" stop-opacity="0" />
        <stop offset="100%" stop-color="black" stop-opacity="${isLight ? 0.05 : 0.25}" />
      </linearGradient>
    </defs>
  </svg>`;
}

export type IconShape =
  | "star"
  | "heart"
  | "bolt"
  | "wave"
  | "skyline"
  | "pyramids"
  | "dunewave"
  | "cairotext"
  | "starlattice"
  | "falcon";

function star8(cx: number, cy: number, size: number, hex: string): string {
  return `<g transform="translate(${cx} ${cy})" fill="${hex}">
    <rect x="${-size}" y="${-size}" width="${size * 2}" height="${size * 2}" />
    <rect x="${-size}" y="${-size}" width="${size * 2}" height="${size * 2}" transform="rotate(45)" />
  </g>`;
}

/** Returns just the inner path/<g> markup for one design shape (no outer <svg> wrapper), authored
 *  so its visual center of mass sits near (50,50) in a 100x100 box. iconSvg() wraps this in a
 *  standalone <svg> for the Design Library; printedGarmentSvg() embeds it inside a garment mockup. */
function shapeMarkup(hex: string, shape: IconShape): string {
  switch (shape) {
    case "star":
      return `<path transform="translate(50 52) scale(3.4)" d="M0 -12 L3.5 -3.8 L12 -3.7 L5.2 1.6 L7.6 10 L0 5 L-7.6 10 L-5.2 1.6 L-12 -3.7 L-3.5 -3.8 Z" fill="${hex}"/>`;
    case "heart":
      return `<path transform="translate(50 55) scale(3.6)" d="M0 8 C-10 0 -12 -8 -5 -10 C-1 -11 0 -7 0 -7 C0 -7 1 -11 5 -10 C12 -8 10 0 0 8 Z" fill="${hex}"/>`;
    case "bolt":
      return `<path transform="translate(38 20) scale(3.4)" d="M12 0 L2 15 L9 15 L6 30 L20 12 L12 12 Z" fill="${hex}"/>`;
    case "wave":
      return `<path transform="translate(10 55)" d="M0 10 Q 10 -5 20 10 T 40 10 T 60 10 T 80 10" stroke="${hex}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    case "skyline":
      return `<path d="M8,72 L8,55 L17,55 L17,72 L26,72 L26,44 L35,44 L35,72 L43,72 L43,60 L47,60 L47,18 L52,18 L52,60 L57,60 L57,72 L66,72 L66,50 L75,50 L75,72 L84,72 L84,58 L92,58 L92,72 Z" fill="${hex}"/>`;
    case "pyramids":
      return `<g fill="${hex}">
        <circle cx="58" cy="32" r="11" opacity="0.35" />
        <path d="M18,74 L33,42 L48,74 Z" opacity="0.85" />
        <path d="M34,74 L55,26 L76,74 Z" />
        <path d="M56,74 L70,46 L84,74 Z" opacity="0.85" />
        <path d="M10,75 L92,75" stroke="${hex}" stroke-width="1.5" />
      </g>`;
    case "dunewave":
      return `<g fill="none" stroke="${hex}" stroke-width="3" stroke-linecap="round">
        <path d="M5,55 Q20,42 35,55 T65,55 T95,55" />
        <path d="M5,72 Q20,61 35,72 T65,72 T95,72" opacity="0.6" />
      </g>`;
    case "cairotext":
      return `<text x="50" y="60" text-anchor="middle" font-family="Cairo, sans-serif" font-weight="700" font-size="24" fill="${hex}">القاهرة</text>`;
    case "starlattice":
      return `<g>
        ${star8(50, 50, 11, hex)}
        ${star8(20, 20, 6, hex)}
        ${star8(80, 20, 6, hex)}
        ${star8(20, 80, 6, hex)}
        ${star8(80, 80, 6, hex)}
      </g>`;
    case "falcon":
      return `<path d="M50,42 C42,30 20,30 8,46 C24,45 35,50 44,58 L50,78 L56,58 C65,50 76,45 92,46 C80,30 58,30 50,42 Z" fill="${hex}"/>`;
  }
}

export function iconSvg(hex: string, shape: IconShape): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="500" height="500">${shapeMarkup(hex, shape)}</svg>`;
}

/** A READY_PRINTED product's mockup: the plain garmentSvg() base with a design shape composited
 *  onto the chest, centered on TORSO_FRAME's horizontal center (50 for both TEE and HOODIE) so it
 *  reads as "baked in" rather than a live canvasJson composition (this codebase's convention for
 *  ready-printed items -- see the Product.productType docs). String-splice, matching this file's
 *  plain-template-string approach elsewhere -- no XML parser in this codebase. */
export function printedGarmentSvg(
  kind: GarmentType,
  side: "front" | "back",
  garmentHex: string,
  design: { shape: IconShape; hex: string; boxSize?: number; cy?: number },
): string {
  const base = garmentSvg(kind, side, garmentHex);
  const boxSize = design.boxSize ?? 34;
  const cy = design.cy ?? (kind === "HOODIE" ? 44 : 46);
  const cx = 50;
  const overlay = `<svg x="${cx - boxSize / 2}" y="${cy - boxSize / 2}" width="${boxSize}" height="${boxSize}" viewBox="0 0 100 100">${shapeMarkup(design.hex, design.shape)}</svg>`;
  return base.replace("</svg>", `${overlay}</svg>`);
}

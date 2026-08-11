import { GarmentType } from "./enums.js";

/**
 * The single source of truth for the designer canvas's reference frame — used by three different
 * places that all have to agree on it or print-area alignment breaks: the storefront design
 * canvas (renders at this resolution), the seed/admin mockup generator (draws placeholder art on
 * this frame), and the admin mockup aligner (crops uploaded photos to fit it). Previously each of
 * those kept its own copy of these numbers; that drift is exactly what caused the print-area
 * guide to land on a sleeve instead of the chest.
 *
 * The frame is 100x116 units wide, where 1 unit == 1cm of the flat-laid garment. TORSO_FRAME is
 * each garment shape's FIXED printable-torso rectangle within that frame, independent of any
 * particular size's real chest/length/waist measurements (see PrintAreaCm docs in the API).
 */
export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 1044;
export const PX_PER_CM = CANVAS_WIDTH / 100;

export const TORSO_FRAME: Record<GarmentType, { left: number; width: number }> = {
  TEE: { left: 29, width: 42 },
  HOODIE: { left: 27, width: 46 },
};

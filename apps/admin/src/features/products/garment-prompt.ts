import { GarmentType } from "@d-shirtak/shared";

/**
 * Builds a text-to-image prompt for a product mockup photo. The whole point is that the "style
 * anchor" paragraph below is IDENTICAL for every product/color/side you ever generate — only the
 * garment description, color, and side change. Reusing the same camera/lighting/framing
 * instructions every time is what makes a set of AI-generated mockups look like they came from
 * one consistent photoshoot instead of a grab-bag of random images.
 *
 * The framing instructions are tuned to roughly match TORSO_FRAME in @d-shirtak/shared (the
 * garment fills most of the frame, centered, with sleeves reaching close to the edges) — getting
 * the AI output close to that target means less work in the alignment step afterward. It won't
 * be pixel-perfect (no prompt guarantees that), which is exactly why the alignment step exists.
 */

const STYLE_ANCHOR = [
  "Professional e-commerce apparel product photography, flat-lay style.",
  "Shot from directly above at a perfectly straight top-down angle, zero perspective distortion.",
  "Seamless light gray (#f4f4f5) studio background, no texture, no props, no models, no mannequin, no hangers.",
  "Soft, even, shadowless studio lighting from all sides.",
  "Garment smoothed completely flat with no wrinkles, folds, or bunching.",
  "Garment (including sleeves) centered in frame and filling about 85% of the frame width, with even margin on all four sides.",
  "Square 1:1 aspect ratio, high resolution, tack-sharp focus edge to edge.",
  "No text, no logos, no watermarks, no brand marks anywhere on the garment.",
].join(" ");

const GARMENT_DESCRIPTION: Record<GarmentType, string> = {
  [GarmentType.TEE]: "a classic crew-neck short-sleeve cotton t-shirt with a ribbed collar and a straight hem",
  [GarmentType.HOODIE]:
    "an oversized pullover hoodie with a drawstring hood, ribbed cuffs and hem, and a kangaroo front pocket",
};

const VIEW_NOTE: Record<GarmentType, { front: string; back: string }> = {
  [GarmentType.TEE]: {
    front: "Front view: collar and full front torso visible.",
    back: "Back view: full back torso and shoulder seams visible, no front details.",
  },
  [GarmentType.HOODIE]: {
    front: "Front view: hood, drawstrings, and kangaroo pocket all clearly visible and centered.",
    back: "Back view: hood shown resting flat against the back, no pocket or drawstrings visible.",
  },
};

export interface MockupPromptInput {
  garmentType: GarmentType;
  productName: string;
  colorName: string;
  colorHex: string;
  side: "front" | "back";
}

export function buildMockupPrompt(input: MockupPromptInput): string {
  const garment = GARMENT_DESCRIPTION[input.garmentType];
  const view = VIEW_NOTE[input.garmentType][input.side];

  return [
    `${garment}, for the product "${input.productName}".`,
    `Fabric color: ${input.colorName} (hex ${input.colorHex}) — match this color exactly, no color grading or tint shifts.`,
    view,
    STYLE_ANCHOR,
    "Avoid: mannequins, hangers, models, wrinkles, shadows, props, text, logos, patterns, busy backgrounds, angled or 3/4 views.",
  ].join("\n\n");
}

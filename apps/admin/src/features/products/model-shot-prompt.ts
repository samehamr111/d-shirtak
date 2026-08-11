import { GarmentType } from "@d-shirtak/shared";

/**
 * Builds a text-to-image prompt for an on-model lifestyle photo — the same "one identical style
 * anchor, reused every time" idea as garment-prompt.ts's buildMockupPrompt, but for a photo of a
 * model wearing the garment instead of a flat-lay. Always assumes a specific design is being
 * featured: the admin attaches the design image alongside this prompt in the external tool, and
 * the prompt tells it to reproduce that exact artwork rather than inventing a new print.
 */

const STYLE_ANCHOR = [
  "Professional e-commerce apparel lifestyle photography.",
  "A single model standing naturally, facing the camera, in a clean, softly lit studio with a neutral light gray background.",
  "Even, flattering studio lighting, no harsh shadows.",
  "Garment fits naturally with realistic fabric drape and folds — not flat or airbrushed.",
  "Model's face may be softly out of focus or cropped above the eyes; the emphasis is entirely on the garment.",
  "Square 1:1 aspect ratio, high resolution, sharp focus on the garment and printed design.",
  "No extra props, no busy background, no additional text or logos beyond the attached design.",
].join(" ");

const GARMENT_DESCRIPTION: Record<GarmentType, string> = {
  [GarmentType.TEE]: "a classic crew-neck short-sleeve cotton t-shirt with a ribbed collar and a straight hem",
  [GarmentType.HOODIE]:
    "an oversized pullover hoodie with a drawstring hood, ribbed cuffs and hem, and a kangaroo front pocket",
};

const VIEW_NOTE: Record<GarmentType, { front: string; back: string }> = {
  [GarmentType.TEE]: {
    front: "Model facing the camera; the full front torso and printed design are clearly visible.",
    back: "Model facing away from the camera; the full back torso and printed design are clearly visible.",
  },
  [GarmentType.HOODIE]: {
    front: "Model facing the camera, hood down; the front torso and printed design are clearly visible.",
    back: "Model facing away from the camera, hood resting flat; the back torso and printed design are clearly visible.",
  },
};

export interface ModelShotPromptInput {
  garmentType: GarmentType;
  productName: string;
  colorName: string;
  colorHex: string;
  side: "front" | "back";
  sizeName?: string;
}

export function buildModelShotPrompt(input: ModelShotPromptInput): string {
  const garment = GARMENT_DESCRIPTION[input.garmentType];
  const view = VIEW_NOTE[input.garmentType][input.side];

  return [
    `A model wearing ${garment}, for the product "${input.productName}".`,
    `Fabric color: ${input.colorName} (hex ${input.colorHex}) — match this color exactly, no color grading or tint shifts.`,
    input.sizeName ? `Size: ${input.sizeName}.` : null,
    "IMPORTANT: reproduce the attached design image exactly as provided, printed on the garment's chest/back as shown — do not invent, alter, or substitute a different graphic.",
    view,
    STYLE_ANCHOR,
    "Avoid: mannequins, hangers, flat-lay presentation, extra props, busy backgrounds, additional text or logos beyond the attached design, angled or 3/4 views.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n\n");
}

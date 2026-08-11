import { z } from "zod";
import { DesignSide } from "../enums.js";

/**
 * canvasJson is the raw Fabric.js `canvas.toJSON()` output (opaque to the server, stored as-is
 * so the design can be reloaded for editing later). previewImageDataUrl is a PNG export of the
 * same canvas (base64 data URL) — it already includes the garment mockup as the canvas
 * background, so it doubles as the "design on the shirt" image used for cart/order review.
 */
export const saveDesignSchema = z.object({
  productVariantId: z.string().min(1),
  side: z.nativeEnum(DesignSide),
  canvasJson: z.record(z.string(), z.unknown()),
  previewImageDataUrl: z.string().startsWith("data:image/png;base64,"),
});
export type SaveDesignInput = z.infer<typeof saveDesignSchema>;

export interface DesignDto {
  id: string;
  productVariantId: string;
  side: DesignSide;
  canvasJson: Record<string, unknown>;
  previewImageUrl: string;
  createdAt: string;
}

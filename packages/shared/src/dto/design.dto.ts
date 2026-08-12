import { z } from "zod";
import { DesignSide } from "../enums.js";

/**
 * canvasJson is the raw Fabric.js `canvas.toJSON()` output (opaque to the server, stored as-is
 * so the design can be reloaded for editing later). previewImageDataUrl is a PNG export of the
 * same canvas — it already includes the garment mockup as the canvas background, so it doubles
 * as the "design on the shirt" image used for cart/order review. Usually a base64 data URL
 * (a fresh export from the live canvas), but a guest's design was already uploaded once via
 * externalizeDesign() to keep it out of localStorage, so when their cart gets flushed to the
 * server after login/signup this arrives as an already-hosted https URL instead -- the server
 * stores that URL directly rather than re-uploading it (see DesignService.save).
 */
export const saveDesignSchema = z.object({
  productVariantId: z.string().min(1),
  side: z.nativeEnum(DesignSide),
  canvasJson: z.record(z.string(), z.unknown()),
  previewImageDataUrl: z
    .string()
    .refine((v) => v.startsWith("data:image/png;base64,") || v.startsWith("http://") || v.startsWith("https://"), {
      message: "Expected a base64 PNG data URL or an already-hosted image URL",
    }),
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

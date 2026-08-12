import type { UserUploadDto } from "@d-shirtak/shared";
import { api } from "../../lib/api-client";

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64 = ""] = dataUrl.split(",");
  const mime = /data:(.*?);base64/.exec(header ?? "")?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function uploadDataUrl(dataUrl: string): Promise<string> {
  const form = new FormData();
  form.set("file", dataUrlToBlob(dataUrl), "image.png");
  const uploaded = await api.postForm<UserUploadDto>("/user-uploads", form);
  return uploaded.imageUrl;
}

/** Guest cart items are cached in localStorage, which has a tiny (~5-10MB) quota shared across
 *  the whole site -- a design with one uploaded photo embedded as base64 (in canvasJson's image
 *  `src` fields, and again in the full-canvas preview PNG) can blow through that on its own,
 *  throwing QuotaExceededError. Uploads any embedded base64 image data to the server (the same
 *  guest-safe endpoint the designer already fire-and-forgets uploads to for promotion tracking)
 *  and rewrites the JSON/preview to reference the resulting URL instead, so what actually gets
 *  cached is a handful of short strings, not megabytes of inline image data. */
export async function externalizeDesign(
  json: Record<string, unknown>,
  previewDataUrl: string,
): Promise<{ json: Record<string, unknown>; previewUrl: string }> {
  const objects = Array.isArray(json.objects) ? (json.objects as Record<string, unknown>[]) : [];
  const externalizedObjects = await Promise.all(
    objects.map(async (obj) => {
      const src = obj.src;
      if (typeof src === "string" && src.startsWith("data:")) {
        return { ...obj, src: await uploadDataUrl(src) };
      }
      return obj;
    }),
  );
  const previewUrl = await uploadDataUrl(previewDataUrl);
  return { json: { ...json, objects: externalizedObjects }, previewUrl };
}

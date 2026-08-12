import type { DesignElementDto } from "@d-shirtak/shared";

interface CanvasObjectLike {
  type?: string;
  text?: string;
  fontFamily?: string;
  src?: string;
}

/** Breaks a saved design's raw Fabric.js canvasJson down into a print-shop-friendly list: every
 *  text block (with its content and font) and every image (with a direct download URL, and a
 *  link back to the design-library print it came from, if it came from one). Used only by the
 *  admin order-detail view -- customers never see canvasJson at all, see order.mapper.ts. */
export function parseDesignElements(
  canvasJson: string,
  designAssetsByUrl: ReadonlyMap<string, { id: string; name: string }>,
): DesignElementDto[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(canvasJson);
  } catch {
    return [];
  }
  const objects = (parsed as { objects?: unknown[] } | null)?.objects;
  if (!Array.isArray(objects)) return [];

  const elements: DesignElementDto[] = [];
  for (const raw of objects) {
    const obj = raw as CanvasObjectLike;
    const type = String(obj.type ?? "").toLowerCase();
    if ((type === "i-text" || type === "text" || type === "textbox") && obj.text) {
      elements.push({ kind: "text", content: obj.text, fontFamily: obj.fontFamily ?? null });
    } else if (type === "image" && obj.src) {
      const asset = designAssetsByUrl.get(obj.src);
      elements.push({
        kind: "image",
        url: obj.src,
        libraryAssetId: asset?.id ?? null,
        libraryAssetName: asset?.name ?? null,
      });
    }
  }
  return elements;
}

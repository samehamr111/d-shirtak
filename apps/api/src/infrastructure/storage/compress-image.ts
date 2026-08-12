import sharp from "sharp";

const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 85;
const RASTER_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

export interface CompressibleFile {
  buffer: Buffer;
  originalFileName: string;
}

/**
 * Caps pathologically large raster uploads (an unresized phone photo can be 5-10MB) down to a
 * sane ceiling before they're stored. There's no other resizing anywhere in this stack, and
 * multi-MB photos serving as a few-hundred-px thumbnail add up fast as the catalog grows.
 * SVGs and anything sharp can't parse pass through untouched -- a failed compression attempt
 * falls back to the original buffer rather than blocking the upload.
 */
export async function compressImageIfNeeded({ buffer, originalFileName }: CompressibleFile): Promise<CompressibleFile> {
  const ext = (/\.[^.]+$/.exec(originalFileName)?.[0] ?? "").toLowerCase();
  if (!RASTER_EXTENSIONS.has(ext)) return { buffer, originalFileName };

  try {
    const image = sharp(buffer, { failOn: "none" });
    const metadata = await image.metadata();
    const hasAlpha = metadata.hasAlpha ?? false;
    const needsResize = (metadata.width ?? 0) > MAX_DIMENSION || (metadata.height ?? 0) > MAX_DIMENSION;

    const resized = needsResize
      ? image.resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
      : image;

    // Keep PNG (with alpha) for anything that has transparency -- some design assets and color
    // swatches rely on a transparent background to sit correctly on the shirt. Everything else
    // becomes a JPEG, which compresses far better for photos than PNG does.
    const output = hasAlpha
      ? await resized.png({ compressionLevel: 9 }).toBuffer()
      : await resized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();

    // A small, already-optimized image can grow slightly under re-encoding -- never ship
    // something bigger than what was actually uploaded.
    if (!needsResize && output.length >= buffer.length) return { buffer, originalFileName };

    const newExt = hasAlpha ? ".png" : ".jpg";
    return { buffer: output, originalFileName: originalFileName.replace(/\.[^.]+$/, "") + newExt };
  } catch {
    return { buffer, originalFileName };
  }
}

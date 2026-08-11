import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ValidationError } from "../../domain/errors.js";
import type { IFileStorage, SavedFile, UploadCategory } from "../../domain/ports/file-storage.port.js";

const BASE64_IMAGE_PATTERN = /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/;

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

function contentTypeFor(ext: string): string {
  return CONTENT_TYPES[ext.toLowerCase()] ?? "application/octet-stream";
}

function extname(fileName: string): string {
  const i = fileName.lastIndexOf(".");
  return i === -1 ? "" : fileName.slice(i);
}

/** Cloudflare R2 is S3-API-compatible, so the same @aws-sdk/client-s3 client works against it --
 *  only the endpoint differs from real AWS S3. Swaps in for LocalDiskFileStorage with zero
 *  changes to any calling code (see infrastructure/container.ts for the selection logic). */
export class R2FileStorage implements IFileStorage {
  private readonly client: S3Client;

  constructor(
    accountId: string,
    private readonly bucket: string,
    private readonly publicBaseUrl: string,
    accessKeyId: string,
    secretAccessKey: string,
  ) {
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async saveBuffer(category: UploadCategory, originalFileName: string, buffer: Buffer): Promise<SavedFile> {
    const ext = extname(originalFileName);
    const relativePath = `${category}/${randomUUID()}${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: relativePath,
        Body: buffer,
        ContentType: contentTypeFor(ext),
        // Every upload gets a fresh random key and is never overwritten -- safe to cache forever.
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return { url: `${this.publicBaseUrl}/${relativePath}`, relativePath };
  }

  async saveBase64Image(category: UploadCategory, base64DataUrl: string): Promise<SavedFile> {
    const match = BASE64_IMAGE_PATTERN.exec(base64DataUrl);
    if (!match) throw new ValidationError("Expected a base64 PNG/JPEG/WEBP data URL");
    const [, ext, data] = match;
    const buffer = Buffer.from(data as string, "base64");
    return this.saveBuffer(category, `image.${ext}`, buffer);
  }

  async delete(relativePath: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: relativePath }));
  }
}

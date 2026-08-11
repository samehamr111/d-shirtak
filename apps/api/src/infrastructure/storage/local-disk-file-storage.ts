import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { ValidationError } from "../../domain/errors.js";
import type { IFileStorage, SavedFile, UploadCategory } from "../../domain/ports/file-storage.port.js";

const BASE64_IMAGE_PATTERN = /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/;

export class LocalDiskFileStorage implements IFileStorage {
  constructor(
    private readonly rootDir: string,
    private readonly publicBaseUrl: string,
  ) {}

  async saveBuffer(category: UploadCategory, originalFileName: string, buffer: Buffer): Promise<SavedFile> {
    const ext = path.extname(originalFileName) || "";
    const fileName = `${randomUUID()}${ext}`;
    const dir = path.join(this.rootDir, category);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, fileName), buffer);

    const relativePath = path.posix.join(category, fileName);
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
    const full = path.join(this.rootDir, relativePath);
    await fs.rm(full, { force: true });
  }
}

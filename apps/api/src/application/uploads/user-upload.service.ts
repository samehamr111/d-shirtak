import type { UserUploadDto } from "@d-shirtak/shared";
import type { IUserUploadRepository } from "../../domain/ports/repositories/user-upload.repository.js";
import type { IUserRepository } from "../../domain/ports/repositories/user.repository.js";
import type { IFileStorage } from "../../domain/ports/file-storage.port.js";

export class UserUploadService {
  constructor(
    private readonly userUploads: IUserUploadRepository,
    private readonly users: IUserRepository,
    private readonly fileStorage: IFileStorage,
  ) {}

  async track(userId: string | null, file: { buffer: Buffer; originalName: string }): Promise<UserUploadDto> {
    const saved = await this.fileStorage.saveBuffer("user-uploads", file.originalName, file.buffer);
    const created = await this.userUploads.create({
      userId,
      imageUrl: saved.url,
      originalName: file.originalName,
    });
    const uploader = userId ? await this.users.findById(userId) : null;
    return {
      id: created.id,
      imageUrl: created.imageUrl,
      originalName: created.originalName,
      uploaderEmail: uploader?.email ?? "Guest",
      promoted: false,
      createdAt: created.createdAt.toISOString(),
    };
  }
}

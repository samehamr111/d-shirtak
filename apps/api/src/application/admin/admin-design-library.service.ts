import type {
  DesignAssetDto,
  DesignAssetMetaInput,
  DesignCategoryDto,
  DesignCategoryInput,
  FontDto,
  FontMetaInput,
  PromoteUserUploadInput,
  UserUploadDto,
} from "@d-shirtak/shared";
import { NotFoundError, ValidationError } from "../../domain/errors.js";
import type { IFontRepository } from "../../domain/ports/repositories/font.repository.js";
import type {
  IDesignAssetRepository,
  IDesignCategoryRepository,
} from "../../domain/ports/repositories/design-library.repository.js";
import type { IUserUploadRepository } from "../../domain/ports/repositories/user-upload.repository.js";
import type { IUserRepository } from "../../domain/ports/repositories/user.repository.js";
import type { IFileStorage } from "../../domain/ports/file-storage.port.js";

export class AdminDesignLibraryService {
  constructor(
    private readonly fonts: IFontRepository,
    private readonly designCategories: IDesignCategoryRepository,
    private readonly designAssets: IDesignAssetRepository,
    private readonly userUploads: IUserUploadRepository,
    private readonly users: IUserRepository,
    private readonly fileStorage: IFileStorage,
  ) {}

  listFonts(): Promise<FontDto[]> {
    return this.fonts.listAll();
  }

  async uploadFont(meta: FontMetaInput, file: { buffer: Buffer; originalName: string }): Promise<FontDto> {
    const saved = await this.fileStorage.saveBuffer("fonts", file.originalName, file.buffer);
    return this.fonts.create({ ...meta, fileUrl: saved.url });
  }

  deleteFont(id: string): Promise<void> {
    return this.fonts.delete(id);
  }

  listDesignCategories(): Promise<DesignCategoryDto[]> {
    return this.designCategories.listAll();
  }

  createDesignCategory(input: DesignCategoryInput): Promise<DesignCategoryDto> {
    return this.designCategories.create(input);
  }

  deleteDesignCategory(id: string): Promise<void> {
    return this.designCategories.delete(id);
  }

  listDesignAssets(): Promise<DesignAssetDto[]> {
    return this.designAssets.listAll();
  }

  async uploadDesignAsset(
    meta: DesignAssetMetaInput,
    file: { buffer: Buffer; originalName: string },
  ): Promise<DesignAssetDto> {
    const saved = await this.fileStorage.saveBuffer("assets", file.originalName, file.buffer);
    return this.designAssets.create({ ...meta, imageUrl: saved.url });
  }

  deleteDesignAsset(id: string): Promise<void> {
    return this.designAssets.delete(id);
  }

  // -- Tracked customer/admin uploads (candidates for promotion into the library) -----------
  async listUserUploads(): Promise<UserUploadDto[]> {
    const uploads = await this.userUploads.list();
    return Promise.all(
      uploads.map(async (u) => {
        const uploader = await this.users.findById(u.userId);
        return {
          id: u.id,
          imageUrl: u.imageUrl,
          originalName: u.originalName,
          uploaderEmail: uploader?.email ?? "unknown",
          promoted: u.promotedAssetId !== null,
          createdAt: u.createdAt.toISOString(),
        };
      }),
    );
  }

  async promoteUserUpload(id: string, input: PromoteUserUploadInput): Promise<DesignAssetDto> {
    const upload = await this.userUploads.findById(id);
    if (!upload) throw new NotFoundError("UserUpload", id);
    if (upload.promotedAssetId) throw new ValidationError("This upload has already been promoted");
    const asset = await this.designAssets.create({
      name: input.name,
      designCategoryId: input.designCategoryId,
      imageUrl: upload.imageUrl,
    });
    await this.userUploads.markPromoted(id, asset.id);
    return asset;
  }
}

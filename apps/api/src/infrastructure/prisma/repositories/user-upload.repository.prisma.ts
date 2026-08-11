import type { PrismaClient } from "@prisma/client";
import type { UserUpload } from "../../../domain/entities/catalog.entity.js";
import type {
  CreateUserUploadInput,
  IUserUploadRepository,
} from "../../../domain/ports/repositories/user-upload.repository.js";

export class PrismaUserUploadRepository implements IUserUploadRepository {
  constructor(private readonly db: PrismaClient) {}

  list(): Promise<UserUpload[]> {
    return this.db.userUpload.findMany({ orderBy: { createdAt: "desc" } });
  }
  findById(id: string): Promise<UserUpload | null> {
    return this.db.userUpload.findUnique({ where: { id } });
  }
  create(input: CreateUserUploadInput): Promise<UserUpload> {
    return this.db.userUpload.create({ data: input });
  }
  markPromoted(id: string, designAssetId: string): Promise<UserUpload> {
    return this.db.userUpload.update({ where: { id }, data: { promotedAssetId: designAssetId } });
  }
}

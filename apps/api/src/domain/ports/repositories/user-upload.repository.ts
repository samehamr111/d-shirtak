import type { UserUpload } from "../../entities/catalog.entity.js";

export type CreateUserUploadInput = Omit<UserUpload, "id" | "createdAt" | "promotedAssetId">;

export interface IUserUploadRepository {
  list(): Promise<UserUpload[]>;
  findById(id: string): Promise<UserUpload | null>;
  create(input: CreateUserUploadInput): Promise<UserUpload>;
  markPromoted(id: string, designAssetId: string): Promise<UserUpload>;
}

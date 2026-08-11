import type { PrismaClient } from "@prisma/client";
import type { DesignAsset, DesignCategory } from "../../../domain/entities/catalog.entity.js";
import type {
  IDesignAssetRepository,
  IDesignCategoryRepository,
} from "../../../domain/ports/repositories/design-library.repository.js";

export class PrismaDesignCategoryRepository implements IDesignCategoryRepository {
  constructor(private readonly db: PrismaClient) {}

  listAll(): Promise<DesignCategory[]> {
    return this.db.designCategory.findMany({ orderBy: { name: "asc" } });
  }
  findById(id: string): Promise<DesignCategory | null> {
    return this.db.designCategory.findUnique({ where: { id } });
  }
  create(input: Omit<DesignCategory, "id">): Promise<DesignCategory> {
    return this.db.designCategory.create({ data: input });
  }
  update(id: string, input: Partial<Omit<DesignCategory, "id">>): Promise<DesignCategory> {
    return this.db.designCategory.update({ where: { id }, data: input });
  }
  async delete(id: string): Promise<void> {
    await this.db.designCategory.delete({ where: { id } });
  }
}

export class PrismaDesignAssetRepository implements IDesignAssetRepository {
  constructor(private readonly db: PrismaClient) {}

  listAll(): Promise<DesignAsset[]> {
    return this.db.designAsset.findMany({ orderBy: { name: "asc" } });
  }
  listByCategory(designCategoryId: string): Promise<DesignAsset[]> {
    return this.db.designAsset.findMany({ where: { designCategoryId }, orderBy: { name: "asc" } });
  }
  findById(id: string): Promise<DesignAsset | null> {
    return this.db.designAsset.findUnique({ where: { id } });
  }
  create(input: Omit<DesignAsset, "id">): Promise<DesignAsset> {
    return this.db.designAsset.create({ data: input });
  }
  async delete(id: string): Promise<void> {
    await this.db.designAsset.delete({ where: { id } });
  }
}

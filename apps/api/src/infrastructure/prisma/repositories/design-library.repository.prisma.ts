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

const withModelShots = { modelShots: { orderBy: { createdAt: "asc" as const } } };

interface DesignAssetRow {
  id: string;
  name: string;
  imageUrl: string;
  designCategoryId: string;
  modelShots: { id: string; imageUrl: string }[];
}

function mapAsset(asset: DesignAssetRow): DesignAsset {
  return {
    id: asset.id,
    name: asset.name,
    imageUrl: asset.imageUrl,
    designCategoryId: asset.designCategoryId,
    modelShots: asset.modelShots.map((s) => ({ id: s.id, imageUrl: s.imageUrl })),
  };
}

export class PrismaDesignAssetRepository implements IDesignAssetRepository {
  constructor(private readonly db: PrismaClient) {}

  async listAll(): Promise<DesignAsset[]> {
    const assets = await this.db.designAsset.findMany({ orderBy: { name: "asc" }, include: withModelShots });
    return assets.map(mapAsset);
  }
  async listByCategory(designCategoryId: string): Promise<DesignAsset[]> {
    const assets = await this.db.designAsset.findMany({
      where: { designCategoryId },
      orderBy: { name: "asc" },
      include: withModelShots,
    });
    return assets.map(mapAsset);
  }
  async findById(id: string): Promise<DesignAsset | null> {
    const asset = await this.db.designAsset.findUnique({ where: { id }, include: withModelShots });
    return asset ? mapAsset(asset) : null;
  }
  async create(input: { name: string; imageUrl: string; designCategoryId: string }): Promise<DesignAsset> {
    const asset = await this.db.designAsset.create({ data: input, include: withModelShots });
    return mapAsset(asset);
  }
  async addModelShot(designAssetId: string, imageUrl: string): Promise<DesignAsset> {
    const asset = await this.db.designAsset.update({
      where: { id: designAssetId },
      data: { modelShots: { create: { imageUrl } } },
      include: withModelShots,
    });
    return mapAsset(asset);
  }
  async deleteModelShot(designAssetId: string, modelShotId: string): Promise<DesignAsset> {
    await this.db.designAssetModelShot.delete({ where: { id: modelShotId } });
    const asset = await this.db.designAsset.findUniqueOrThrow({ where: { id: designAssetId }, include: withModelShots });
    return mapAsset(asset);
  }
  async delete(id: string): Promise<void> {
    await this.db.designAsset.delete({ where: { id } });
  }
}

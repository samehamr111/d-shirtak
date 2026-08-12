import type { DesignAsset, DesignCategory } from "../../entities/catalog.entity.js";

export interface IDesignCategoryRepository {
  listAll(): Promise<DesignCategory[]>;
  findById(id: string): Promise<DesignCategory | null>;
  create(input: Omit<DesignCategory, "id">): Promise<DesignCategory>;
  update(id: string, input: Partial<Omit<DesignCategory, "id">>): Promise<DesignCategory>;
  delete(id: string): Promise<void>;
}

export interface IDesignAssetRepository {
  listAll(): Promise<DesignAsset[]>;
  listByCategory(designCategoryId: string): Promise<DesignAsset[]>;
  findById(id: string): Promise<DesignAsset | null>;
  create(input: { name: string; imageUrl: string; designCategoryId: string }): Promise<DesignAsset>;
  addModelShot(designAssetId: string, imageUrl: string): Promise<DesignAsset>;
  deleteModelShot(designAssetId: string, modelShotId: string): Promise<DesignAsset>;
  delete(id: string): Promise<void>;
}

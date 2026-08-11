import type { Design } from "../../entities/design.entity.js";

export type CreateDesignInput = Omit<Design, "id" | "createdAt">;

export interface IDesignRepository {
  findById(id: string): Promise<Design | null>;
  findManyByIds(ids: string[]): Promise<Design[]>;
  create(input: CreateDesignInput): Promise<Design>;
}

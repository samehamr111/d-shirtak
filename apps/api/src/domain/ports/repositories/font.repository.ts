import type { Font } from "../../entities/catalog.entity.js";

export interface IFontRepository {
  listAll(): Promise<Font[]>;
  findById(id: string): Promise<Font | null>;
  create(input: Omit<Font, "id">): Promise<Font>;
  delete(id: string): Promise<void>;
}

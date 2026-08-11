import type { Category, Color, Size } from "../../entities/catalog.entity.js";

export interface ICategoryRepository {
  listAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  create(input: Omit<Category, "id">): Promise<Category>;
  update(id: string, input: Partial<Omit<Category, "id">>): Promise<Category>;
  delete(id: string): Promise<void>;
}

export interface IColorRepository {
  listAll(): Promise<Color[]>;
  findById(id: string): Promise<Color | null>;
  create(input: Omit<Color, "id">): Promise<Color>;
  update(id: string, input: Partial<Omit<Color, "id">>): Promise<Color>;
  delete(id: string): Promise<void>;
}

export interface ISizeRepository {
  listAll(): Promise<Size[]>;
  findById(id: string): Promise<Size | null>;
  /** sortOrder is always assigned server-side (next in sequence) — never trust a caller-supplied value on create. */
  create(input: Omit<Size, "id" | "sortOrder">): Promise<Size>;
  update(id: string, input: Partial<Omit<Size, "id">>): Promise<Size>;
  delete(id: string): Promise<void>;
}

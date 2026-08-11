import type { PrismaClient } from "@prisma/client";
import type { Category, Color, Size } from "../../../domain/entities/catalog.entity.js";
import type {
  ICategoryRepository,
  IColorRepository,
  ISizeRepository,
} from "../../../domain/ports/repositories/lookup.repository.js";

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly db: PrismaClient) {}

  listAll(): Promise<Category[]> {
    return this.db.category.findMany({ orderBy: { name: "asc" } });
  }
  findById(id: string): Promise<Category | null> {
    return this.db.category.findUnique({ where: { id } });
  }
  findBySlug(slug: string): Promise<Category | null> {
    return this.db.category.findUnique({ where: { slug } });
  }
  create(input: Omit<Category, "id">): Promise<Category> {
    return this.db.category.create({ data: input });
  }
  update(id: string, input: Partial<Omit<Category, "id">>): Promise<Category> {
    return this.db.category.update({ where: { id }, data: input });
  }
  async delete(id: string): Promise<void> {
    await this.db.category.delete({ where: { id } });
  }
}

export class PrismaColorRepository implements IColorRepository {
  constructor(private readonly db: PrismaClient) {}

  listAll(): Promise<Color[]> {
    return this.db.color.findMany({ orderBy: { name: "asc" } });
  }
  findById(id: string): Promise<Color | null> {
    return this.db.color.findUnique({ where: { id } });
  }
  create(input: Omit<Color, "id">): Promise<Color> {
    return this.db.color.create({ data: input });
  }
  update(id: string, input: Partial<Omit<Color, "id">>): Promise<Color> {
    return this.db.color.update({ where: { id }, data: input });
  }
  async delete(id: string): Promise<void> {
    await this.db.color.delete({ where: { id } });
  }
}

export class PrismaSizeRepository implements ISizeRepository {
  constructor(private readonly db: PrismaClient) {}

  listAll(): Promise<Size[]> {
    return this.db.size.findMany({ orderBy: { sortOrder: "asc" } });
  }
  findById(id: string): Promise<Size | null> {
    return this.db.size.findUnique({ where: { id } });
  }
  async create(input: Omit<Size, "id" | "sortOrder">): Promise<Size> {
    const { _max } = await this.db.size.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (_max.sortOrder ?? -1) + 1;
    return this.db.size.create({ data: { ...input, sortOrder } });
  }
  update(id: string, input: Partial<Omit<Size, "id">>): Promise<Size> {
    return this.db.size.update({ where: { id }, data: input });
  }
  async delete(id: string): Promise<void> {
    await this.db.size.delete({ where: { id } });
  }
}

import type { Font as PrismaFont, PrismaClient } from "@prisma/client";
import type { Font } from "../../../domain/entities/catalog.entity.js";
import type { IFontRepository } from "../../../domain/ports/repositories/font.repository.js";

function toFont(row: PrismaFont): Font {
  return { ...row, language: row.language as Font["language"] };
}

export class PrismaFontRepository implements IFontRepository {
  constructor(private readonly db: PrismaClient) {}

  async listAll(): Promise<Font[]> {
    const rows = await this.db.font.findMany({ orderBy: { name: "asc" } });
    return rows.map(toFont);
  }
  async findById(id: string): Promise<Font | null> {
    const row = await this.db.font.findUnique({ where: { id } });
    return row ? toFont(row) : null;
  }
  async create(input: Omit<Font, "id">): Promise<Font> {
    const row = await this.db.font.create({ data: input });
    return toFont(row);
  }
  async delete(id: string): Promise<void> {
    await this.db.font.delete({ where: { id } });
  }
}

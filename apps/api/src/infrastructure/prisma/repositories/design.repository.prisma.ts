import type { Design as PrismaDesign, PrismaClient } from "@prisma/client";
import type { Design } from "../../../domain/entities/design.entity.js";
import type {
  CreateDesignInput,
  IDesignRepository,
} from "../../../domain/ports/repositories/design.repository.js";

function toDesign(row: PrismaDesign): Design {
  return { ...row, side: row.side as Design["side"] };
}

export class PrismaDesignRepository implements IDesignRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<Design | null> {
    const row = await this.db.design.findUnique({ where: { id } });
    return row ? toDesign(row) : null;
  }

  async findManyByIds(ids: string[]): Promise<Design[]> {
    if (ids.length === 0) return [];
    const rows = await this.db.design.findMany({ where: { id: { in: ids } } });
    return rows.map(toDesign);
  }

  async create(input: CreateDesignInput): Promise<Design> {
    const row = await this.db.design.create({ data: input });
    return toDesign(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.design.delete({ where: { id } });
  }

  async isReferenced(id: string): Promise<boolean> {
    const [cartCount, orderCount] = await Promise.all([
      this.db.cartItem.count({ where: { OR: [{ frontDesignId: id }, { backDesignId: id }] } }),
      this.db.orderItem.count({ where: { OR: [{ frontDesignId: id }, { backDesignId: id }] } }),
    ]);
    return cartCount > 0 || orderCount > 0;
  }
}

import type { PrismaClient } from "@prisma/client";
import type { CartItem } from "../../../domain/entities/cart.entity.js";
import type {
  CreateCartItemInput,
  ICartRepository,
} from "../../../domain/ports/repositories/cart.repository.js";

export class PrismaCartRepository implements ICartRepository {
  constructor(private readonly db: PrismaClient) {}

  listByUser(userId: string): Promise<CartItem[]> {
    return this.db.cartItem.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  }

  findById(id: string): Promise<CartItem | null> {
    return this.db.cartItem.findUnique({ where: { id } });
  }

  findMatching(
    userId: string,
    productVariantId: string,
    frontDesignId: string | null,
    backDesignId: string | null,
  ): Promise<CartItem | null> {
    return this.db.cartItem.findFirst({
      where: { userId, productVariantId, frontDesignId, backDesignId },
    });
  }

  create(input: CreateCartItemInput): Promise<CartItem> {
    return this.db.cartItem.create({ data: input });
  }

  updateQuantity(id: string, quantity: number): Promise<CartItem> {
    return this.db.cartItem.update({ where: { id }, data: { quantity } });
  }

  async delete(id: string): Promise<void> {
    await this.db.cartItem.delete({ where: { id } });
  }

  async clearForUser(userId: string): Promise<void> {
    await this.db.cartItem.deleteMany({ where: { userId } });
  }
}

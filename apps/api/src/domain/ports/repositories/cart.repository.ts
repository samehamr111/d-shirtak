import type { CartItem } from "../../entities/cart.entity.js";

export type CreateCartItemInput = Omit<CartItem, "id" | "createdAt">;

export interface ICartRepository {
  listByUser(userId: string): Promise<CartItem[]>;
  findById(id: string): Promise<CartItem | null>;
  findMatching(
    userId: string,
    productVariantId: string,
    frontDesignId: string | null,
    backDesignId: string | null,
  ): Promise<CartItem | null>;
  create(input: CreateCartItemInput): Promise<CartItem>;
  updateQuantity(id: string, quantity: number): Promise<CartItem>;
  delete(id: string): Promise<void>;
  clearForUser(userId: string): Promise<void>;
}

import type { Design } from "../../entities/design.entity.js";

export type CreateDesignInput = Omit<Design, "id" | "createdAt">;

export interface IDesignRepository {
  findById(id: string): Promise<Design | null>;
  findManyByIds(ids: string[]): Promise<Design[]>;
  create(input: CreateDesignInput): Promise<Design>;
  delete(id: string): Promise<void>;
  /** Whether any CartItem or OrderItem (front or back side) still points at this design --
   *  checked before deleting a design as part of order-cancellation cleanup, since a Design row
   *  can in principle be referenced by more than one place. */
  isReferenced(id: string): Promise<boolean>;
}

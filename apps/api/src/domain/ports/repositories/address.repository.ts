import type { Address } from "../../entities/user.entity.js";

export type CreateAddressInput = Omit<Address, "id">;
export type UpdateAddressInput = Partial<Omit<Address, "id" | "userId">>;

export interface IAddressRepository {
  listByUser(userId: string): Promise<Address[]>;
  findById(id: string): Promise<Address | null>;
  create(input: CreateAddressInput): Promise<Address>;
  update(id: string, input: UpdateAddressInput): Promise<Address>;
  delete(id: string): Promise<void>;
  clearDefault(userId: string): Promise<void>;
}

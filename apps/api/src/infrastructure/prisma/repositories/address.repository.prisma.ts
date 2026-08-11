import type { PrismaClient } from "@prisma/client";
import type { Address } from "../../../domain/entities/user.entity.js";
import type {
  CreateAddressInput,
  IAddressRepository,
  UpdateAddressInput,
} from "../../../domain/ports/repositories/address.repository.js";

export class PrismaAddressRepository implements IAddressRepository {
  constructor(private readonly db: PrismaClient) {}

  async listByUser(userId: string): Promise<Address[]> {
    return this.db.address.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  }

  async findById(id: string): Promise<Address | null> {
    return this.db.address.findUnique({ where: { id } });
  }

  async create(input: CreateAddressInput): Promise<Address> {
    return this.db.address.create({ data: input });
  }

  async update(id: string, input: UpdateAddressInput): Promise<Address> {
    return this.db.address.update({ where: { id }, data: input });
  }

  async delete(id: string): Promise<void> {
    await this.db.address.delete({ where: { id } });
  }

  async clearDefault(userId: string): Promise<void> {
    await this.db.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
  }
}

import type { PrismaClient, User as PrismaUser } from "@prisma/client";
import type { Role } from "@d-shirtak/shared";
import type { User, UserWithOrderCount } from "../../../domain/entities/user.entity.js";
import type { CreateUserInput, IUserRepository } from "../../../domain/ports/repositories/user.repository.js";

function toUser(row: PrismaUser): User {
  return { ...row, role: row.role as Role };
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { id } });
    return row ? toUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { email } });
    return row ? toUser(row) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const row = await this.db.user.create({
      data: {
        username: input.username,
        email: input.email,
        phone: input.phone,
        passwordHash: input.passwordHash,
        role: input.role ?? "CUSTOMER",
      },
    });
    return toUser(row);
  }

  async listCustomers(): Promise<UserWithOrderCount[]> {
    const rows = await this.db.user.findMany({
      where: { role: "CUSTOMER" },
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => ({ ...toUser(row), orderCount: row._count.orders }));
  }

  async findByIdWithOrderCount(id: string): Promise<UserWithOrderCount | null> {
    const row = await this.db.user.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });
    return row ? { ...toUser(row), orderCount: row._count.orders } : null;
  }

  countCustomers(): Promise<number> {
    return this.db.user.count({ where: { role: "CUSTOMER" } });
  }

  countCustomersSince(date: Date): Promise<number> {
    return this.db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: date } } });
  }

  async block(id: string, reason: string): Promise<User> {
    const row = await this.db.user.update({
      where: { id },
      data: { isBlocked: true, blockedReason: reason, blockedAt: new Date() },
    });
    return toUser(row);
  }

  async unblock(id: string): Promise<User> {
    const row = await this.db.user.update({
      where: { id },
      data: { isBlocked: false, blockedReason: null, blockedAt: null },
    });
    return toUser(row);
  }
}

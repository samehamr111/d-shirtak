import type { PrismaClient, User as PrismaUser } from "@prisma/client";
import type { Role } from "@d-shirtak/shared";
import type { User } from "../../../domain/entities/user.entity.js";
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
}

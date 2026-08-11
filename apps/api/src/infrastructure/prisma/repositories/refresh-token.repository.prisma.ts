import type { PrismaClient } from "@prisma/client";
import type { RefreshToken } from "../../../domain/entities/user.entity.js";
import type { IRefreshTokenRepository } from "../../../domain/ports/repositories/refresh-token.repository.js";

export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<RefreshToken> {
    return this.db.refreshToken.create({ data: input });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.db.refreshToken.findFirst({ where: { tokenHash } });
  }

  async revoke(id: string): Promise<void> {
    await this.db.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.db.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

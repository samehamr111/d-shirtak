import type { RefreshToken } from "../../entities/user.entity.js";

export interface IRefreshTokenRepository {
  create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<RefreshToken>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  revoke(id: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}

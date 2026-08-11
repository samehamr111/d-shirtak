import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../domain/errors.js";
import type { AccessTokenPayload, ITokenService } from "../../domain/ports/token-service.port.js";

export class JwtTokenService implements ITokenService {
  constructor(
    private readonly accessSecret: string,
    private readonly accessTtl: string,
    private readonly refreshTtlDays: number,
  ) {}

  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.accessSecret, { expiresIn: this.accessTtl as jwt.SignOptions["expiresIn"] });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const decoded = jwt.verify(token, this.accessSecret);
      if (typeof decoded === "string" || !("sub" in decoded) || !("role" in decoded)) {
        throw new UnauthorizedError("Malformed access token");
      }
      return { sub: decoded.sub as string, role: decoded.role as AccessTokenPayload["role"] };
    } catch {
      throw new UnauthorizedError("Invalid or expired access token");
    }
  }

  generateRefreshToken(): string {
    return randomBytes(48).toString("hex");
  }

  hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  refreshTokenTtlMs(): number {
    return this.refreshTtlDays * 24 * 60 * 60 * 1000;
  }
}

import type { Role } from "@d-shirtak/shared";

export interface AccessTokenPayload {
  sub: string;
  role: Role;
}

export interface ITokenService {
  signAccessToken(payload: AccessTokenPayload): string;
  verifyAccessToken(token: string): AccessTokenPayload;
  generateRefreshToken(): string;
  hashRefreshToken(token: string): string;
  refreshTokenTtlMs(): number;
}

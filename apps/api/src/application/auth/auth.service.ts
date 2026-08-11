import type { AuthResponseDto, LoginInput, SignupInput } from "@d-shirtak/shared";
import { ConflictError, UnauthorizedError } from "../../domain/errors.js";
import type { IUserRepository } from "../../domain/ports/repositories/user.repository.js";
import type { IRefreshTokenRepository } from "../../domain/ports/repositories/refresh-token.repository.js";
import type { IPasswordHasher } from "../../domain/ports/password-hasher.port.js";
import type { ITokenService } from "../../domain/ports/token-service.port.js";
import type { User } from "../../domain/entities/user.entity.js";

export interface AuthResult {
  response: AuthResponseDto;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

function toAuthResponse(user: User, accessToken: string): AuthResponseDto {
  return {
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
    accessToken,
  };
}

export class AuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly refreshTokens: IRefreshTokenRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: ITokenService,
  ) {}

  async signup(input: SignupInput): Promise<AuthResult> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new ConflictError("An account with this email already exists");

    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({
      username: input.username,
      email: input.email,
      passwordHash,
      role: "CUSTOMER",
    });

    return this.issueTokens(user);
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.users.findByEmail(input.email);
    if (!user) throw new UnauthorizedError("Invalid email or password");

    const valid = await this.hasher.compare(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Invalid email or password");

    return this.issueTokens(user);
  }

  async refresh(rawRefreshToken: string): Promise<AuthResult> {
    const tokenHash = this.tokens.hashRefreshToken(rawRefreshToken);
    const stored = await this.refreshTokens.findByTokenHash(tokenHash);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token is invalid or expired");
    }

    const user = await this.users.findById(stored.userId);
    if (!user) throw new UnauthorizedError("Refresh token is invalid or expired");

    await this.refreshTokens.revoke(stored.id);
    return this.issueTokens(user);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.tokens.hashRefreshToken(rawRefreshToken);
    const stored = await this.refreshTokens.findByTokenHash(tokenHash);
    if (stored) await this.refreshTokens.revoke(stored.id);
  }

  private async issueTokens(user: User): Promise<AuthResult> {
    const accessToken = this.tokens.signAccessToken({ sub: user.id, role: user.role });
    const rawRefreshToken = this.tokens.generateRefreshToken();
    const tokenHash = this.tokens.hashRefreshToken(rawRefreshToken);
    const refreshTokenExpiresAt = new Date(Date.now() + this.tokens.refreshTokenTtlMs());

    await this.refreshTokens.create({ userId: user.id, tokenHash, expiresAt: refreshTokenExpiresAt });

    return {
      response: toAuthResponse(user, accessToken),
      refreshToken: rawRefreshToken,
      refreshTokenExpiresAt,
    };
  }
}

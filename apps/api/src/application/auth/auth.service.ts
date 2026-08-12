import { randomInt } from "node:crypto";
import type { AuthResponseDto, LoginInput, ResendSignupOtpInput, SignupInput, SignupStartedDto, VerifySignupInput } from "@d-shirtak/shared";
import { ConflictError, ForbiddenError, UnauthorizedError, ValidationError } from "../../domain/errors.js";
import type { IUserRepository } from "../../domain/ports/repositories/user.repository.js";
import type { IRefreshTokenRepository } from "../../domain/ports/repositories/refresh-token.repository.js";
import type { IPendingSignupRepository } from "../../domain/ports/repositories/pending-signup.repository.js";
import type { IPasswordHasher } from "../../domain/ports/password-hasher.port.js";
import type { ITokenService } from "../../domain/ports/token-service.port.js";
import type { IEmailSender } from "../../domain/ports/email.port.js";
import type { User } from "../../domain/entities/user.entity.js";

export interface AuthResult {
  response: AuthResponseDto;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 45 * 1000;
const OTP_MAX_ATTEMPTS = 5;

function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
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
    private readonly pendingSignups: IPendingSignupRepository,
    private readonly emailSender: IEmailSender,
  ) {}

  /** Step 1 of signup: validates the email is free, stashes the (hashed) password, and emails an
   *  OTP. No User row is created yet -- see verifySignup for step 2. */
  async startSignup(input: SignupInput): Promise<SignupStartedDto> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new ConflictError("An account with this email already exists");

    const passwordHash = await this.hasher.hash(input.password);
    const code = generateOtpCode();
    const otpCodeHash = await this.hasher.hash(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await this.pendingSignups.replace({
      username: input.username,
      email: input.email,
      phone: input.phone,
      passwordHash,
      otpCodeHash,
      expiresAt,
    });
    await this.emailSender.sendOtpEmail(input.email, code);

    return { email: input.email, expiresInSeconds: OTP_TTL_MS / 1000 };
  }

  async resendSignupOtp(input: ResendSignupOtpInput): Promise<SignupStartedDto> {
    const pending = await this.pendingSignups.findByEmail(input.email);
    if (!pending) throw new ValidationError("No signup in progress for this email -- start again");

    const msSinceLastSend = Date.now() - pending.lastSentAt.getTime();
    if (msSinceLastSend < OTP_RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - msSinceLastSend) / 1000);
      throw new ValidationError(`Please wait ${waitSeconds}s before requesting another code`);
    }

    const code = generateOtpCode();
    const otpCodeHash = await this.hasher.hash(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await this.pendingSignups.updateOtp(pending.id, otpCodeHash, expiresAt);
    await this.emailSender.sendOtpEmail(input.email, code);

    return { email: input.email, expiresInSeconds: OTP_TTL_MS / 1000 };
  }

  /** Step 2 of signup: confirms the OTP and only then actually creates the account. */
  async verifySignup(input: VerifySignupInput): Promise<AuthResult> {
    const pending = await this.pendingSignups.findByEmail(input.email);
    if (!pending) throw new ValidationError("No signup in progress for this email -- start again");

    if (pending.expiresAt < new Date()) {
      await this.pendingSignups.delete(pending.id);
      throw new ValidationError("That code has expired -- request a new one");
    }
    if (pending.attempts >= OTP_MAX_ATTEMPTS) {
      await this.pendingSignups.delete(pending.id);
      throw new ValidationError("Too many incorrect attempts -- start signup again");
    }

    const valid = await this.hasher.compare(input.code, pending.otpCodeHash);
    if (!valid) {
      await this.pendingSignups.incrementAttempts(pending.id);
      throw new ValidationError("Incorrect code");
    }

    // Re-check in case someone else grabbed this email while the signup was pending.
    const existing = await this.users.findByEmail(pending.email);
    if (existing) {
      await this.pendingSignups.delete(pending.id);
      throw new ConflictError("An account with this email already exists");
    }

    const user = await this.users.create({
      username: pending.username,
      email: pending.email,
      phone: pending.phone,
      passwordHash: pending.passwordHash,
      role: "CUSTOMER",
    });
    await this.pendingSignups.delete(pending.id);

    return this.issueTokens(user);
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.users.findByEmail(input.email);
    if (!user) throw new UnauthorizedError("Invalid email or password");

    const valid = await this.hasher.compare(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Invalid email or password");

    // Checked after the password, not before -- otherwise the error response itself would leak
    // which emails are blocked to anyone who doesn't even know the password.
    if (user.isBlocked) {
      throw new ForbiddenError("This account has been blocked. Contact support if you think this is a mistake.");
    }

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

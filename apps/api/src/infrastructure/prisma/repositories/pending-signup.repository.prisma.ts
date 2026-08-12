import type { PrismaClient } from "@prisma/client";
import type { PendingSignup } from "../../../domain/entities/pending-signup.entity.js";
import type { IPendingSignupRepository } from "../../../domain/ports/repositories/pending-signup.repository.js";

export class PrismaPendingSignupRepository implements IPendingSignupRepository {
  constructor(private readonly db: PrismaClient) {}

  findByEmail(email: string): Promise<PendingSignup | null> {
    return this.db.pendingSignup.findUnique({ where: { email } });
  }

  async replace(input: {
    username: string;
    email: string;
    phone: string;
    passwordHash: string;
    otpCodeHash: string;
    expiresAt: Date;
  }): Promise<PendingSignup> {
    await this.db.pendingSignup.deleteMany({ where: { email: input.email } });
    return this.db.pendingSignup.create({ data: input });
  }

  updateOtp(id: string, otpCodeHash: string, expiresAt: Date): Promise<PendingSignup> {
    return this.db.pendingSignup.update({
      where: { id },
      data: { otpCodeHash, expiresAt, attempts: 0, lastSentAt: new Date() },
    });
  }

  incrementAttempts(id: string): Promise<PendingSignup> {
    return this.db.pendingSignup.update({ where: { id }, data: { attempts: { increment: 1 } } });
  }

  async delete(id: string): Promise<void> {
    await this.db.pendingSignup.deleteMany({ where: { id } });
  }
}

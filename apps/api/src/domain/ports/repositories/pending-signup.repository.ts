import type { PendingSignup } from "../../entities/pending-signup.entity.js";

export interface IPendingSignupRepository {
  findByEmail(email: string): Promise<PendingSignup | null>;
  /** Deletes any existing pending signup for this email first, then creates a fresh one --
   *  starting signup again with the same email (e.g. after a typo'd password) just restarts it. */
  replace(input: {
    username: string;
    email: string;
    phone: string;
    passwordHash: string;
    otpCodeHash: string;
    expiresAt: Date;
  }): Promise<PendingSignup>;
  /** Refreshes the code/expiry and resets attempts to 0, keeping the same username/passwordHash
   *  already captured -- used for "resend code". */
  updateOtp(id: string, otpCodeHash: string, expiresAt: Date): Promise<PendingSignup>;
  incrementAttempts(id: string): Promise<PendingSignup>;
  delete(id: string): Promise<void>;
}

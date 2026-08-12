export interface PendingSignup {
  id: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  otpCodeHash: string;
  attempts: number;
  expiresAt: Date;
  lastSentAt: Date;
  createdAt: Date;
}

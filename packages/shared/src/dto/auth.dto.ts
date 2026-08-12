import { z } from "zod";
import type { Role } from "../enums.js";

// Egyptian mobile numbers: local format is 0 + a 2-digit carrier prefix (10/11/12/15) + 8 more
// digits (11 digits total, e.g. "01128507553"). International/E.164 format drops the leading 0
// and adds the country code: "+20" + prefix + 8 digits, e.g. "+201128507553".
const EGYPT_PHONE_PATTERN = /^\+20(10|11|12|15)\d{8}$/;

/** Rejects numbers that pass the format check but are obviously not real -- all the trailing
 *  digits repeated (e.g. "+201199999999"), or the whole number counting straight up/down. A
 *  format-only check lets exactly this kind of junk through, which is the actual thing being
 *  guarded against here (mandatory field people will otherwise just mash to get past). */
function looksFake(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  const last8 = digits.slice(-8);
  if (/^(\d)\1{7}$/.test(last8)) return true;
  const nums = digits.split("").map(Number);
  const ascending = nums.every((n, i) => i === 0 || n === nums[i - 1]! + 1);
  const descending = nums.every((n, i) => i === 0 || n === nums[i - 1]! - 1);
  return ascending || descending;
}

export const egyptianPhoneSchema = z
  .string()
  .regex(EGYPT_PHONE_PATTERN, "Enter a valid Egyptian mobile number, e.g. +201128507553")
  .refine((phone) => !looksFake(phone), "That doesn't look like a real phone number");

export const signupSchema = z.object({
  username: z.string().min(2).max(40),
  email: z.string().email(),
  phone: egyptianPhoneSchema,
  password: z.string().min(8).max(72),
});
export type SignupInput = z.infer<typeof signupSchema>;

/** Signup is two-step: POST /auth/signup starts it (sends an OTP, no account created yet), then
 *  POST /auth/signup/verify confirms the code and actually creates the account. Prevents
 *  drive-by/bot signups and never permanently reserves an email that's never verified. */
export const verifySignupSchema = z.object({
  email: z.string().email(),
  code: z
    .string()
    .length(6)
    .regex(/^\d{6}$/, "Code must be 6 digits"),
});
export type VerifySignupInput = z.infer<typeof verifySignupSchema>;

export const resendSignupOtpSchema = z.object({
  email: z.string().email(),
});
export type ResendSignupOtpInput = z.infer<typeof resendSignupOtpSchema>;

export interface SignupStartedDto {
  email: string;
  expiresInSeconds: number;
}

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthUserDto {
  id: string;
  username: string;
  email: string;
  role: Role;
}

export interface AuthResponseDto {
  user: AuthUserDto;
  accessToken: string;
}

import { z } from "zod";
import type { Role } from "../enums.js";

export const signupSchema = z.object({
  username: z.string().min(2).max(40),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});
export type SignupInput = z.infer<typeof signupSchema>;

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

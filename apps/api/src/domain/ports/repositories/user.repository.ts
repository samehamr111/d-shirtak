import type { User } from "../../entities/user.entity.js";

export interface CreateUserInput {
  username: string;
  email: string;
  passwordHash: string;
  role?: "CUSTOMER" | "ADMIN";
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
}

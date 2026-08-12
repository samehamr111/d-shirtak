import type { User, UserWithOrderCount } from "../../entities/user.entity.js";

export interface CreateUserInput {
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  role?: "CUSTOMER" | "ADMIN";
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  /** CUSTOMER-role accounts only (admins never show up in the admin Users list), each with how
   *  many orders they've placed. */
  listCustomers(): Promise<UserWithOrderCount[]>;
  findByIdWithOrderCount(id: string): Promise<UserWithOrderCount | null>;
  countCustomers(): Promise<number>;
  countCustomersSince(date: Date): Promise<number>;
  block(id: string, reason: string): Promise<User>;
  unblock(id: string): Promise<User>;
}

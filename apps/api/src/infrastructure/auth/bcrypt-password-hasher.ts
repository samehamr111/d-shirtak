import bcrypt from "bcryptjs";
import type { IPasswordHasher } from "../../domain/ports/password-hasher.port.js";

const SALT_ROUNDS = 11;

export class BcryptPasswordHasher implements IPasswordHasher {
  hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, SALT_ROUNDS);
  }

  compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}

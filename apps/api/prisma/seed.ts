import { PrismaClient } from "@prisma/client";
import { BcryptPasswordHasher } from "../src/infrastructure/auth/bcrypt-password-hasher.js";

const prisma = new PrismaClient();
const hasher = new BcryptPasswordHasher();

const ADMIN_USERNAME = "D-Shirtak Admin";
const ADMIN_EMAIL = "admin@d-shirtak.com";
const ADMIN_PASSWORD = "Admin1234!";

async function main() {
  const existing = await prisma.user.count();
  if (existing > 0) {
    console.log("Database already has data -- skipping seed.");
    return;
  }

  console.log("Seeding admin account...");
  await prisma.user.create({
    data: {
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      passwordHash: await hasher.hash(ADMIN_PASSWORD),
      role: "ADMIN",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

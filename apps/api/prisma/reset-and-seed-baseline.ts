/**
 * DESTRUCTIVE one-off script -- wipes every product, order, cart, design, upload, color, size,
 * category, design-library asset, pending signup, and font from the database (keeping ADMIN-role
 * users and the StoreSettings row untouched), empties the entire R2 bucket, then reseeds a
 * minimal baseline: 3 colors, sizes S-L, 2 categories, and a few real Arabic/English fonts
 * sourced from the same @fontsource packages already used for the site's own UI (open-licensed,
 * not invented content).
 *
 * This is meant to be run once against PRODUCTION to reset it for a clean test pass. It reads
 * R2 credentials and the public base URL directly from the environment (not the app's normal
 * config selection logic), so it always targets R2 regardless of how the running server happens
 * to be configured locally. Run it with the production DATABASE_URL and R2_* vars explicitly set:
 *
 *   DATABASE_URL="<production sqlserver connection string>" \
 *   R2_ACCOUNT_ID="..." R2_ACCESS_KEY_ID="..." R2_SECRET_ACCESS_KEY="..." R2_BUCKET_NAME="..." \
 *   PUBLIC_UPLOADS_BASE_URL="https://<your-api-domain>/uploads" \
 *   npx tsx prisma/reset-and-seed-baseline.ts
 */
import path from "node:path";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { PrismaClient } from "@prisma/client";
import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const prisma = new PrismaClient();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_UPLOADS_BASE_URL = process.env.PUBLIC_UPLOADS_BASE_URL;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !PUBLIC_UPLOADS_BASE_URL) {
  console.error(
    "Missing one of R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME / PUBLIC_UPLOADS_BASE_URL " +
      "in the environment -- see the comment at the top of this file for the full command.",
  );
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

async function clearR2Bucket(): Promise<void> {
  console.log("Clearing R2 bucket...");
  let continuationToken: string | undefined;
  let totalDeleted = 0;
  do {
    const list = await s3.send(
      new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME, ContinuationToken: continuationToken }),
    );
    const keys = (list.Contents ?? []).flatMap((o) => (o.Key ? [{ Key: o.Key }] : []));
    if (keys.length > 0) {
      await s3.send(new DeleteObjectsCommand({ Bucket: R2_BUCKET_NAME, Delete: { Objects: keys } }));
      totalDeleted += keys.length;
    }
    continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (continuationToken);
  console.log(`  Deleted ${totalDeleted} object(s) from R2.\n`);
}

async function uploadFontFile(localFilePath: string): Promise<string> {
  const buffer = readFileSync(localFilePath);
  const key = `fonts/${randomUUID()}.woff2`;
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: "font/woff2",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return `${PUBLIC_UPLOADS_BASE_URL}/${key}`;
}

async function clearDatabase(): Promise<void> {
  console.log("Clearing database (keeping ADMIN-role users and store settings)...");
  // Safe to run before or after today's schema migrations have actually been deployed --
  // pending_signups doesn't exist yet on a target still running the pre-OTP-signup schema.
  await prisma.pendingSignup.deleteMany().catch((err) => {
    if (err?.code !== "P2021") throw err;
  });
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.userUpload.deleteMany();
  await prisma.design.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productColor.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.product.deleteMany();
  await prisma.designAsset.deleteMany();
  await prisma.designCategory.deleteMany();
  await prisma.font.deleteMany();
  await prisma.color.deleteMany();
  await prisma.size.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.refreshToken.deleteMany();
  const { count } = await prisma.user.deleteMany({ where: { role: { not: "ADMIN" } } });
  console.log(`  Removed ${count} non-admin user(s). Admin account(s) and store settings kept.\n`);
}

async function seedBaseline(): Promise<void> {
  console.log("Seeding baseline catalog data...");

  await prisma.color.createMany({
    data: [
      { name: "White", hexCode: "#FFFFFF" },
      { name: "Navy", hexCode: "#1E2A4A" },
      { name: "Black", hexCode: "#111111" },
    ],
  });
  console.log("  Colors: White, Navy, Black");

  const sizeNames = ["Small", "Medium", "Large"];
  for (let i = 0; i < sizeNames.length; i++) {
    await prisma.size.create({ data: { name: sizeNames[i]!, sortOrder: i } });
  }
  console.log("  Sizes: Small, Medium, Large");

  await prisma.category.createMany({
    data: [
      { name: "Hoodies", slug: "hoodies" },
      { name: "T-Shirts", slug: "t-shirts" },
    ],
  });
  console.log("  Categories: Hoodies, T-Shirts");

  const require = createRequire(import.meta.url);
  const fontsDir = (pkg: string) =>
    path.join(path.dirname(require.resolve(`@fontsource/${pkg}/package.json`)), "files");
  const fontSpecs = [
    { name: "Cairo", language: "AR", fontFamily: "Cairo", file: path.join(fontsDir("cairo"), "cairo-arabic-700-normal.woff2") },
    { name: "Tajawal", language: "AR", fontFamily: "Tajawal", file: path.join(fontsDir("tajawal"), "tajawal-arabic-700-normal.woff2") },
    { name: "Montserrat", language: "EN", fontFamily: "Montserrat", file: path.join(fontsDir("montserrat"), "montserrat-latin-700-normal.woff2") },
    { name: "Oswald", language: "EN", fontFamily: "Oswald", file: path.join(fontsDir("oswald"), "oswald-latin-700-normal.woff2") },
  ];

  for (const spec of fontSpecs) {
    const fileUrl = await uploadFontFile(spec.file);
    await prisma.font.create({ data: { name: spec.name, language: spec.language, fontFamily: spec.fontFamily, fileUrl } });
    console.log(`  Font: ${spec.name} (${spec.language})`);
  }

  console.log("\nDone. Products, variants, and design-library assets are empty -- add them fresh through the admin panel.");
}

async function main() {
  await clearR2Bucket();
  await clearDatabase();
  await seedBaseline();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

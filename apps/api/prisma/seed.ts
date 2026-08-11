import { promises as fs } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { env } from "../src/infrastructure/config/env.js";
import { BcryptPasswordHasher } from "../src/infrastructure/auth/bcrypt-password-hasher.js";
import { generateOrderNumber } from "../src/domain/services/order-number.service.js";
import { centeredPrintArea, garmentSvg, iconSvg, TEE_BODY_PATH } from "./garment-art.js";

const prisma = new PrismaClient();
const hasher = new BcryptPasswordHasher();
const uploadsRoot = path.resolve(env.UPLOADS_DIR);

async function saveSvg(category: string, fileName: string, svg: string): Promise<string> {
  const dir = path.join(uploadsRoot, category);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, fileName), svg, "utf-8");
  return `${env.PUBLIC_UPLOADS_BASE_URL}/${category}/${fileName}`;
}

async function main() {
  const existing = await prisma.user.count();
  if (existing > 0) {
    console.log("Database already has data -- skipping seed.");
    return;
  }

  console.log("Seeding categories, colors, sizes...");
  const [shirts, hoodies] = await Promise.all([
    prisma.category.create({ data: { name: "Shirts", slug: "shirts" } }),
    prisma.category.create({ data: { name: "Hoodies", slug: "hoodies" } }),
  ]);

  const colorDefs = [
    { name: "Black", hexCode: "#111111" },
    { name: "White", hexCode: "#f8fafc" },
    { name: "Red", hexCode: "#dc2626" },
    { name: "Navy", hexCode: "#1e3a8a" },
    { name: "Heather Grey", hexCode: "#9ca3af" },
  ];
  const colors = Object.fromEntries(
    await Promise.all(colorDefs.map(async (c) => [c.name, await prisma.color.create({ data: c })] as const)),
  );

  const sizeDefs = [
    { name: "S", sortOrder: 1 },
    { name: "M", sortOrder: 2 },
    { name: "L", sortOrder: 3 },
    { name: "XL", sortOrder: 4 },
    { name: "XXL", sortOrder: 5 },
  ];
  const sizes = Object.fromEntries(
    await Promise.all(sizeDefs.map(async (s) => [s.name, await prisma.size.create({ data: s })] as const)),
  );

  console.log("Seeding fonts (downloaded into local disk storage)...");
  await prisma.font.createMany({
    data: [
      { name: "Poppins", language: "EN", fontFamily: "Poppins", fileUrl: `${env.PUBLIC_UPLOADS_BASE_URL}/fonts/poppins-regular.woff2` },
      { name: "Bebas Neue", language: "EN", fontFamily: "Bebas Neue", fileUrl: `${env.PUBLIC_UPLOADS_BASE_URL}/fonts/bebas-neue-regular.woff2` },
      { name: "Cairo", language: "AR", fontFamily: "Cairo", fileUrl: `${env.PUBLIC_UPLOADS_BASE_URL}/fonts/cairo-regular.woff2` },
      { name: "Amiri", language: "AR", fontFamily: "Amiri", fileUrl: `${env.PUBLIC_UPLOADS_BASE_URL}/fonts/amiri-regular.woff2` },
    ],
  });

  console.log("Seeding curated design library...");
  const classicCat = await prisma.designCategory.create({ data: { name: "Classic" } });
  const coolCat = await prisma.designCategory.create({ data: { name: "Cool Designs" } });

  const iconDefs: { name: string; shape: "star" | "heart" | "bolt" | "wave"; hex: string; categoryId: string }[] = [
    { name: "Mono Star", shape: "star", hex: "#111111", categoryId: classicCat.id },
    { name: "Classic Heart", shape: "heart", hex: "#dc2626", categoryId: classicCat.id },
    { name: "Neon Bolt", shape: "bolt", hex: "#facc15", categoryId: coolCat.id },
    { name: "Retro Wave", shape: "wave", hex: "#0ea5e9", categoryId: coolCat.id },
  ];
  for (const icon of iconDefs) {
    const fileName = `${icon.shape}-${icon.hex.replace("#", "")}.svg`;
    const url = await saveSvg("assets", fileName, iconSvg(icon.hex, icon.shape));
    await prisma.designAsset.create({ data: { name: icon.name, imageUrl: url, designCategoryId: icon.categoryId } });
  }

  console.log("Seeding products, colors, sizes, and variants...");

  // -- Classic Crew Tee ------------------------------------------------------
  const tee = await prisma.product.create({
    data: {
      categoryId: shirts.id,
      code: "TEE-CLASSIC-001",
      name: "Classic Crew Tee",
      slug: "classic-crew-tee",
      description: "Our best-selling 100% cotton crew neck tee -- a clean canvas for your own design.",
      basePrice: 350,
      garmentType: "TEE",
      productType: "CUSTOMIZABLE",
      isActive: true,
    },
  });

  for (const colorName of ["Black", "White", "Red"]) {
    const color = colors[colorName]!;
    const front = await saveSvg("products", `${tee.slug}-${color.id}-front.svg`, garmentSvg("TEE", "front", color.hexCode));
    const back = await saveSvg("products", `${tee.slug}-${color.id}-back.svg`, garmentSvg("TEE", "back", color.hexCode));
    await prisma.productColor.create({
      data: { productId: tee.id, colorId: color.id, frontImageUrl: front, backImageUrl: back },
    });
  }

  const teeSizeSpecs: Record<string, { chest: number; length: number; waist: number; printScale: number }> = {
    S: { chest: 46, length: 68, waist: 44, printScale: 0.85 },
    M: { chest: 49, length: 70, waist: 47, printScale: 0.92 },
    L: { chest: 52, length: 72, waist: 50, printScale: 1.0 },
    XL: { chest: 55, length: 74, waist: 53, printScale: 1.08 },
    XXL: { chest: 58, length: 76, waist: 56, printScale: 1.15 },
  };
  for (const [sizeName, spec] of Object.entries(teeSizeSpecs)) {
    const size = sizes[sizeName]!;
    const front = centeredPrintArea("TEE", 26 * spec.printScale, 32 * spec.printScale, 18);
    const back = centeredPrintArea("TEE", 28 * spec.printScale, 34 * spec.printScale, 16);
    await prisma.productSize.create({
      data: {
        productId: tee.id,
        sizeId: size.id,
        printAreaFrontWidthCm: front.widthCm,
        printAreaFrontHeightCm: front.heightCm,
        printAreaFrontOffsetXCm: front.offsetXCm,
        printAreaFrontOffsetYCm: front.offsetYCm,
        printAreaBackWidthCm: back.widthCm,
        printAreaBackHeightCm: back.heightCm,
        printAreaBackOffsetXCm: back.offsetXCm,
        printAreaBackOffsetYCm: back.offsetYCm,
        chestWidthCm: spec.chest,
        lengthCm: spec.length,
        waistCm: spec.waist,
      },
    });
  }

  const teeStock: Record<string, Record<string, number>> = {
    Black: { S: 20, M: 30, L: 25, XL: 15, XXL: 8 },
    White: { S: 18, M: 22, L: 20, XL: 10, XXL: 0 }, // deliberately out of stock
    Red: { S: 12, M: 16, L: 14, XL: 0, XXL: 5 }, // deliberately out of stock
  };
  const teeVariants: Record<string, Record<string, { id: string }>> = {};
  for (const [colorName, bySize] of Object.entries(teeStock)) {
    teeVariants[colorName] = {};
    for (const [sizeName, stockQuantity] of Object.entries(bySize)) {
      const color = colors[colorName]!;
      const size = sizes[sizeName]!;
      const variant = await prisma.productVariant.create({
        data: {
          productId: tee.id,
          colorId: color.id,
          sizeId: size.id,
          sku: `TEE-${colorName.slice(0, 2).toUpperCase()}-${sizeName}`,
          stockQuantity,
        },
      });
      teeVariants[colorName]![sizeName] = variant;
    }
  }

  // -- Vintage Wash Tee ------------------------------------------------------
  const vintageTee = await prisma.product.create({
    data: {
      categoryId: shirts.id,
      code: "TEE-VINTAGE-001",
      name: "Vintage Wash Tee",
      slug: "vintage-wash-tee",
      description: "A garment-washed tee with a broken-in feel, perfect for a worn-in print look.",
      basePrice: 380,
      garmentType: "TEE",
      productType: "CUSTOMIZABLE",
      isActive: true,
    },
  });
  for (const colorName of ["White", "Heather Grey"]) {
    const color = colors[colorName]!;
    const front = await saveSvg("products", `${vintageTee.slug}-${color.id}-front.svg`, garmentSvg("TEE", "front", color.hexCode));
    const back = await saveSvg("products", `${vintageTee.slug}-${color.id}-back.svg`, garmentSvg("TEE", "back", color.hexCode));
    await prisma.productColor.create({ data: { productId: vintageTee.id, colorId: color.id, frontImageUrl: front, backImageUrl: back } });
  }
  for (const sizeName of ["S", "M", "L", "XL"]) {
    const spec = teeSizeSpecs[sizeName]!;
    const size = sizes[sizeName]!;
    const front = centeredPrintArea("TEE", 24 * spec.printScale, 30 * spec.printScale, 19);
    const back = centeredPrintArea("TEE", 26 * spec.printScale, 32 * spec.printScale, 17);
    await prisma.productSize.create({
      data: {
        productId: vintageTee.id,
        sizeId: size.id,
        printAreaFrontWidthCm: front.widthCm,
        printAreaFrontHeightCm: front.heightCm,
        printAreaFrontOffsetXCm: front.offsetXCm,
        printAreaFrontOffsetYCm: front.offsetYCm,
        printAreaBackWidthCm: back.widthCm,
        printAreaBackHeightCm: back.heightCm,
        printAreaBackOffsetXCm: back.offsetXCm,
        printAreaBackOffsetYCm: back.offsetYCm,
        chestWidthCm: spec.chest,
        lengthCm: spec.length,
        waistCm: spec.waist,
      },
    });
  }
  for (const colorName of ["White", "Heather Grey"]) {
    for (const sizeName of ["S", "M", "L", "XL"]) {
      const color = colors[colorName]!;
      const size = sizes[sizeName]!;
      await prisma.productVariant.create({
        data: {
          productId: vintageTee.id,
          colorId: color.id,
          sizeId: size.id,
          sku: `VTG-${colorName.slice(0, 2).toUpperCase()}-${sizeName}`,
          stockQuantity: 10,
        },
      });
    }
  }

  // -- Oversized Hoodie -------------------------------------------------------
  const hoodie = await prisma.product.create({
    data: {
      categoryId: hoodies.id,
      code: "HOOD-OVERSIZED-001",
      name: "Oversized Hoodie",
      slug: "oversized-hoodie",
      description: "Heavyweight fleece hoodie with a relaxed, oversized fit and a roomy front pocket.",
      basePrice: 650,
      garmentType: "HOODIE",
      productType: "CUSTOMIZABLE",
      isActive: true,
    },
  });
  for (const colorName of ["Black", "Navy", "Heather Grey"]) {
    const color = colors[colorName]!;
    const front = await saveSvg("products", `${hoodie.slug}-${color.id}-front.svg`, garmentSvg("HOODIE", "front", color.hexCode));
    const back = await saveSvg("products", `${hoodie.slug}-${color.id}-back.svg`, garmentSvg("HOODIE", "back", color.hexCode));
    await prisma.productColor.create({ data: { productId: hoodie.id, colorId: color.id, frontImageUrl: front, backImageUrl: back } });
  }
  const hoodieSizeSpecs: Record<string, { chest: number; length: number; waist: number; printScale: number }> = {
    M: { chest: 58, length: 72, waist: 56, printScale: 0.95 },
    L: { chest: 61, length: 74, waist: 59, printScale: 1.0 },
    XL: { chest: 64, length: 76, waist: 62, printScale: 1.08 },
    XXL: { chest: 67, length: 78, waist: 65, printScale: 1.15 },
  };
  for (const [sizeName, spec] of Object.entries(hoodieSizeSpecs)) {
    const size = sizes[sizeName]!;
    const front = centeredPrintArea("HOODIE", 24 * spec.printScale, 26 * spec.printScale, 28);
    const back = centeredPrintArea("HOODIE", 30 * spec.printScale, 34 * spec.printScale, 20);
    await prisma.productSize.create({
      data: {
        productId: hoodie.id,
        sizeId: size.id,
        printAreaFrontWidthCm: front.widthCm,
        printAreaFrontHeightCm: front.heightCm,
        printAreaFrontOffsetXCm: front.offsetXCm,
        printAreaFrontOffsetYCm: front.offsetYCm,
        printAreaBackWidthCm: back.widthCm,
        printAreaBackHeightCm: back.heightCm,
        printAreaBackOffsetXCm: back.offsetXCm,
        printAreaBackOffsetYCm: back.offsetYCm,
        chestWidthCm: spec.chest,
        lengthCm: spec.length,
        waistCm: spec.waist,
      },
    });
  }
  const hoodieStock: Record<string, Record<string, number>> = {
    Black: { M: 14, L: 18, XL: 12, XXL: 6 },
    Navy: { M: 10, L: 12, XL: 0, XXL: 4 }, // deliberately out of stock
    "Heather Grey": { M: 9, L: 11, XL: 7, XXL: 3 },
  };
  for (const [colorName, bySize] of Object.entries(hoodieStock)) {
    for (const [sizeName, stockQuantity] of Object.entries(bySize)) {
      const color = colors[colorName]!;
      const size = sizes[sizeName]!;
      await prisma.productVariant.create({
        data: {
          productId: hoodie.id,
          colorId: color.id,
          sizeId: size.id,
          sku: `HOOD-${colorName.replace(" ", "").slice(0, 2).toUpperCase()}-${sizeName}`,
          stockQuantity,
        },
      });
    }
  }

  console.log("Seeding users...");
  const admin = await prisma.user.create({
    data: {
      username: "D-Shirtak Admin",
      email: "admin@dshirtak.com",
      passwordHash: await hasher.hash("Admin123!"),
      role: "ADMIN",
    },
  });
  const customer = await prisma.user.create({
    data: {
      username: "Sameh Demo",
      email: "demo@dshirtak.com",
      passwordHash: await hasher.hash("Demo1234!"),
      role: "CUSTOMER",
    },
  });
  await prisma.address.create({
    data: {
      userId: customer.id,
      label: "Home",
      fullName: "Sameh Demo",
      phone: "+20 100 000 0000",
      line1: "12 Tahrir Street",
      city: "Cairo",
      governorate: "Cairo",
      country: "Egypt",
      isDefault: true,
    },
  });

  console.log("Seeding a sample saved design and orders...");
  const blackMVariant = teeVariants.Black!.M!;
  const redSVariant = teeVariants.Red!.S!;

  const sampleCanvasJson = JSON.stringify({
    version: "5.3.0",
    objects: [
      { type: "i-text", text: "D-SHIRTAK", fontFamily: "Bebas Neue", fill: "#ffffff", fontSize: 64, left: 120, top: 260 },
    ],
  });
  const previewUrl = await saveSvg(
    "designs",
    `sample-${blackMVariant.id}-front.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 116" width="900" height="1044">
      <rect width="100" height="116" fill="#f4f4f5" />
      <path d="${TEE_BODY_PATH}" fill="#111111" />
      <text x="50" y="55" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="7" fill="#ffffff">D-SHIRTAK</text>
    </svg>`,
  );
  const sampleDesign = await prisma.design.create({
    data: {
      ownerUserId: customer.id,
      productVariantId: blackMVariant.id,
      side: "FRONT",
      canvasJson: sampleCanvasJson,
      previewImageUrl: previewUrl,
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: customer.id,
      status: "PENDING",
      subtotal: 350,
      shippingFee: 75,
      total: 425,
      shipFullName: "Sameh Demo",
      shipPhone: "+20 100 000 0000",
      shipLine1: "12 Tahrir Street",
      shipCity: "Cairo",
      shipGovernorate: "Cairo",
      shipCountry: "Egypt",
      items: {
        create: [
          {
            productVariantId: blackMVariant.id,
            productNameSnapshot: tee.name,
            colorNameSnapshot: "Black",
            sizeNameSnapshot: "M",
            quantity: 1,
            unitPrice: 350,
            frontDesignId: sampleDesign.id,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: customer.id,
      status: "CONFIRMED",
      subtotal: 350,
      shippingFee: 75,
      total: 425,
      shipFullName: "Sameh Demo",
      shipPhone: "+20 100 000 0000",
      shipLine1: "12 Tahrir Street",
      shipCity: "Cairo",
      shipGovernorate: "Cairo",
      shipCountry: "Egypt",
      items: {
        create: [
          {
            productVariantId: redSVariant.id,
            productNameSnapshot: tee.name,
            colorNameSnapshot: "Red",
            sizeNameSnapshot: "S",
            quantity: 1,
            unitPrice: 350,
          },
        ],
      },
    },
  });

  console.log("Seed complete.");
  console.log("  Admin login:    admin@dshirtak.com / Admin123!");
  console.log("  Customer login: demo@dshirtak.com / Demo1234!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

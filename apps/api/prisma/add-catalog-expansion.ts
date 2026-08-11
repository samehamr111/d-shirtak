/**
 * One-off addition to an already-seeded database: adds 2 colors (Sand, Olive), a new "Egypt
 * Collection" design-library category with 6 assets, and 3 new products (1 CUSTOMIZABLE, 2
 * READY_PRINTED -- the first live examples of that product type). Additive only -- does not
 * touch users, orders, designs, or the existing 3 products/5 colors/4 design assets.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { env } from "../src/infrastructure/config/env.js";
import { centeredPrintArea, garmentSvg, iconSvg, printedGarmentSvg, type IconShape } from "./garment-art.js";

const prisma = new PrismaClient();
const uploadsRoot = path.resolve(env.UPLOADS_DIR);

async function saveSvg(category: string, fileName: string, svg: string): Promise<string> {
  const dir = path.join(uploadsRoot, category);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, fileName), svg, "utf-8");
  return `${env.PUBLIC_UPLOADS_BASE_URL}/${category}/${fileName}`;
}

const TEE_SIZE_SPECS: Record<string, { chest: number; length: number; waist: number; printScale: number }> = {
  S: { chest: 46, length: 68, waist: 44, printScale: 0.85 },
  M: { chest: 49, length: 70, waist: 47, printScale: 0.92 },
  L: { chest: 52, length: 72, waist: 50, printScale: 1.0 },
  XL: { chest: 55, length: 74, waist: 53, printScale: 1.08 },
  XXL: { chest: 58, length: 76, waist: 56, printScale: 1.15 },
};

const HOODIE_SIZE_SPECS: Record<string, { chest: number; length: number; waist: number; printScale: number }> = {
  M: { chest: 58, length: 72, waist: 56, printScale: 0.95 },
  L: { chest: 61, length: 74, waist: 59, printScale: 1.0 },
  XL: { chest: 64, length: 76, waist: 62, printScale: 1.08 },
  XXL: { chest: 67, length: 78, waist: 65, printScale: 1.15 },
};

async function main() {
  const already = await prisma.product.findUnique({ where: { slug: "desert-sand-tee" } });
  if (already) {
    console.log("Catalog expansion already applied -- skipping.");
    return;
  }

  console.log("Creating new colors...");
  const sand = await prisma.color.create({ data: { name: "Sand", hexCode: "#E3C7A0" } });
  const olive = await prisma.color.create({ data: { name: "Olive", hexCode: "#5C6B47" } });
  const black = await prisma.color.findFirst({ where: { name: "Black" } });
  const white = await prisma.color.findFirst({ where: { name: "White" } });
  if (!black || !white) throw new Error("Expected Black and White colors from the original seed to exist.");

  console.log("Creating 'Egypt Collection' design assets...");
  const egyptCat = await prisma.designCategory.create({ data: { name: "Egypt Collection" } });
  const iconDefs: { name: string; shape: IconShape; hex: string }[] = [
    { name: "Cairo Skyline", shape: "skyline", hex: "#111111" },
    { name: "Giza Pyramids", shape: "pyramids", hex: "#a3541e" },
    { name: "Desert Dune Wave", shape: "dunewave", hex: "#c98a3f" },
    { name: "Cairo Wordmark", shape: "cairotext", hex: "#111111" },
    { name: "Geometric Star Lattice", shape: "starlattice", hex: "#0e7a52" },
    { name: "Desert Falcon", shape: "falcon", hex: "#111111" },
  ];
  for (const icon of iconDefs) {
    const fileName = `${icon.shape}-${icon.hex.replace("#", "")}.svg`;
    const url = await saveSvg("assets", fileName, iconSvg(icon.hex, icon.shape));
    await prisma.designAsset.create({ data: { name: icon.name, imageUrl: url, designCategoryId: egyptCat.id } });
  }

  const shirts = await prisma.category.findUnique({ where: { slug: "shirts" } });
  const hoodies = await prisma.category.findUnique({ where: { slug: "hoodies" } });
  if (!shirts || !hoodies) throw new Error("Expected Shirts and Hoodies categories from the original seed to exist.");

  // -- Desert Sand Tee (CUSTOMIZABLE) -----------------------------------------
  console.log("Creating Desert Sand Tee...");
  const sandTee = await prisma.product.create({
    data: {
      categoryId: shirts.id,
      code: "TEE-SAND-001",
      name: "Desert Sand Tee",
      slug: "desert-sand-tee",
      description: "A warm-toned tee in earthy desert colors -- a blank canvas for your own design.",
      basePrice: 360,
      garmentType: "TEE",
      productType: "CUSTOMIZABLE",
      isActive: true,
    },
  });
  const sandTeeColors = [
    { name: "Sand", color: sand },
    { name: "Olive", color: olive },
    { name: "Black", color: black },
  ];
  for (const { color } of sandTeeColors) {
    const front = await saveSvg("products", `${sandTee.slug}-${color.id}-front.svg`, garmentSvg("TEE", "front", color.hexCode));
    const back = await saveSvg("products", `${sandTee.slug}-${color.id}-back.svg`, garmentSvg("TEE", "back", color.hexCode));
    await prisma.productColor.create({ data: { productId: sandTee.id, colorId: color.id, frontImageUrl: front, backImageUrl: back } });
  }
  for (const [sizeName, spec] of Object.entries(TEE_SIZE_SPECS)) {
    const size = await prisma.size.findFirst({ where: { name: sizeName } });
    if (!size) throw new Error(`Expected size ${sizeName} to exist.`);
    const front = centeredPrintArea("TEE", 26 * spec.printScale, 32 * spec.printScale, 18);
    const back = centeredPrintArea("TEE", 28 * spec.printScale, 34 * spec.printScale, 16);
    await prisma.productSize.create({
      data: {
        productId: sandTee.id,
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
    for (const { name: colorName, color } of sandTeeColors) {
      await prisma.productVariant.create({
        data: {
          productId: sandTee.id,
          colorId: color.id,
          sizeId: size.id,
          sku: `SAND-${colorName.slice(0, 2).toUpperCase()}-${sizeName}`,
          stockQuantity: 12,
        },
      });
    }
  }

  // -- Giza Pyramids Tee (READY_PRINTED) --------------------------------------
  console.log("Creating Giza Pyramids Tee...");
  const pyramidsTee = await prisma.product.create({
    data: {
      categoryId: shirts.id,
      code: "TEE-PYRAMIDS-001",
      name: "Giza Pyramids Tee",
      slug: "giza-pyramids-tee",
      description: "A ready-printed tee with a flat desert-sunset pyramids graphic across the chest.",
      basePrice: 390,
      garmentType: "TEE",
      productType: "READY_PRINTED",
      isActive: true,
    },
  });
  const pyramidsTeeColors = [
    { name: "Sand", color: sand, ink: "#3d2b12" },
    { name: "White", color: white, ink: "#111111" },
  ];
  for (const { color, ink } of pyramidsTeeColors) {
    const front = await saveSvg(
      "products",
      `${pyramidsTee.slug}-${color.id}-front.svg`,
      printedGarmentSvg("TEE", "front", color.hexCode, { shape: "pyramids", hex: ink }),
    );
    const back = await saveSvg("products", `${pyramidsTee.slug}-${color.id}-back.svg`, garmentSvg("TEE", "back", color.hexCode));
    await prisma.productColor.create({ data: { productId: pyramidsTee.id, colorId: color.id, frontImageUrl: front, backImageUrl: back } });
  }
  for (const sizeName of ["S", "M", "L", "XL"]) {
    const spec = TEE_SIZE_SPECS[sizeName]!;
    const size = await prisma.size.findFirst({ where: { name: sizeName } });
    if (!size) throw new Error(`Expected size ${sizeName} to exist.`);
    const front = centeredPrintArea("TEE", 26 * spec.printScale, 32 * spec.printScale, 18);
    const back = centeredPrintArea("TEE", 28 * spec.printScale, 34 * spec.printScale, 16);
    await prisma.productSize.create({
      data: {
        productId: pyramidsTee.id,
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
    for (const { name: colorName, color } of pyramidsTeeColors) {
      await prisma.productVariant.create({
        data: {
          productId: pyramidsTee.id,
          colorId: color.id,
          sizeId: size.id,
          sku: `PYR-${colorName.slice(0, 2).toUpperCase()}-${sizeName}`,
          stockQuantity: 10,
        },
      });
    }
  }

  // -- Cairo Skyline Hoodie (READY_PRINTED) -----------------------------------
  console.log("Creating Cairo Skyline Hoodie...");
  const skylineHoodie = await prisma.product.create({
    data: {
      categoryId: hoodies.id,
      code: "HOOD-SKYLINE-001",
      name: "Cairo Skyline Hoodie",
      slug: "cairo-skyline-hoodie",
      description: "A ready-printed heavyweight hoodie with a flat Cairo skyline graphic across the chest.",
      basePrice: 680,
      garmentType: "HOODIE",
      productType: "READY_PRINTED",
      isActive: true,
    },
  });
  const skylineHoodieColors = [
    { name: "Olive", color: olive, ink: "#E3C7A0" },
    { name: "Black", color: black, ink: "#E3C7A0" },
  ];
  for (const { color, ink } of skylineHoodieColors) {
    const front = await saveSvg(
      "products",
      `${skylineHoodie.slug}-${color.id}-front.svg`,
      printedGarmentSvg("HOODIE", "front", color.hexCode, { shape: "skyline", hex: ink }),
    );
    const back = await saveSvg("products", `${skylineHoodie.slug}-${color.id}-back.svg`, garmentSvg("HOODIE", "back", color.hexCode));
    await prisma.productColor.create({ data: { productId: skylineHoodie.id, colorId: color.id, frontImageUrl: front, backImageUrl: back } });
  }
  for (const [sizeName, spec] of Object.entries(HOODIE_SIZE_SPECS)) {
    const size = await prisma.size.findFirst({ where: { name: sizeName } });
    if (!size) throw new Error(`Expected size ${sizeName} to exist.`);
    const front = centeredPrintArea("HOODIE", 24 * spec.printScale, 26 * spec.printScale, 28);
    const back = centeredPrintArea("HOODIE", 30 * spec.printScale, 34 * spec.printScale, 20);
    await prisma.productSize.create({
      data: {
        productId: skylineHoodie.id,
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
    for (const { name: colorName, color } of skylineHoodieColors) {
      await prisma.productVariant.create({
        data: {
          productId: skylineHoodie.id,
          colorId: color.id,
          sizeId: size.id,
          sku: `SKY-${colorName.slice(0, 2).toUpperCase()}-${sizeName}`,
          stockQuantity: 8,
        },
      });
    }
  }

  console.log("Done.");
  console.log(`  Colors:   Sand (${sand.id}), Olive (${olive.id})`);
  console.log(`  Design:   Egypt Collection (${egyptCat.id}), 6 assets`);
  console.log(`  Products: ${sandTee.slug}, ${pyramidsTee.slug}, ${skylineHoodie.slug}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

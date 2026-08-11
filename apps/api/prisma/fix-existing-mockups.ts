/**
 * One-off patch for an already-seeded database: regenerates the placeholder garment mockup SVGs
 * with the improved artwork, and corrects each ProductSize's print-area offsets to be centered
 * on the garment's fixed torso frame instead of the (buggy) chestWidthCm-relative calculation.
 * Updates files and rows in place — does not touch users, orders, designs, or cart data.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import type { GarmentType } from "@d-shirtak/shared";
import { env } from "../src/infrastructure/config/env.js";
import { centeredPrintArea, garmentSvg } from "./garment-art.js";

const prisma = new PrismaClient();
const uploadsRoot = path.resolve(env.UPLOADS_DIR);

const PRINT_TOP_CM: Record<string, { front: number; back: number }> = {
  "classic-crew-tee": { front: 18, back: 16 },
  "vintage-wash-tee": { front: 19, back: 17 },
  "oversized-hoodie": { front: 28, back: 20 },
};

async function saveSvg(category: string, fileName: string, svg: string): Promise<string> {
  const dir = path.join(uploadsRoot, category);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, fileName), svg, "utf-8");
  return `${env.PUBLIC_UPLOADS_BASE_URL}/${category}/${fileName}`;
}

async function main() {
  const products = await prisma.product.findMany({
    include: { colors: { include: { color: true } }, sizes: true },
  });

  for (const product of products) {
    const kind = product.garmentType as GarmentType;
    const tops = PRINT_TOP_CM[product.slug] ?? { front: 20, back: 18 };

    console.log(`Regenerating mockups for ${product.name} (${kind})...`);
    for (const pc of product.colors) {
      const front = await saveSvg("products", `${product.slug}-${pc.colorId}-front.svg`, garmentSvg(kind, "front", pc.color.hexCode));
      const back = await saveSvg("products", `${product.slug}-${pc.colorId}-back.svg`, garmentSvg(kind, "back", pc.color.hexCode));
      // Filenames are deterministic and match what's already stored, so the URLs are unchanged —
      // this just overwrites the file contents. Update anyway in case the URL ever drifts.
      await prisma.productColor.update({ where: { id: pc.id }, data: { frontImageUrl: front, backImageUrl: back } });
    }

    console.log(`Fixing print-area offsets for ${product.name}...`);
    for (const ps of product.sizes) {
      const front = centeredPrintArea(kind, ps.printAreaFrontWidthCm, ps.printAreaFrontHeightCm, tops.front);
      const back = centeredPrintArea(kind, ps.printAreaBackWidthCm, ps.printAreaBackHeightCm, tops.back);
      await prisma.productSize.update({
        where: { id: ps.id },
        data: {
          printAreaFrontOffsetXCm: front.offsetXCm,
          printAreaFrontOffsetYCm: front.offsetYCm,
          printAreaBackOffsetXCm: back.offsetXCm,
          printAreaBackOffsetYCm: back.offsetYCm,
        },
      });
    }
  }

  console.log("Done — mockups regenerated and print areas corrected in place.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

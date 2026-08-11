import type { Prisma, PrismaClient } from "@prisma/client";
import type {
  Product,
  ProductColor,
  ProductDetail,
  ProductListFilter,
  ProductSize,
  ProductVariant,
} from "../../../domain/entities/catalog.entity.js";
import type {
  CreateProductColorInput,
  CreateProductInput,
  CreateProductSizeInput,
  CreateProductVariantInput,
  IProductColorRepository,
  IProductRepository,
  IProductSizeRepository,
  IProductVariantRepository,
  UpdateProductColorInput,
  UpdateProductInput,
  UpdateProductSizeInput,
  UpdateProductVariantInput,
} from "../../../domain/ports/repositories/product.repository.js";

const detailInclude = {
  colors: { include: { color: true } },
  sizes: { include: { size: true } },
  variants: true,
} satisfies Prisma.ProductInclude;

type ProductWithDetail = Prisma.ProductGetPayload<{ include: typeof detailInclude }>;

function toProduct(
  row: { basePrice: Prisma.Decimal; costPrice: Prisma.Decimal | null; garmentType: string; productType: string },
): Pick<Product, "basePrice" | "costPrice" | "garmentType" | "productType"> {
  return {
    basePrice: Number(row.basePrice),
    costPrice: row.costPrice === null ? null : Number(row.costPrice),
    garmentType: row.garmentType as Product["garmentType"],
    productType: row.productType as Product["productType"],
  };
}

function toVariant(row: ProductVariantRow): ProductVariant {
  return { ...row, priceOverride: row.priceOverride === null ? null : Number(row.priceOverride) };
}

type ProductVariantRow = {
  id: string;
  productId: string;
  colorId: string;
  sizeId: string;
  sku: string;
  stockQuantity: number;
  priceOverride: Prisma.Decimal | null;
};

function toDetail(row: ProductWithDetail): ProductDetail {
  return {
    ...row,
    ...toProduct(row),
    variants: row.variants.map(toVariant),
  };
}

export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly db: PrismaClient) {}

  async listPublic(filter: ProductListFilter): Promise<ProductDetail[]> {
    const rows = await this.db.product.findMany({
      where: {
        isActive: filter.onlyActive === false ? undefined : true,
        category: filter.categorySlug ? { slug: filter.categorySlug } : undefined,
        name: filter.search ? { contains: filter.search } : undefined,
      },
      include: detailInclude,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toDetail);
  }

  async listAdmin(): Promise<ProductDetail[]> {
    const rows = await this.db.product.findMany({
      include: detailInclude,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toDetail);
  }

  async findById(id: string): Promise<ProductDetail | null> {
    const row = await this.db.product.findUnique({ where: { id }, include: detailInclude });
    return row ? toDetail(row) : null;
  }

  async findBySlug(slug: string): Promise<ProductDetail | null> {
    const row = await this.db.product.findUnique({ where: { slug }, include: detailInclude });
    return row ? toDetail(row) : null;
  }

  async create(input: CreateProductInput): Promise<Product> {
    const row = await this.db.product.create({ data: input });
    return { ...row, ...toProduct(row) };
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const row = await this.db.product.update({ where: { id }, data: input });
    return { ...row, ...toProduct(row) };
  }

  async delete(id: string): Promise<void> {
    await this.db.product.delete({ where: { id } });
  }
}

export class PrismaProductColorRepository implements IProductColorRepository {
  constructor(private readonly db: PrismaClient) {}

  listByProduct(productId: string): Promise<ProductColor[]> {
    return this.db.productColor.findMany({ where: { productId } });
  }
  findById(id: string): Promise<ProductColor | null> {
    return this.db.productColor.findUnique({ where: { id } });
  }
  create(input: CreateProductColorInput): Promise<ProductColor> {
    return this.db.productColor.create({ data: input });
  }
  update(id: string, input: UpdateProductColorInput): Promise<ProductColor> {
    return this.db.productColor.update({ where: { id }, data: input });
  }
  async delete(id: string): Promise<void> {
    await this.db.productColor.delete({ where: { id } });
  }
}

export class PrismaProductSizeRepository implements IProductSizeRepository {
  constructor(private readonly db: PrismaClient) {}

  listByProduct(productId: string): Promise<ProductSize[]> {
    return this.db.productSize.findMany({ where: { productId } });
  }
  findById(id: string): Promise<ProductSize | null> {
    return this.db.productSize.findUnique({ where: { id } });
  }
  create(input: CreateProductSizeInput): Promise<ProductSize> {
    return this.db.productSize.create({ data: input });
  }
  update(id: string, input: UpdateProductSizeInput): Promise<ProductSize> {
    return this.db.productSize.update({ where: { id }, data: input });
  }
  async delete(id: string): Promise<void> {
    await this.db.productSize.delete({ where: { id } });
  }
}

export class PrismaProductVariantRepository implements IProductVariantRepository {
  constructor(private readonly db: PrismaClient) {}

  async listByProduct(productId: string): Promise<ProductVariant[]> {
    const rows = await this.db.productVariant.findMany({ where: { productId } });
    return rows.map(toVariant);
  }
  async findById(id: string): Promise<ProductVariant | null> {
    const row = await this.db.productVariant.findUnique({ where: { id } });
    return row ? toVariant(row) : null;
  }
  async findBySku(sku: string): Promise<ProductVariant | null> {
    const row = await this.db.productVariant.findUnique({ where: { sku } });
    return row ? toVariant(row) : null;
  }
  async create(input: CreateProductVariantInput): Promise<ProductVariant> {
    const row = await this.db.productVariant.create({ data: input });
    return toVariant(row);
  }
  async update(id: string, input: UpdateProductVariantInput): Promise<ProductVariant> {
    const row = await this.db.productVariant.update({ where: { id }, data: input });
    return toVariant(row);
  }
  async delete(id: string): Promise<void> {
    await this.db.productVariant.delete({ where: { id } });
  }
}

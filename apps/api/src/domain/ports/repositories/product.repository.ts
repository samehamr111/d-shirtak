import type {
  Product,
  ProductColor,
  ProductDetail,
  ProductListFilter,
  ProductSize,
  ProductVariant,
} from "../../entities/catalog.entity.js";

export type CreateProductInput = Omit<Product, "id" | "createdAt">;
export type UpdateProductInput = Partial<CreateProductInput>;

export interface IProductRepository {
  listPublic(filter: ProductListFilter): Promise<ProductDetail[]>;
  listAdmin(): Promise<ProductDetail[]>;
  findById(id: string): Promise<ProductDetail | null>;
  findBySlug(slug: string): Promise<ProductDetail | null>;
  /** Bare rows (no colors/sizes/variants) for batch lookups where only top-level fields (e.g.
   *  costPrice) are needed -- avoids N sequential findById calls. */
  findManyByIds(ids: string[]): Promise<Product[]>;
  create(input: CreateProductInput): Promise<Product>;
  update(id: string, input: UpdateProductInput): Promise<Product>;
  delete(id: string): Promise<void>;
}

export type CreateProductColorInput = Omit<ProductColor, "id">;
export type UpdateProductColorInput = Partial<Omit<ProductColor, "id" | "productId">>;

export interface IProductColorRepository {
  listByProduct(productId: string): Promise<ProductColor[]>;
  findById(id: string): Promise<ProductColor | null>;
  create(input: CreateProductColorInput): Promise<ProductColor>;
  update(id: string, input: UpdateProductColorInput): Promise<ProductColor>;
  delete(id: string): Promise<void>;
}

export type CreateProductSizeInput = Omit<ProductSize, "id">;
export type UpdateProductSizeInput = Partial<Omit<ProductSize, "id" | "productId">>;

export interface IProductSizeRepository {
  listByProduct(productId: string): Promise<ProductSize[]>;
  findById(id: string): Promise<ProductSize | null>;
  create(input: CreateProductSizeInput): Promise<ProductSize>;
  update(id: string, input: UpdateProductSizeInput): Promise<ProductSize>;
  delete(id: string): Promise<void>;
}

export type CreateProductVariantInput = Omit<ProductVariant, "id">;
export type UpdateProductVariantInput = Partial<Omit<ProductVariant, "id" | "productId">>;

export interface IProductVariantRepository {
  listByProduct(productId: string): Promise<ProductVariant[]>;
  findById(id: string): Promise<ProductVariant | null>;
  findBySku(sku: string): Promise<ProductVariant | null>;
  /** Batch lookup for N+1-prone call sites (checkout, admin stats) that previously fetched one
   *  variant at a time in a loop. */
  findManyByIds(ids: string[]): Promise<ProductVariant[]>;
  create(input: CreateProductVariantInput): Promise<ProductVariant>;
  update(id: string, input: UpdateProductVariantInput): Promise<ProductVariant>;
  delete(id: string): Promise<void>;
}

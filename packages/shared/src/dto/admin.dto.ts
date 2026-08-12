import { z } from "zod";
import { FontLanguage, GarmentType, ProductType } from "../enums.js";
import type { ProductDetailDto } from "./catalog.dto.js";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(60),
  slug: z.string().min(1).max(60),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const createColorSchema = z.object({
  name: z.string().min(1).max(40),
  hexCode: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "hexCode must look like #RRGGBB"),
});
export type CreateColorInput = z.infer<typeof createColorSchema>;

export const createSizeSchema = z.object({
  name: z.string().min(1).max(10),
  // The server always assigns the next sequence number on create (see PrismaSizeRepository) —
  // this is accepted only so `update` can share the same shape to explicitly reorder sizes.
  sortOrder: z.number().int().min(0).optional(),
});
export type CreateSizeInput = z.infer<typeof createSizeSchema>;

export const productSchema = z.object({
  categoryId: z.string().min(1),
  code: z.string().min(1).max(40),
  garmentType: z.nativeEnum(GarmentType).default(GarmentType.TEE),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  description: z.string().max(4000).default(""),
  basePrice: z.number().positive(),
  costPrice: z.number().nonnegative().nullable().optional(),
  productType: z.nativeEnum(ProductType).default(ProductType.CUSTOMIZABLE),
  isActive: z.boolean().default(true),
});
export type ProductInput = z.infer<typeof productSchema>;

/** Admin-only view of a product -- adds cost price, which must never reach the public
 *  storefront API (that's plain ProductDetailDto). */
export interface AdminProductDetailDto extends ProductDetailDto {
  costPrice: number | null;
}

/** Print-area + garment measurement fields, all centimeters. Shared by create/update. */
export const productSizeSchema = z.object({
  sizeId: z.string().min(1),
  printAreaFrontWidthCm: z.number().positive(),
  printAreaFrontHeightCm: z.number().positive(),
  printAreaFrontOffsetXCm: z.number().min(0),
  printAreaFrontOffsetYCm: z.number().min(0),
  printAreaBackWidthCm: z.number().positive(),
  printAreaBackHeightCm: z.number().positive(),
  printAreaBackOffsetXCm: z.number().min(0),
  printAreaBackOffsetYCm: z.number().min(0),
  chestWidthCm: z.number().positive(),
  lengthCm: z.number().positive(),
  waistCm: z.number().positive(),
});
export type ProductSizeInput = z.infer<typeof productSizeSchema>;

export const productColorSchema = z.object({
  colorId: z.string().min(1),
  // multipart uploads carry the actual files; this DTO documents the JSON side-fields only
});
export type ProductColorInput = z.infer<typeof productColorSchema>;

export const variantStockSchema = z.object({
  colorId: z.string().min(1),
  sizeId: z.string().min(1),
  sku: z.string().min(1).max(60),
  stockQuantity: z.number().int().min(0),
  priceOverride: z.number().positive().optional(),
});
export type VariantStockInput = z.infer<typeof variantStockSchema>;

export const fontMetaSchema = z.object({
  name: z.string().min(1).max(60),
  language: z.nativeEnum(FontLanguage),
  fontFamily: z.string().min(1).max(60),
});
export type FontMetaInput = z.infer<typeof fontMetaSchema>;

export const designCategorySchema = z.object({
  name: z.string().min(1).max(60),
});
export type DesignCategoryInput = z.infer<typeof designCategorySchema>;

export const designAssetMetaSchema = z.object({
  name: z.string().min(1).max(80),
  designCategoryId: z.string().min(1),
});
export type DesignAssetMetaInput = z.infer<typeof designAssetMetaSchema>;

export const promoteUserUploadSchema = z.object({
  name: z.string().min(1).max(80),
  designCategoryId: z.string().min(1),
});
export type PromoteUserUploadInput = z.infer<typeof promoteUserUploadSchema>;

export const updateStoreSettingsSchema = z.object({
  customizationSurchargeEgp: z.number().nonnegative(),
});
export type UpdateStoreSettingsInput = z.infer<typeof updateStoreSettingsSchema>;

/** Store-wide money summary for the admin Dashboard. Excludes cancelled orders. Cost/profit are
 *  computed from each product's *current* cost price (not a historical snapshot at sale time),
 *  so they shift if you edit a cost price later -- a deliberate simplification, not a bug. */
export interface DashboardStatsDto {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  /** True if any sold item's product has no cost price set -- totalCost/totalProfit understate
   *  reality until every product has one. */
  hasIncompleteCostData: boolean;
  orderCount: number;
  pendingCount: number;
  avgOrderValue: number;
  dailyRevenue: { date: string; revenue: number }[];
}

export const blockUserSchema = z.object({
  reason: z.string().min(3).max(300),
});
export type BlockUserInput = z.infer<typeof blockUserSchema>;

/** Admin Users list -- customer (never admin) accounts only, each with how many orders they've
 *  placed so support can see who's a real/repeat customer at a glance. */
export interface AdminUserDto {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  orderCount: number;
  isBlocked: boolean;
  blockedReason: string | null;
  blockedAt: string | null;
  createdAt: string;
}

export interface AdminUserStatsDto {
  totalCustomers: number;
  newLast7Days: number;
  newLast30Days: number;
}

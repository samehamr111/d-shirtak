import type { FontLanguage, GarmentType, ProductType } from "../enums.js";

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
}

export interface ColorDto {
  id: string;
  name: string;
  hexCode: string;
}

export interface SizeDto {
  id: string;
  name: string;
  sortOrder: number;
}

/** Print-area + garment measurements for one product at one size. All lengths in cm. */
export interface ProductSizeDto {
  sizeId: string;
  size: SizeDto;
  printAreaFront: PrintAreaDto;
  printAreaBack: PrintAreaDto;
  chestWidthCm: number;
  lengthCm: number;
  waistCm: number;
}

export interface PrintAreaDto {
  widthCm: number;
  heightCm: number;
  offsetXCm: number;
  offsetYCm: number;
}

export interface ProductColorDto {
  id: string;
  colorId: string;
  color: ColorDto;
  frontImageUrl: string;
  backImageUrl: string;
  /** On-model lifestyle shots, added after the color already exists. Null until generated. */
  modelFrontImageUrl: string | null;
  modelBackImageUrl: string | null;
}

/** One purchasable SKU: a specific product + color + size. */
export interface ProductVariantDto {
  id: string;
  colorId: string;
  sizeId: string;
  sku: string;
  stockQuantity: number;
  price: number;
}

export interface ProductSummaryDto {
  id: string;
  code: string;
  slug: string;
  name: string;
  categoryId: string;
  basePrice: number;
  productType: ProductType;
  /** Derived: `productType === "CUSTOMIZABLE"`. Kept for existing gating code. */
  isCustomizable: boolean;
  thumbnailUrl: string;
  colors: ColorDto[];
  fromPrice: number;
  inStock: boolean;
  createdAt: string;
}

export interface ProductDetailDto {
  id: string;
  code: string;
  garmentType: GarmentType;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  productType: ProductType;
  /** Derived: `productType === "CUSTOMIZABLE"`. Kept for existing gating code. */
  isCustomizable: boolean;
  isActive: boolean;
  colors: ProductColorDto[];
  sizes: ProductSizeDto[];
  variants: ProductVariantDto[];
}

export interface FontDto {
  id: string;
  name: string;
  language: FontLanguage;
  fileUrl: string;
  fontFamily: string;
}

export interface DesignCategoryDto {
  id: string;
  name: string;
}

export interface DesignAssetModelShotDto {
  id: string;
  imageUrl: string;
}

export interface DesignAssetDto {
  id: string;
  name: string;
  imageUrl: string;
  modelShots: DesignAssetModelShotDto[];
  designCategoryId: string;
}

export interface StoreSettingsDto {
  customizationSurchargeEgp: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Color {
  id: string;
  name: string;
  hexCode: string;
}

export interface Size {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  code: string;
  garmentType: "TEE" | "HOODIE";
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  costPrice: number | null;
  productType: "CUSTOMIZABLE" | "READY_PRINTED";
  isActive: boolean;
  createdAt: Date;
}

export interface ProductColor {
  id: string;
  productId: string;
  colorId: string;
  frontImageUrl: string;
  backImageUrl: string;
  modelFrontImageUrl: string | null;
  modelBackImageUrl: string | null;
}

/** Print-area geometry + garment measurements for one (product, size). All lengths in cm. */
export interface ProductSize {
  id: string;
  productId: string;
  sizeId: string;
  printAreaFrontWidthCm: number;
  printAreaFrontHeightCm: number;
  printAreaFrontOffsetXCm: number;
  printAreaFrontOffsetYCm: number;
  printAreaBackWidthCm: number;
  printAreaBackHeightCm: number;
  printAreaBackOffsetXCm: number;
  printAreaBackOffsetYCm: number;
  chestWidthCm: number;
  lengthCm: number;
  waistCm: number;
}

/** A purchasable SKU: one (product, color, size) combination. */
export interface ProductVariant {
  id: string;
  productId: string;
  colorId: string;
  sizeId: string;
  sku: string;
  stockQuantity: number;
  priceOverride: number | null;
}

export interface Font {
  id: string;
  name: string;
  language: "EN" | "AR";
  fileUrl: string;
  fontFamily: string;
}

export interface DesignCategory {
  id: string;
  name: string;
}

export interface DesignAssetModelShot {
  id: string;
  imageUrl: string;
}

export interface DesignAsset {
  id: string;
  name: string;
  imageUrl: string;
  modelShots: DesignAssetModelShot[];
  designCategoryId: string;
}

/** Product aggregate fully expanded — used by the storefront product page and admin editor. */
export interface ProductDetail extends Product {
  colors: (ProductColor & { color: Color })[];
  sizes: (ProductSize & { size: Size })[];
  variants: ProductVariant[];
}

export interface ProductListFilter {
  categorySlug?: string;
  search?: string;
  onlyActive?: boolean;
}

/** A raw image a customer uploaded in the designer, tracked for possible promotion into the
 *  curated design library. */
export interface UserUpload {
  id: string;
  /** Null for uploads made without signing in -- the designer canvas doesn't require it. */
  userId: string | null;
  imageUrl: string;
  originalName: string | null;
  promotedAssetId: string | null;
  createdAt: Date;
}

/** Singleton row (fixed id "singleton") holding store-wide configuration. */
export interface StoreSettings {
  id: string;
  customizationSurchargeEgp: number;
}

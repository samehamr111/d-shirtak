import type {
  CategoryDto,
  ColorDto,
  DesignAssetDto,
  DesignCategoryDto,
  FontDto,
  ProductDetailDto,
  ProductSummaryDto,
  SizeDto,
  StoreSettingsDto,
} from "@d-shirtak/shared";
import { NotFoundError } from "../../domain/errors.js";
import type { ProductDetail } from "../../domain/entities/catalog.entity.js";
import { effectiveVariantPrice } from "../../domain/services/pricing.service.js";
import type { ICategoryRepository, IColorRepository, ISizeRepository } from "../../domain/ports/repositories/lookup.repository.js";
import type { IProductRepository } from "../../domain/ports/repositories/product.repository.js";
import type { IFontRepository } from "../../domain/ports/repositories/font.repository.js";
import type {
  IDesignAssetRepository,
  IDesignCategoryRepository,
} from "../../domain/ports/repositories/design-library.repository.js";
import type { IStoreSettingsRepository } from "../../domain/ports/repositories/store-settings.repository.js";

function toSummary(product: ProductDetail): ProductSummaryDto {
  const prices = product.variants.map((v) => effectiveVariantPrice(v, product));
  const inStock = product.variants.some((v) => v.stockQuantity > 0);
  return {
    id: product.id,
    code: product.code,
    slug: product.slug,
    name: product.name,
    categoryId: product.categoryId,
    basePrice: product.basePrice,
    productType: product.productType,
    isCustomizable: product.productType === "CUSTOMIZABLE",
    thumbnailUrl: product.colors[0]?.modelFrontImageUrl ?? product.colors[0]?.frontImageUrl ?? "",
    colors: product.colors.map((c) => c.color),
    fromPrice: prices.length > 0 ? Math.min(...prices) : product.basePrice,
    inStock,
    createdAt: product.createdAt.toISOString(),
  };
}

function toDetail(product: ProductDetail): ProductDetailDto {
  return {
    id: product.id,
    code: product.code,
    garmentType: product.garmentType,
    slug: product.slug,
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    basePrice: product.basePrice,
    productType: product.productType,
    isCustomizable: product.productType === "CUSTOMIZABLE",
    isActive: product.isActive,
    colors: product.colors.map((c) => ({
      id: c.id,
      colorId: c.colorId,
      color: c.color,
      frontImageUrl: c.frontImageUrl,
      backImageUrl: c.backImageUrl,
      modelFrontImageUrl: c.modelFrontImageUrl,
      modelBackImageUrl: c.modelBackImageUrl,
    })),
    sizes: product.sizes.map((s) => ({
      sizeId: s.sizeId,
      size: s.size,
      printAreaFront: {
        widthCm: s.printAreaFrontWidthCm,
        heightCm: s.printAreaFrontHeightCm,
        offsetXCm: s.printAreaFrontOffsetXCm,
        offsetYCm: s.printAreaFrontOffsetYCm,
      },
      printAreaBack: {
        widthCm: s.printAreaBackWidthCm,
        heightCm: s.printAreaBackHeightCm,
        offsetXCm: s.printAreaBackOffsetXCm,
        offsetYCm: s.printAreaBackOffsetYCm,
      },
      chestWidthCm: s.chestWidthCm,
      lengthCm: s.lengthCm,
      waistCm: s.waistCm,
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      colorId: v.colorId,
      sizeId: v.sizeId,
      sku: v.sku,
      stockQuantity: v.stockQuantity,
      price: effectiveVariantPrice(v, product),
    })),
  };
}

export class CatalogService {
  constructor(
    private readonly categories: ICategoryRepository,
    private readonly colors: IColorRepository,
    private readonly sizes: ISizeRepository,
    private readonly products: IProductRepository,
    private readonly fonts: IFontRepository,
    private readonly designCategories: IDesignCategoryRepository,
    private readonly designAssets: IDesignAssetRepository,
    private readonly storeSettings: IStoreSettingsRepository,
  ) {}

  async getSettings(): Promise<StoreSettingsDto> {
    const settings = await this.storeSettings.get();
    return { customizationSurchargeEgp: settings.customizationSurchargeEgp };
  }

  listCategories(): Promise<CategoryDto[]> {
    return this.categories.listAll();
  }

  listColors(): Promise<ColorDto[]> {
    return this.colors.listAll();
  }

  listSizes(): Promise<SizeDto[]> {
    return this.sizes.listAll();
  }

  async listProducts(params: { categorySlug?: string; search?: string }): Promise<ProductSummaryDto[]> {
    const products = await this.products.listPublic({ ...params, onlyActive: true });
    return products.map(toSummary);
  }

  async getProductBySlug(slug: string): Promise<ProductDetailDto> {
    const product = await this.products.findBySlug(slug);
    if (!product || !product.isActive) throw new NotFoundError("Product", slug);
    return toDetail(product);
  }

  listFonts(): Promise<FontDto[]> {
    return this.fonts.listAll();
  }

  listDesignCategories(): Promise<DesignCategoryDto[]> {
    return this.designCategories.listAll();
  }

  listDesignAssets(designCategoryId?: string): Promise<DesignAssetDto[]> {
    return designCategoryId ? this.designAssets.listByCategory(designCategoryId) : this.designAssets.listAll();
  }
}

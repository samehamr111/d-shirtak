import type {
  AdminProductDetailDto,
  CategoryDto,
  ColorDto,
  CreateCategoryInput,
  CreateColorInput,
  CreateSizeInput,
  ProductInput,
  ProductSizeInput,
  SizeDto,
  StoreSettingsDto,
  UpdateStoreSettingsInput,
  VariantStockInput,
} from "@d-shirtak/shared";
import { ConflictError, NotFoundError } from "../../domain/errors.js";
import type { ICategoryRepository, IColorRepository, ISizeRepository } from "../../domain/ports/repositories/lookup.repository.js";
import type {
  IProductColorRepository,
  IProductRepository,
  IProductSizeRepository,
  IProductVariantRepository,
} from "../../domain/ports/repositories/product.repository.js";
import type { IFileStorage } from "../../domain/ports/file-storage.port.js";
import type { IStoreSettingsRepository } from "../../domain/ports/repositories/store-settings.repository.js";
import { effectiveVariantPrice } from "../../domain/services/pricing.service.js";

function toProductDetailDto(product: Awaited<ReturnType<IProductRepository["findById"]>>): AdminProductDetailDto {
  if (!product) throw new NotFoundError("Product");
  return {
    id: product.id,
    code: product.code,
    garmentType: product.garmentType,
    slug: product.slug,
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    basePrice: product.basePrice,
    costPrice: product.costPrice,
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
      printAreaFront: { widthCm: s.printAreaFrontWidthCm, heightCm: s.printAreaFrontHeightCm, offsetXCm: s.printAreaFrontOffsetXCm, offsetYCm: s.printAreaFrontOffsetYCm },
      printAreaBack: { widthCm: s.printAreaBackWidthCm, heightCm: s.printAreaBackHeightCm, offsetXCm: s.printAreaBackOffsetXCm, offsetYCm: s.printAreaBackOffsetYCm },
      chestWidthCm: s.chestWidthCm,
      lengthCm: s.lengthCm,
      waistCm: s.waistCm,
    })),
    variants: product.variants.map((v) => ({ id: v.id, colorId: v.colorId, sizeId: v.sizeId, sku: v.sku, stockQuantity: v.stockQuantity, price: effectiveVariantPrice(v, product) })),
  };
}

export class AdminCatalogService {
  constructor(
    private readonly categories: ICategoryRepository,
    private readonly colors: IColorRepository,
    private readonly sizes: ISizeRepository,
    private readonly products: IProductRepository,
    private readonly productColors: IProductColorRepository,
    private readonly productSizes: IProductSizeRepository,
    private readonly variants: IProductVariantRepository,
    private readonly storeSettings: IStoreSettingsRepository,
    private readonly fileStorage: IFileStorage,
  ) {}

  // -- Store settings ------------------------------------------------------
  async getSettings(): Promise<StoreSettingsDto> {
    const settings = await this.storeSettings.get();
    return { customizationSurchargeEgp: settings.customizationSurchargeEgp };
  }
  async updateSettings(input: UpdateStoreSettingsInput): Promise<StoreSettingsDto> {
    const settings = await this.storeSettings.update(input.customizationSurchargeEgp);
    return { customizationSurchargeEgp: settings.customizationSurchargeEgp };
  }

  // -- Categories ------------------------------------------------------------
  listCategories(): Promise<CategoryDto[]> {
    return this.categories.listAll();
  }
  createCategory(input: CreateCategoryInput): Promise<CategoryDto> {
    return this.categories.create(input);
  }
  updateCategory(id: string, input: Partial<CreateCategoryInput>): Promise<CategoryDto> {
    return this.categories.update(id, input);
  }
  deleteCategory(id: string): Promise<void> {
    return this.categories.delete(id);
  }

  // -- Colors ------------------------------------------------------------
  listColors(): Promise<ColorDto[]> {
    return this.colors.listAll();
  }
  createColor(input: CreateColorInput): Promise<ColorDto> {
    return this.colors.create(input);
  }
  deleteColor(id: string): Promise<void> {
    return this.colors.delete(id);
  }

  // -- Sizes ------------------------------------------------------------
  listSizes(): Promise<SizeDto[]> {
    return this.sizes.listAll();
  }
  createSize(input: CreateSizeInput): Promise<SizeDto> {
    return this.sizes.create({ name: input.name });
  }
  deleteSize(id: string): Promise<void> {
    return this.sizes.delete(id);
  }

  // -- Products ------------------------------------------------------------
  async listProducts(): Promise<AdminProductDetailDto[]> {
    const rows = await this.products.listAdmin();
    return rows.map((p) => toProductDetailDto(p));
  }

  async getProduct(id: string): Promise<AdminProductDetailDto> {
    const product = await this.products.findById(id);
    return toProductDetailDto(product);
  }

  async createProduct(input: ProductInput): Promise<AdminProductDetailDto> {
    const created = await this.products.create({ ...input, costPrice: input.costPrice ?? null });
    return this.getProduct(created.id);
  }

  async updateProduct(id: string, input: Partial<ProductInput>): Promise<AdminProductDetailDto> {
    // costPrice is optional in the zod schema (number | undefined); only coerce it to the
    // domain's `number | null` when the caller actually included the key, so a partial update
    // that omits costPrice entirely doesn't wipe out a previously-set value.
    await this.products.update(id, "costPrice" in input ? { ...input, costPrice: input.costPrice ?? null } : input);
    return this.getProduct(id);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.products.delete(id);
  }

  // -- Product colors (mockup images) ------------------------------------
  async addProductColor(
    productId: string,
    colorId: string,
    frontImage: { buffer: Buffer; originalName: string },
    backImage: { buffer: Buffer; originalName: string },
  ): Promise<AdminProductDetailDto> {
    const front = await this.fileStorage.saveBuffer("colors", frontImage.originalName, frontImage.buffer);
    const back = await this.fileStorage.saveBuffer("colors", backImage.originalName, backImage.buffer);
    await this.productColors.create({
      productId,
      colorId,
      frontImageUrl: front.url,
      backImageUrl: back.url,
      modelFrontImageUrl: null,
      modelBackImageUrl: null,
    });
    return this.getProduct(productId);
  }

  async removeProductColor(productId: string, productColorId: string): Promise<AdminProductDetailDto> {
    await this.productColors.delete(productColorId);
    return this.getProduct(productId);
  }

  // -- Product colors (model/on-body shots, added after the color already exists) -----------
  async updateProductColorModelImages(
    productId: string,
    productColorId: string,
    modelFront?: { buffer: Buffer; originalName: string },
    modelBack?: { buffer: Buffer; originalName: string },
  ): Promise<AdminProductDetailDto> {
    const update: { modelFrontImageUrl?: string; modelBackImageUrl?: string } = {};
    if (modelFront) {
      const saved = await this.fileStorage.saveBuffer("colors", modelFront.originalName, modelFront.buffer);
      update.modelFrontImageUrl = saved.url;
    }
    if (modelBack) {
      const saved = await this.fileStorage.saveBuffer("colors", modelBack.originalName, modelBack.buffer);
      update.modelBackImageUrl = saved.url;
    }
    await this.productColors.update(productColorId, update);
    return this.getProduct(productId);
  }

  // -- Product sizes (print area + measurements) --------------------------
  async addProductSize(productId: string, input: ProductSizeInput): Promise<AdminProductDetailDto> {
    await this.productSizes.create({ productId, ...input });
    return this.getProduct(productId);
  }

  async updateProductSize(productId: string, productSizeId: string, input: Partial<ProductSizeInput>): Promise<AdminProductDetailDto> {
    await this.productSizes.update(productSizeId, input);
    return this.getProduct(productId);
  }

  async removeProductSize(productId: string, productSizeId: string): Promise<AdminProductDetailDto> {
    await this.productSizes.delete(productSizeId);
    return this.getProduct(productId);
  }

  // -- Variants (stock) ------------------------------------------------------
  async addVariant(productId: string, input: VariantStockInput): Promise<AdminProductDetailDto> {
    const existing = await this.variants.findBySku(input.sku);
    if (existing) throw new ConflictError(`SKU '${input.sku}' is already in use`);
    await this.variants.create({
      productId,
      colorId: input.colorId,
      sizeId: input.sizeId,
      sku: input.sku,
      stockQuantity: input.stockQuantity,
      priceOverride: input.priceOverride ?? null,
    });
    return this.getProduct(productId);
  }

  async updateVariant(productId: string, variantId: string, input: Partial<VariantStockInput>): Promise<AdminProductDetailDto> {
    await this.variants.update(variantId, input);
    return this.getProduct(productId);
  }

  async removeVariant(productId: string, variantId: string): Promise<AdminProductDetailDto> {
    await this.variants.delete(variantId);
    return this.getProduct(productId);
  }
}

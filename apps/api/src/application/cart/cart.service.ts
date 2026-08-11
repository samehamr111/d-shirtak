import type { AddCartItemInput, CartDto, CartItemDto } from "@d-shirtak/shared";
import { ForbiddenError, NotFoundError, ValidationError } from "../../domain/errors.js";
import { calcSubtotal, customizationSurcharge, effectiveVariantPrice } from "../../domain/services/pricing.service.js";
import type { ICartRepository } from "../../domain/ports/repositories/cart.repository.js";
import type { IProductRepository, IProductVariantRepository } from "../../domain/ports/repositories/product.repository.js";
import type { IDesignRepository } from "../../domain/ports/repositories/design.repository.js";
import type { IStoreSettingsRepository } from "../../domain/ports/repositories/store-settings.repository.js";
import type { CartItem } from "../../domain/entities/cart.entity.js";

export class CartService {
  constructor(
    private readonly cartItems: ICartRepository,
    private readonly variants: IProductVariantRepository,
    private readonly products: IProductRepository,
    private readonly designs: IDesignRepository,
    private readonly storeSettings: IStoreSettingsRepository,
  ) {}

  async getCart(userId: string): Promise<CartDto> {
    const rows = await this.cartItems.listByUser(userId);
    const settings = await this.storeSettings.get();
    const items = await Promise.all(rows.map((row) => this.toItemDto(row, settings.customizationSurchargeEgp)));
    return { items, subtotal: calcSubtotal(items.map((i) => ({ unitPrice: i.unitPrice, quantity: i.quantity }))) };
  }

  async addItem(userId: string, input: AddCartItemInput): Promise<CartDto> {
    const variant = await this.variants.findById(input.productVariantId);
    if (!variant) throw new NotFoundError("ProductVariant", input.productVariantId);

    await this.assertDesignBelongsToUserAndVariant(userId, variant.id, input.frontDesignId ?? null);
    await this.assertDesignBelongsToUserAndVariant(userId, variant.id, input.backDesignId ?? null);

    const existing = await this.cartItems.findMatching(
      userId,
      variant.id,
      input.frontDesignId ?? null,
      input.backDesignId ?? null,
    );

    if (existing) {
      const nextQuantity = Math.min(existing.quantity + input.quantity, 20);
      await this.cartItems.updateQuantity(existing.id, nextQuantity);
    } else {
      await this.cartItems.create({
        userId,
        productVariantId: variant.id,
        quantity: input.quantity,
        frontDesignId: input.frontDesignId ?? null,
        backDesignId: input.backDesignId ?? null,
      });
    }

    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, cartItemId: string, quantity: number): Promise<CartDto> {
    const item = await this.assertOwned(userId, cartItemId);
    await this.cartItems.updateQuantity(item.id, quantity);
    return this.getCart(userId);
  }

  async removeItem(userId: string, cartItemId: string): Promise<CartDto> {
    await this.assertOwned(userId, cartItemId);
    await this.cartItems.delete(cartItemId);
    return this.getCart(userId);
  }

  private async assertOwned(userId: string, cartItemId: string): Promise<CartItem> {
    const item = await this.cartItems.findById(cartItemId);
    if (!item) throw new NotFoundError("CartItem", cartItemId);
    if (item.userId !== userId) throw new ForbiddenError();
    return item;
  }

  private async assertDesignBelongsToUserAndVariant(
    userId: string,
    productVariantId: string,
    designId: string | null,
  ): Promise<void> {
    if (!designId) return;
    const design = await this.designs.findById(designId);
    if (!design || design.ownerUserId !== userId || design.productVariantId !== productVariantId) {
      throw new ValidationError("Design does not belong to this user/variant");
    }
  }

  private async toItemDto(item: CartItem, surchargeEgp: number): Promise<CartItemDto> {
    const variant = await this.variants.findById(item.productVariantId);
    if (!variant) throw new NotFoundError("ProductVariant", item.productVariantId);
    const product = await this.products.findById(variant.productId);
    if (!product) throw new NotFoundError("Product", variant.productId);

    const color = product.colors.find((c) => c.colorId === variant.colorId);
    const size = product.sizes.find((s) => s.sizeId === variant.sizeId);

    const [frontDesign, backDesign] = await Promise.all([
      item.frontDesignId ? this.designs.findById(item.frontDesignId) : Promise.resolve(null),
      item.backDesignId ? this.designs.findById(item.backDesignId) : Promise.resolve(null),
    ]);

    return {
      id: item.id,
      productVariantId: variant.id,
      productName: product.name,
      colorName: color?.color.name ?? "",
      sizeName: size?.size.name ?? "",
      imageUrl: color?.frontImageUrl ?? "",
      unitPrice:
        effectiveVariantPrice(variant, product) +
        customizationSurcharge(!!frontDesign, !!backDesign, surchargeEgp),
      quantity: item.quantity,
      stockQuantity: variant.stockQuantity,
      frontDesignPreviewUrl: frontDesign?.previewImageUrl ?? null,
      backDesignPreviewUrl: backDesign?.previewImageUrl ?? null,
    };
  }
}

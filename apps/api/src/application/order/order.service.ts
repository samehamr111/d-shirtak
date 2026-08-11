import type { OrderDto, PlaceOrderInput as PlaceOrderDtoInput } from "@d-shirtak/shared";
import { ForbiddenError, NotFoundError, ValidationError } from "../../domain/errors.js";
import { calcShippingFee, customizationSurcharge, effectiveVariantPrice } from "../../domain/services/pricing.service.js";
import type { ICartRepository } from "../../domain/ports/repositories/cart.repository.js";
import type { IProductRepository, IProductVariantRepository } from "../../domain/ports/repositories/product.repository.js";
import type { IAddressRepository } from "../../domain/ports/repositories/address.repository.js";
import type { IDesignRepository } from "../../domain/ports/repositories/design.repository.js";
import type { IStoreSettingsRepository } from "../../domain/ports/repositories/store-settings.repository.js";
import type { IOrderRepository, PlaceOrderItemInput } from "../../domain/ports/repositories/order.repository.js";
import type { ShippingAddressSnapshot } from "../../domain/entities/order.entity.js";
import { toOrderDto } from "./order.mapper.js";

export class OrderService {
  constructor(
    private readonly orders: IOrderRepository,
    private readonly cartItems: ICartRepository,
    private readonly variants: IProductVariantRepository,
    private readonly products: IProductRepository,
    private readonly addresses: IAddressRepository,
    private readonly designs: IDesignRepository,
    private readonly storeSettings: IStoreSettingsRepository,
  ) {}

  async placeOrder(userId: string, input: PlaceOrderDtoInput): Promise<OrderDto> {
    const cartRows = await this.cartItems.listByUser(userId);
    if (cartRows.length === 0) throw new ValidationError("Your cart is empty");

    const shippingAddress = await this.resolveShippingAddress(userId, input);
    const settings = await this.storeSettings.get();
    const surchargeEgp = settings.customizationSurchargeEgp;

    let subtotalCents = 0;
    const items: PlaceOrderItemInput[] = [];
    for (const row of cartRows) {
      const variant = await this.variants.findById(row.productVariantId);
      if (!variant) throw new NotFoundError("ProductVariant", row.productVariantId);
      const product = await this.products.findById(variant.productId);
      if (!product) throw new NotFoundError("Product", variant.productId);

      const unitPrice =
        effectiveVariantPrice(variant, product) +
        customizationSurcharge(!!row.frontDesignId, !!row.backDesignId, surchargeEgp);
      subtotalCents += Math.round(unitPrice * 100) * row.quantity;
      items.push({
        productVariantId: variant.id,
        quantity: row.quantity,
        frontDesignId: row.frontDesignId,
        backDesignId: row.backDesignId,
      });
    }

    const subtotal = subtotalCents / 100;
    const shippingFee = calcShippingFee(subtotal);

    const order = await this.orders.placeOrder({
      userId,
      shippingAddress,
      shippingFee,
      items,
      customizationSurchargeEgp: surchargeEgp,
    });
    await this.cartItems.clearForUser(userId);

    return toOrderDto(order, this.designs);
  }

  async listMyOrders(userId: string): Promise<OrderDto[]> {
    const rows = await this.orders.listByUser(userId);
    return Promise.all(rows.map((row) => toOrderDto(row, this.designs)));
  }

  async getMyOrder(userId: string, orderId: string): Promise<OrderDto> {
    const order = await this.orders.findById(orderId);
    if (!order) throw new NotFoundError("Order", orderId);
    if (order.userId !== userId) throw new ForbiddenError();
    return toOrderDto(order, this.designs);
  }

  private async resolveShippingAddress(
    userId: string,
    input: PlaceOrderDtoInput,
  ): Promise<ShippingAddressSnapshot> {
    if (input.addressId) {
      const address = await this.addresses.findById(input.addressId);
      if (!address) throw new NotFoundError("Address", input.addressId);
      if (address.userId !== userId) throw new ForbiddenError();
      return {
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        governorate: address.governorate,
        postalCode: address.postalCode,
        country: address.country,
      };
    }

    if (input.newAddress) {
      const { newAddress } = input;
      await this.addresses.create({
        userId,
        label: newAddress.label,
        fullName: newAddress.fullName,
        phone: newAddress.phone,
        line1: newAddress.line1,
        line2: newAddress.line2 ?? null,
        city: newAddress.city,
        governorate: newAddress.governorate,
        postalCode: newAddress.postalCode ?? null,
        country: newAddress.country,
        isDefault: newAddress.isDefault ?? false,
      });
      return {
        fullName: newAddress.fullName,
        phone: newAddress.phone,
        line1: newAddress.line1,
        line2: newAddress.line2 ?? null,
        city: newAddress.city,
        governorate: newAddress.governorate,
        postalCode: newAddress.postalCode ?? null,
        country: newAddress.country,
      };
    }

    throw new ValidationError("Provide an addressId or a newAddress");
  }
}

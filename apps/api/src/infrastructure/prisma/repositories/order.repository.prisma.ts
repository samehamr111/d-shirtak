import type { Prisma, PrismaClient } from "@prisma/client";
import { InsufficientStockError, NotFoundError } from "../../../domain/errors.js";
import type { Order, OrderStatus } from "../../../domain/entities/order.entity.js";
import { generateOrderNumber } from "../../../domain/services/order-number.service.js";
import { customizationSurcharge } from "../../../domain/services/pricing.service.js";
import type {
  IOrderRepository,
  OrderWithCustomer,
  PlaceOrderInput,
} from "../../../domain/ports/repositories/order.repository.js";

const withItems = { items: true } satisfies Prisma.OrderInclude;
type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof withItems }>;

const withItemsDetailed = {
  items: { include: { variant: { include: { product: true, color: true } } } },
  user: true,
} satisfies Prisma.OrderInclude;
type OrderWithItemsDetailed = Prisma.OrderGetPayload<{ include: typeof withItemsDetailed }>;

function toOrder(row: OrderWithItems): Order {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    userId: row.userId,
    status: row.status as Order["status"],
    paymentMethod: row.paymentMethod as Order["paymentMethod"],
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shippingFee),
    total: Number(row.total),
    shippingAddress: {
      fullName: row.shipFullName,
      phone: row.shipPhone,
      line1: row.shipLine1,
      line2: row.shipLine2,
      city: row.shipCity,
      governorate: row.shipGovernorate,
      postalCode: row.shipPostalCode,
      country: row.shipCountry,
    },
    items: row.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productVariantId: item.productVariantId,
      productNameSnapshot: item.productNameSnapshot,
      colorNameSnapshot: item.colorNameSnapshot,
      sizeNameSnapshot: item.sizeNameSnapshot,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      frontDesignId: item.frontDesignId,
      backDesignId: item.backDesignId,
    })),
    createdAt: row.createdAt,
  };
}

function toOrderDetailed(row: OrderWithItemsDetailed): OrderWithCustomer {
  return {
    ...toOrder(row),
    items: row.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productVariantId: item.productVariantId,
      productNameSnapshot: item.productNameSnapshot,
      colorNameSnapshot: item.colorNameSnapshot,
      sizeNameSnapshot: item.sizeNameSnapshot,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      frontDesignId: item.frontDesignId,
      backDesignId: item.backDesignId,
      garmentType: item.variant.product.garmentType as Order["items"][number]["garmentType"],
      colorHex: item.variant.color.hexCode,
    })),
    customerName: row.user.username,
  };
}

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly db: PrismaClient) {}

  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    const created = await this.db.$transaction(async (tx) => {
      let subtotalCents = 0;
      const itemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

      for (const item of input.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.productVariantId },
          include: { product: true, color: true, size: true },
        });
        if (!variant) throw new NotFoundError("ProductVariant", item.productVariantId);
        if (variant.stockQuantity < item.quantity) {
          throw new InsufficientStockError(variant.sku, item.quantity, variant.stockQuantity);
        }

        const decrement = await tx.productVariant.updateMany({
          where: { id: variant.id, stockQuantity: { gte: item.quantity } },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        if (decrement.count === 0) {
          throw new InsufficientStockError(variant.sku, item.quantity, variant.stockQuantity);
        }

        const unitPrice =
          (variant.priceOverride !== null ? Number(variant.priceOverride) : Number(variant.product.basePrice)) +
          customizationSurcharge(!!item.frontDesignId, !!item.backDesignId, input.customizationSurchargeEgp);
        subtotalCents += Math.round(unitPrice * 100) * item.quantity;

        itemsData.push({
          productVariantId: variant.id,
          productNameSnapshot: variant.product.name,
          colorNameSnapshot: variant.color.name,
          sizeNameSnapshot: variant.size.name,
          quantity: item.quantity,
          unitPrice,
          frontDesignId: item.frontDesignId,
          backDesignId: item.backDesignId,
        });
      }

      const subtotal = subtotalCents / 100;
      const total = subtotal + input.shippingFee;

      return tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: input.userId,
          subtotal,
          shippingFee: input.shippingFee,
          total,
          shipFullName: input.shippingAddress.fullName,
          shipPhone: input.shippingAddress.phone,
          shipLine1: input.shippingAddress.line1,
          shipLine2: input.shippingAddress.line2,
          shipCity: input.shippingAddress.city,
          shipGovernorate: input.shippingAddress.governorate,
          shipPostalCode: input.shippingAddress.postalCode,
          shipCountry: input.shippingAddress.country,
          items: { create: itemsData },
        },
        include: withItems,
      });
    });

    return toOrder(created);
  }

  async listByUser(userId: string): Promise<Order[]> {
    const rows = await this.db.order.findMany({
      where: { userId },
      include: withItems,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toOrder);
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.db.order.findUnique({ where: { id }, include: withItems });
    return row ? toOrder(row) : null;
  }

  async listAdmin(status?: OrderStatus): Promise<OrderWithCustomer[]> {
    const rows = await this.db.order.findMany({
      where: status ? { status } : undefined,
      include: { ...withItems, user: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => ({ ...toOrder(row), customerName: row.user.username }));
  }

  async findByIdAdmin(id: string): Promise<OrderWithCustomer | null> {
    const row = await this.db.order.findUnique({ where: { id }, include: withItemsDetailed });
    return row ? toOrderDetailed(row) : null;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const row = await this.db.order.update({ where: { id }, data: { status }, include: withItems });
    return toOrder(row);
  }
}

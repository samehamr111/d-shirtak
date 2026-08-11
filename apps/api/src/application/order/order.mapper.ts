import type { OrderDto, OrderItemDto, OrderSummaryDto } from "@d-shirtak/shared";
import type { IDesignRepository } from "../../domain/ports/repositories/design.repository.js";
import type { Order } from "../../domain/entities/order.entity.js";
import type { OrderWithCustomer } from "../../domain/ports/repositories/order.repository.js";

export async function toOrderDto(order: Order, designs: IDesignRepository): Promise<OrderDto> {
  const items: OrderItemDto[] = await Promise.all(
    order.items.map(async (item) => {
      const [frontDesign, backDesign] = await Promise.all([
        item.frontDesignId ? designs.findById(item.frontDesignId) : Promise.resolve(null),
        item.backDesignId ? designs.findById(item.backDesignId) : Promise.resolve(null),
      ]);
      return {
        id: item.id,
        productName: item.productNameSnapshot,
        colorName: item.colorNameSnapshot,
        sizeName: item.sizeNameSnapshot,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: Math.round(item.unitPrice * item.quantity * 100) / 100,
        frontDesignPreviewUrl: frontDesign?.previewImageUrl ?? null,
        backDesignPreviewUrl: backDesign?.previewImageUrl ?? null,
        garmentType: item.garmentType,
        colorHex: item.colorHex,
      };
    }),
  );

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    total: order.total,
    shippingAddress: {
      fullName: order.shippingAddress.fullName,
      phone: order.shippingAddress.phone,
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2 ?? undefined,
      city: order.shippingAddress.city,
      governorate: order.shippingAddress.governorate,
      postalCode: order.shippingAddress.postalCode ?? undefined,
      country: order.shippingAddress.country,
    },
    items,
    createdAt: order.createdAt.toISOString(),
  };
}

export function toOrderSummaryDto(order: OrderWithCustomer): OrderSummaryDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: order.total,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    customerName: order.customerName,
    createdAt: order.createdAt.toISOString(),
  };
}

import { z } from "zod";
import { GarmentType, OrderStatus, PaymentMethod } from "../enums.js";
import { addressSchema } from "./address.dto.js";

export const placeOrderSchema = z.object({
  addressId: z.string().min(1).optional(),
  newAddress: addressSchema.optional(),
});
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export interface OrderItemDto {
  id: string;
  productName: string;
  colorName: string;
  sizeName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  frontDesignPreviewUrl: string | null;
  backDesignPreviewUrl: string | null;
  /** Only present on the admin order-detail endpoint -- lets admin generate a model-shot
   *  prompt for this exact item without a separate lookup. */
  garmentType?: GarmentType;
  colorHex?: string;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    governorate: string;
    postalCode?: string;
    country: string;
  };
  items: OrderItemDto[];
  createdAt: string;
}

export interface OrderSummaryDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  customerName: string;
  createdAt: string;
}

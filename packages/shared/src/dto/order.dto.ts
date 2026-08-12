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

/** One piece of a saved design, broken out of its raw canvasJson for the admin order view --
 *  either a text block (with the font used) or an image (either a customer upload, or a pick
 *  from the design library, in which case libraryAssetId/Name point back to it). */
export type DesignElementDto =
  | { kind: "text"; content: string; fontFamily: string | null }
  | { kind: "image"; url: string; libraryAssetId: string | null; libraryAssetName: string | null };

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
  /** Only present on the admin order-detail endpoint -- everything the customer added to this
   *  side, ready to download/reference for printing. */
  frontDesignElements?: DesignElementDto[];
  backDesignElements?: DesignElementDto[];
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

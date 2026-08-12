import type { GarmentType } from "@d-shirtak/shared";

export type OrderStatus =
  | "PENDING"
  | "CONTACTED"
  | "PRINTING"
  | "PACKAGING"
  | "DELIVERY"
  | "CANCELLED";

export interface ShippingAddressSnapshot {
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  governorate: string;
  postalCode: string | null;
  country: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  productNameSnapshot: string;
  colorNameSnapshot: string;
  sizeNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  frontDesignId: string | null;
  backDesignId: string | null;
  /** Only populated by the admin order-detail query (see findByIdAdmin) -- needed to generate
   *  a model-shot prompt directly from an order line item without a separate lookup. */
  garmentType?: GarmentType;
  colorHex?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentMethod: "COD";
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: ShippingAddressSnapshot;
  items: OrderItem[];
  createdAt: Date;
}

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONTACTED", "CANCELLED"],
  CONTACTED: ["PRINTING", "CANCELLED"],
  PRINTING: ["PACKAGING"],
  PACKAGING: ["DELIVERY"],
  DELIVERY: [],
  CANCELLED: [],
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}

import type { Order, OrderStatus, ShippingAddressSnapshot } from "../../entities/order.entity.js";

export interface PlaceOrderItemInput {
  productVariantId: string;
  quantity: number;
  frontDesignId: string | null;
  backDesignId: string | null;
}

export interface PlaceOrderInput {
  userId: string;
  shippingAddress: ShippingAddressSnapshot;
  shippingFee: number;
  items: PlaceOrderItemInput[];
  /** Per printed side, applied on top of each item's variant price. */
  customizationSurchargeEgp: number;
}

export interface OrderWithCustomer extends Order {
  customerName: string;
}

export interface IOrderRepository {
  /** Atomically validates stock, decrements it, and creates the order + snapshot line items. */
  placeOrder(input: PlaceOrderInput): Promise<Order>;
  listByUser(userId: string): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  listAdmin(status?: OrderStatus): Promise<OrderWithCustomer[]>;
  findByIdAdmin(id: string): Promise<OrderWithCustomer | null>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
  /** Deletes the order and its items (OrderItem cascades from Order in the schema). Used only
   *  for the cancel-and-purge flow -- see AdminOrderService.updateStatus. */
  delete(id: string): Promise<void>;
}

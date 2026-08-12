import { ORDER_STATUS_FLOW, OrderStatus } from "@d-shirtak/shared";
import type { OrderStatus as OrderStatusType } from "@d-shirtak/shared";

const CANCELLABLE_FROM: OrderStatusType[] = [OrderStatus.PENDING, OrderStatus.CONTACTED];

/** Friendlier copy than the raw status string for the "mark as..." buttons and toasts. */
export const STATUS_LABELS: Record<OrderStatusType, string> = {
  [OrderStatus.PENDING]: "Pending",
  [OrderStatus.CONTACTED]: "Contacted",
  [OrderStatus.PRINTING]: "Printing",
  [OrderStatus.PACKAGING]: "Packaging",
  [OrderStatus.DELIVERY]: "Delivery",
  [OrderStatus.CANCELLED]: "Cancelled",
};

/** The action-y verb for the button that moves TO this status, e.g. "Approve — Start Printing"
 *  reads much better than "Mark as Printing" once you're the one clicking it. */
export const STATUS_ACTION_LABELS: Record<OrderStatusType, string> = {
  [OrderStatus.PENDING]: "Mark as Pending",
  [OrderStatus.CONTACTED]: "Mark as Contacted",
  [OrderStatus.PRINTING]: "Approve — Start Printing",
  [OrderStatus.PACKAGING]: "Mark as Packaging",
  [OrderStatus.DELIVERY]: "Mark as Delivered",
  [OrderStatus.CANCELLED]: "Cancel order",
};

export function getNextStatuses(current: OrderStatusType): OrderStatusType[] {
  const flowIndex = ORDER_STATUS_FLOW.indexOf(current);
  const next: OrderStatusType[] = [];

  if (flowIndex !== -1 && flowIndex < ORDER_STATUS_FLOW.length - 1) {
    const forward = ORDER_STATUS_FLOW[flowIndex + 1];
    if (forward) next.push(forward);
  }
  if (CANCELLABLE_FROM.includes(current)) {
    next.push(OrderStatus.CANCELLED);
  }
  return next;
}

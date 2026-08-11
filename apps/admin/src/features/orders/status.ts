import { ORDER_STATUS_FLOW, OrderStatus } from "@d-shirtak/shared";
import type { OrderStatus as OrderStatusType } from "@d-shirtak/shared";

const CANCELLABLE_FROM: OrderStatusType[] = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING];

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

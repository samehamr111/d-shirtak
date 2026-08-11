import type { OrderStatus } from "@d-shirtak/shared";
import { Badge } from "./ui/Badge";

const toneByStatus: Record<OrderStatus, "neutral" | "brand" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  CONFIRMED: "brand",
  PROCESSING: "brand",
  SHIPPED: "success",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={toneByStatus[status]}>{status}</Badge>;
}

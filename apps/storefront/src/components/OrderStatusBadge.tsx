import type { OrderStatus } from "@d-shirtak/shared";
import { Badge } from "./ui/Badge";

const toneByStatus: Record<OrderStatus, "neutral" | "brand" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  CONTACTED: "brand",
  PRINTING: "brand",
  PACKAGING: "brand",
  DELIVERY: "success",
  CANCELLED: "danger",
};

const LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONTACTED: "Contacted",
  PRINTING: "Printing",
  PACKAGING: "Packaging",
  DELIVERY: "Delivery",
  CANCELLED: "Cancelled",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={toneByStatus[status]}>{LABELS[status]}</Badge>;
}

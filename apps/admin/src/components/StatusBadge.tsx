import { OrderStatus } from "@d-shirtak/shared";
import type { OrderStatus as OrderStatusType } from "@d-shirtak/shared";

const ORDER_STATUS_STYLES: Record<OrderStatusType, string> = {
  [OrderStatus.PENDING]: "bg-amber-100 text-amber-800",
  [OrderStatus.CONTACTED]: "bg-sky-100 text-sky-800",
  [OrderStatus.PRINTING]: "bg-indigo-100 text-indigo-800",
  [OrderStatus.PACKAGING]: "bg-violet-100 text-violet-800",
  [OrderStatus.DELIVERY]: "bg-emerald-100 text-emerald-800",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: OrderStatusType }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

export function BooleanBadge({ value, trueLabel = "Active", falseLabel = "Inactive" }: { value: boolean; trueLabel?: string; falseLabel?: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        value ? "bg-emerald-100 text-emerald-800" : "bg-ink/10 text-ink/60"
      }`}
    >
      {value ? trueLabel : falseLabel}
    </span>
  );
}

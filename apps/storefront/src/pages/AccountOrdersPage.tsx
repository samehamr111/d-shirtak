import { Link } from "react-router-dom";
import type { OrderDto, OrderStatus } from "@d-shirtak/shared";
import { Container } from "../components/ui/Container";
import { LinkButton } from "../components/ui/LinkButton";
import { PageSpinner } from "../components/ui/Spinner";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { useMyOrders } from "../features/orders/orders-api";
import { AccountNav } from "../components/AccountNav";
import { ImageOrPlaceholder } from "../components/ui/ImageOrPlaceholder";

const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "CONTACTED", label: "Confirmed" },
  { status: "PRINTING", label: "Printing" },
  { status: "PACKAGING", label: "Packaging" },
  { status: "DELIVERY", label: "Delivered" },
];

const STATUS_RANK: Record<OrderStatus, number> = {
  PENDING: 0,
  CONTACTED: 1,
  PRINTING: 2,
  PACKAGING: 3,
  DELIVERY: 4,
  CANCELLED: -1,
};

function OrderTimeline({ status }: { status: OrderStatus }) {
  const rank = STATUS_RANK[status];
  return (
    <div className="mt-5 flex items-center">
      {TIMELINE_STEPS.map((step, i) => {
        const stepRank = i + 1;
        const done = rank >= stepRank;
        return (
          <div key={step.status} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${done ? "bg-brand-500" : "border-2 border-ink/15 bg-white"}`} />
              <span className={`text-[11px] font-medium ${done ? "text-brand-700" : "text-ink/40"}`}>{step.label}</span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <span className={`mx-1 h-0.5 flex-1 ${rank > stepRank ? "bg-brand-500" : "bg-ink/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order, featured = false }: { order: OrderDto; featured?: boolean }) {
  const isCustom = order.items.some((i) => i.frontDesignPreviewUrl || i.backDesignPreviewUrl);
  return (
    <Link
      to={`/account/orders/${order.id}`}
      className="block rounded-2xl border border-ink/[.08] bg-white p-5 transition-colors hover:border-brand-500/40"
    >
      <div className="flex items-center gap-3.5">
        <ImageOrPlaceholder
          src={order.items[0]?.frontDesignPreviewUrl ?? order.items[0]?.backDesignPreviewUrl}
          alt=""
          className="h-[62px] w-[54px] shrink-0 overflow-hidden rounded-lg object-cover"
          iconClassName="h-[26px] w-[26px] text-ink/25"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-semibold">{order.orderNumber}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-[13px] text-ink/58">
            {order.items.length} {order.items.length === 1 ? "item" : "items"} · {isCustom ? "your design" : "ready-printed"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">EGP {order.total.toFixed(0)}</p>
          <p className="mt-1 text-xs text-ink/45">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      {featured && order.status !== "CANCELLED" && <OrderTimeline status={order.status} />}
    </Link>
  );
}

export function AccountOrdersPage() {
  const { data: orders, isLoading } = useMyOrders();

  return (
    <Container className="py-8">
      <div className="grid gap-7 lg:grid-cols-[230px_1fr]">
        <AccountNav />

        <div>
          <div className="mb-5 flex items-baseline justify-between">
            <h1 className="font-display text-5xl tracking-wide">YOUR ORDERS</h1>
            {orders && orders.length > 0 && (
              <span className="font-mono text-[11px] text-ink/45">{orders.length} orders</span>
            )}
          </div>

          {isLoading && <PageSpinner />}
          {!isLoading && orders?.length === 0 && (
            <div className="rounded-2xl border border-dashed border-ink/20 p-10 text-center">
              <p className="text-ink/60">No orders yet.</p>
              <LinkButton to="/shop" className="mt-4">
                Start Shopping
              </LinkButton>
            </div>
          )}

          <div className="flex flex-col gap-3.5">
            {orders?.map((order, i) => <OrderCard key={order.id} order={order} featured={i === 0} />)}
          </div>
        </div>
      </div>
    </Container>
  );
}

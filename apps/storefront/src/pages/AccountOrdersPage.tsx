import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { LinkButton } from "../components/ui/LinkButton";
import { PageSpinner } from "../components/ui/Spinner";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { useMyOrders } from "../features/orders/orders-api";
import { AccountNav } from "../components/AccountNav";

export function AccountOrdersPage() {
  const { data: orders, isLoading } = useMyOrders();

  return (
    <Container className="py-10">
      <h1 className="font-display text-5xl">My Account</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <AccountNav />

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">Orders</h2>
          {isLoading && <PageSpinner />}
          {!isLoading && orders?.length === 0 && (
            <div className="rounded-2xl border border-dashed border-ink/20 p-10 text-center">
              <p className="text-ink/60">No orders yet.</p>
              <LinkButton to="/shop" className="mt-4">
                Start Shopping
              </LinkButton>
            </div>
          )}
          <ul className="space-y-3">
            {orders?.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/account/orders/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 p-4 hover:border-ink/30"
                >
                  <div>
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-xs text-ink/50">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm text-ink/60">{order.items.length} item(s)</p>
                  <p className="font-semibold">EGP {order.total.toFixed(0)}</p>
                  <OrderStatusBadge status={order.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  );
}

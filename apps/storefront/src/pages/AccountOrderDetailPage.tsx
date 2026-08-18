import { useEffect, useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { PageSpinner } from "../components/ui/Spinner";
import { ImageOrPlaceholder } from "../components/ui/ImageOrPlaceholder";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { useMyOrder } from "../features/orders/orders-api";
import { trackPurchase } from "../lib/analytics";

export function AccountOrderDetailPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const justPlaced = Boolean((location.state as { justPlaced?: boolean } | null)?.justPlaced);
  const { data: order, isLoading } = useMyOrder(orderId);

  // Fired from here rather than checkout's "place order" handler on purpose: this is the actual
  // confirmation page a customer lands on after a successful order, so there's no risk of the
  // tracking beacon getting cut off by an immediate navigation, and `justPlaced` naturally
  // guards against double-counting on a refresh -- it's router state, so it doesn't survive one.
  const trackedRef = useRef(false);
  useEffect(() => {
    if (trackedRef.current || !justPlaced || !order) return;
    trackedRef.current = true;
    trackPurchase({
      transactionId: order.orderNumber,
      value: order.total,
      items: order.items.map((i) => ({ item_id: i.id, item_name: i.productName, price: i.unitPrice, quantity: i.quantity })),
    });
  }, [justPlaced, order]);

  if (isLoading) return <PageSpinner />;
  if (!order) {
    return <Container className="py-20 text-center text-ink/60">Couldn't find that order.</Container>;
  }

  return (
    <Container className="py-10">
      <Link to="/account/orders" className="text-sm font-semibold text-ink/50 hover:text-ink">
        ← All Orders
      </Link>

      {justPlaced && (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          Order placed! We'll text you when it's confirmed. Pay in cash on delivery.
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl">{order.orderNumber}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-ink/50">Placed {new Date(order.createdAt).toLocaleString()}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 rounded-2xl border border-ink/10 p-4">
              <div className="flex gap-2">
                {item.frontDesignPreviewUrl || item.backDesignPreviewUrl ? (
                  <>
                    {item.frontDesignPreviewUrl && (
                      <ImageOrPlaceholder
                        src={item.frontDesignPreviewUrl}
                        alt="Front design"
                        className="h-24 w-20 rounded-xl object-cover"
                      />
                    )}
                    {item.backDesignPreviewUrl && (
                      <ImageOrPlaceholder
                        src={item.backDesignPreviewUrl}
                        alt="Back design"
                        className="h-24 w-20 rounded-xl object-cover"
                      />
                    )}
                  </>
                ) : (
                  <ImageOrPlaceholder src={null} alt="" className="h-24 w-20 rounded-xl" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-sm text-ink/50">
                    {item.colorName} · {item.sizeName} · Qty {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">EGP {item.lineTotal.toFixed(0)}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="space-y-6">
          <div className="rounded-2xl border border-ink/10 p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/50">Shipping To</h2>
            <p className="text-sm">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.governorate}
              <br />
              {order.shippingAddress.country}
              <br />
              {order.shippingAddress.phone}
            </p>
          </div>

          <div className="rounded-2xl border border-ink/10 p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/50">Total</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-ink/60">
                <span>Subtotal</span>
                <span>EGP {order.subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-ink/60">
                <span>Shipping</span>
                <span>{order.shippingFee === 0 ? "Free" : `EGP ${order.shippingFee.toFixed(0)}`}</span>
              </div>
              <div className="flex justify-between border-t border-ink/10 pt-1 font-semibold text-ink">
                <span>Total</span>
                <span>EGP {order.total.toFixed(0)}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-ink/40">Payment: Cash on Delivery</p>
          </div>
        </div>
      </div>
    </Container>
  );
}

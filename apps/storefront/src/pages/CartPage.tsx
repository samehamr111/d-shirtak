import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { LinkButton } from "../components/ui/LinkButton";
import { PageSpinner } from "../components/ui/Spinner";
import { useAuth } from "../features/auth/auth-context";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "../features/cart/cart-api";

export function CartPage() {
  const { status } = useAuth();
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  if (status === "guest") {
    return (
      <Container className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-5xl tracking-wide">YOUR CART</h1>
        <p className="mt-2 text-ink/60">Sign in to see what's in your cart.</p>
        <LinkButton to="/login" className="mt-6">
          Sign In
        </LinkButton>
      </Container>
    );
  }

  if (status === "loading" || isLoading) return <PageSpinner />;

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <Container className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-5xl tracking-wide">YOUR CART IS EMPTY</h1>
        <p className="mt-2 text-ink/60">Find something to wear, or design something new.</p>
        <LinkButton to="/shop" className="mt-6">
          Start Shopping
        </LinkButton>
      </Container>
    );
  }

  const madeCount = items.filter((i) => i.frontDesignPreviewUrl || i.backDesignPreviewUrl).length;

  return (
    <Container className="py-8">
      <h1 className="font-display text-6xl tracking-wide">YOUR CART</h1>
      <p className="mt-1.5 text-sm text-ink/55">
        {items.length} {items.length === 1 ? "piece" : "pieces"}
        {madeCount > 0 && ` · ${madeCount} of them you made`}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <ul className="flex flex-col gap-3.5">
          {items.map((item) => {
            const isCustom = item.frontDesignPreviewUrl || item.backDesignPreviewUrl;
            return (
              <li key={item.id} className="flex items-center gap-4 rounded-2xl border border-ink/[.08] bg-white p-4">
                <div className="h-[100px] w-[92px] shrink-0 overflow-hidden rounded-xl bg-ink/5">
                  <img
                    src={item.frontDesignPreviewUrl ?? item.imageUrl}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide ${
                      isCustom ? "bg-brand-500 text-ink" : "bg-ink/[.07] text-ink/60"
                    }`}
                  >
                    {isCustom ? "Your design" : "Ready-printed"}
                  </span>
                  <p className="mt-2 font-semibold">{item.productName}</p>
                  <p className="mt-0.5 text-sm text-ink/55">
                    {item.colorName} · {item.sizeName}
                    {isCustom && item.frontDesignPreviewUrl && item.backDesignPreviewUrl ? " · front + back" : ""}
                  </p>
                  <button
                    onClick={() => removeItem.mutate(item.id)}
                    className="mt-2 text-xs font-medium text-ink/40 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <p className="text-lg font-semibold">EGP {(item.unitPrice * item.quantity).toFixed(0)}</p>
                  <div className="flex items-center gap-3 rounded-full border border-ink/[.14] px-3 py-1.5 text-sm font-medium">
                    <button
                      disabled={updateItem.isPending}
                      onClick={() => updateItem.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      disabled={updateItem.isPending || item.quantity >= item.stockQuantity}
                      onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                    >
                      +
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
          <Link to="/shop" className="mt-1.5 text-sm font-semibold text-ink hover:text-brand-700">
            ← Keep shopping
          </Link>
        </ul>

        <div className="h-fit overflow-hidden rounded-2xl border border-ink/[.08] bg-white">
          <div className="p-5">
            <p className="mb-1 font-display text-3xl tracking-wide">ORDER SUMMARY</p>
            <p className="mb-4 font-mono text-[10.5px] text-ink/40">D-SHIRTAK</p>
            <div className="flex flex-col gap-2.5 border-b border-dashed border-ink/[.14] pb-4 text-sm text-ink/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>EGP {(cart?.subtotal ?? 0).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-ink/45">at checkout</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between py-4">
              <span className="font-semibold">Total</span>
              <span className="font-display text-4xl tracking-wide">EGP {(cart?.subtotal ?? 0).toFixed(0)}</span>
            </div>
            <LinkButton to="/checkout" size="lg" className="w-full">
              Checkout →
            </LinkButton>
          </div>
          <div className="flex items-center justify-center bg-ink px-5 py-3.5">
            <span className="font-mono text-[10.5px] tracking-wide text-white/70">CASH ON DELIVERY · PAY ON ARRIVAL</span>
          </div>
        </div>
      </div>
    </Container>
  );
}

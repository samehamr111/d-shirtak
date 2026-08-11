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
        <h1 className="font-display text-4xl">Your Cart</h1>
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
        <h1 className="font-display text-4xl">Your Cart is Empty</h1>
        <p className="mt-2 text-ink/60">Find something to wear, or design something new.</p>
        <LinkButton to="/shop" className="mt-6">
          Start Shopping
        </LinkButton>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="font-display text-5xl">Your Cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 rounded-2xl border border-ink/10 p-4">
              <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-ink/5">
                <img
                  src={item.frontDesignPreviewUrl ?? item.imageUrl}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-sm text-ink/50">
                    {item.colorName} · {item.sizeName}
                  </p>
                  {(item.frontDesignPreviewUrl || item.backDesignPreviewUrl) && (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
                      Custom design{item.frontDesignPreviewUrl && item.backDesignPreviewUrl ? " · Front & Back" : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-ink/15">
                    <button
                      className="h-8 w-8 text-base"
                      disabled={updateItem.isPending}
                      onClick={() => updateItem.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      className="h-8 w-8 text-base"
                      disabled={updateItem.isPending || item.quantity >= item.stockQuantity}
                      onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                    >
                      +
                    </button>
                  </div>
                  <p className="font-semibold">EGP {(item.unitPrice * item.quantity).toFixed(0)}</p>
                </div>
              </div>
              <button
                onClick={() => removeItem.mutate(item.id)}
                aria-label="Remove item"
                className="self-start text-ink/30 hover:text-red-600"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-2xl border border-ink/10 p-6">
          <p className="text-sm uppercase tracking-wide text-ink/50">Subtotal</p>
          <p className="mt-1 text-3xl font-semibold">EGP {(cart?.subtotal ?? 0).toFixed(0)}</p>
          <p className="mt-1 text-xs text-ink/40">Shipping and totals calculated at checkout.</p>
          <LinkButton to="/checkout" size="lg" className="mt-6 w-full">
            Checkout
          </LinkButton>
          <Link to="/shop" className="mt-3 block text-center text-sm font-semibold text-ink/50 hover:text-ink">
            Continue Shopping
          </Link>
        </div>
      </div>
    </Container>
  );
}

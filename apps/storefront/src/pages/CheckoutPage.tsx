import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { AddressInput } from "@d-shirtak/shared";
import { trackBeginCheckout, trackPurchase } from "../lib/analytics";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { LinkButton } from "../components/ui/LinkButton";
import { PageSpinner, InlineSpinner } from "../components/ui/Spinner";
import { useAddresses } from "../features/addresses/addresses-api";
import { useAuth } from "../features/auth/auth-context";
import { useCart } from "../features/cart/cart-api";
import { usePlaceOrder } from "../features/orders/orders-api";
import { describeError } from "../lib/errors";

const emptyAddress: AddressInput = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  governorate: "",
  postalCode: "",
  country: "Egypt",
  isDefault: false,
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useAuth();
  const { data: addresses, isLoading: loadingAddresses } = useAddresses();
  const { data: cart, isLoading: loadingCart } = useCart();
  const placeOrder = usePlaceOrder();

  const [selectedAddressId, setSelectedAddressId] = useState<string | "new" | null>(null);
  const [newAddress, setNewAddress] = useState<AddressInput>(emptyAddress);
  const [error, setError] = useState<string | null>(null);

  // Fires once per visit to this page, the moment there's a real cart to check out -- not inside
  // the early-return guards below since hooks can't run conditionally, so this reads straight off
  // `cart` (possibly still loading/empty) instead.
  const trackedBeginCheckoutRef = useRef(false);
  useEffect(() => {
    if (trackedBeginCheckoutRef.current || !cart || cart.items.length === 0) return;
    trackedBeginCheckoutRef.current = true;
    trackBeginCheckout(
      cart.items.map((i) => ({ item_id: i.productVariantId, item_name: i.productName, price: i.unitPrice, quantity: i.quantity })),
      cart.subtotal,
    );
  }, [cart]);

  // Orders (and the cart rows behind them) belong to a real account -- this is the one point in
  // the guest flow where signing in is actually required. Everything up to here (browsing,
  // designing, adding to cart) works without an account; logging in here also migrates whatever
  // was sitting in the local guest cart onto the server cart automatically.
  if (status === "guest") {
    return (
      <Container className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-5xl tracking-wide">ALMOST THERE</h1>
        <p className="mt-2 max-w-sm text-ink/60">Sign in to finish your order — your cart is saved and will be waiting.</p>
        <div className="mt-6 flex items-center gap-4">
          <LinkButton to="/login" state={{ from: location }}>
            Sign In
          </LinkButton>
          <LinkButton to="/signup" state={{ from: location }} variant="outline">
            Create Account
          </LinkButton>
        </div>
      </Container>
    );
  }

  if (status === "loading" || loadingAddresses || loadingCart) return <PageSpinner />;

  const effectiveSelection = selectedAddressId ?? addresses?.find((a) => a.isDefault)?.id ?? addresses?.[0]?.id ?? "new";
  const items = cart?.items ?? [];

  async function handlePlaceOrder() {
    setError(null);
    try {
      const order =
        effectiveSelection === "new"
          ? await placeOrder.mutateAsync({ newAddress })
          : await placeOrder.mutateAsync({ addressId: effectiveSelection });
      trackPurchase({
        transactionId: order.orderNumber,
        value: order.total,
        items: order.items.map((i) => ({ item_id: i.id, item_name: i.productName, price: i.unitPrice, quantity: i.quantity })),
      });
      navigate(`/account/orders/${order.id}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(describeError(err, "Couldn't place your order. Try again."));
    }
  }

  return (
    <Container className="py-8">
      <h1 className="font-display text-6xl tracking-wide">CHECKOUT</h1>

      <div className="mt-8 grid gap-9 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-ink/[.08] bg-white p-7">
            <h2 className="mb-5 font-display text-3xl tracking-wide">DELIVERY DETAILS</h2>

            <div className="flex flex-col gap-2.5">
              {addresses?.map((address) => (
                <label
                  key={address.id}
                  className={`flex cursor-pointer items-center gap-3.5 rounded-xl border-2 px-4 py-4 text-sm transition-colors ${
                    effectiveSelection === address.id ? "border-brand-500 bg-brand-500/[.06]" : "border-ink/[.12]"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    className="accent-brand-500"
                    checked={effectiveSelection === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                  />
                  <span>
                    <span className="font-semibold">{address.fullName}</span> — {address.line1}, {address.city},{" "}
                    {address.governorate}
                  </span>
                </label>
              ))}

              <label
                className={`flex cursor-pointer items-center gap-3.5 rounded-xl border-2 px-4 py-4 text-sm font-semibold transition-colors ${
                  effectiveSelection === "new" ? "border-brand-500 bg-brand-500/[.06]" : "border-ink/[.12]"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  className="accent-brand-500"
                  checked={effectiveSelection === "new"}
                  onChange={() => setSelectedAddressId("new")}
                />
                Ship to a new address
              </label>
            </div>

            {effectiveSelection === "new" && (
              <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-paper p-5 sm:grid-cols-2">
                <Field label="Full Name" htmlFor="fullName">
                  <Input id="fullName" required value={newAddress.fullName} onChange={(e) => setNewAddress((a) => ({ ...a, fullName: e.target.value }))} />
                </Field>
                <Field label="Phone" htmlFor="phone">
                  <Input id="phone" required value={newAddress.phone} onChange={(e) => setNewAddress((a) => ({ ...a, phone: e.target.value }))} />
                </Field>
                <Field label="Address Line 1" htmlFor="line1">
                  <Input id="line1" required value={newAddress.line1} onChange={(e) => setNewAddress((a) => ({ ...a, line1: e.target.value }))} />
                </Field>
                <Field label="Address Line 2 (optional)" htmlFor="line2">
                  <Input id="line2" value={newAddress.line2} onChange={(e) => setNewAddress((a) => ({ ...a, line2: e.target.value }))} />
                </Field>
                <Field label="City" htmlFor="city">
                  <Input id="city" required value={newAddress.city} onChange={(e) => setNewAddress((a) => ({ ...a, city: e.target.value }))} />
                </Field>
                <Field label="Governorate" htmlFor="governorate">
                  <Input id="governorate" required value={newAddress.governorate} onChange={(e) => setNewAddress((a) => ({ ...a, governorate: e.target.value }))} />
                </Field>
                <Field label="Postal Code (optional)" htmlFor="postalCode">
                  <Input id="postalCode" value={newAddress.postalCode} onChange={(e) => setNewAddress((a) => ({ ...a, postalCode: e.target.value }))} />
                </Field>
                <Field label="Country" htmlFor="country">
                  <Input id="country" required value={newAddress.country} onChange={(e) => setNewAddress((a) => ({ ...a, country: e.target.value }))} />
                </Field>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-ink/[.08] bg-white p-7">
            <h2 className="mb-5 font-display text-3xl tracking-wide">PAYMENT</h2>
            <div className="flex items-center gap-4 rounded-xl border-2 border-brand-500 bg-brand-500/[.06] px-5 py-4">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand-500">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">Cash on Delivery</p>
                <p className="mt-0.5 text-xs text-ink/55">Pay in cash when your order arrives. No card details needed today.</p>
              </div>
              <span className="font-display text-lg tracking-wide text-brand-700">ONLY OPTION</span>
            </div>
          </div>
        </div>

        <div className="h-fit rounded-2xl bg-ink p-6">
          <p className="mb-4 font-display text-2xl tracking-wide text-white">
            {items.length} {items.length === 1 ? "ITEM" : "ITEMS"}
          </p>
          <ul className="flex flex-col gap-3 border-b border-dashed border-white/20 pb-4 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2 text-white/75">
                <span>
                  {item.productName} ({item.colorName}/{item.sizeName}) × {item.quantity}
                </span>
                <span className="font-semibold text-white">EGP {(item.unitPrice * item.quantity).toFixed(0)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between py-4">
            <span className="font-display text-xl tracking-wide text-white">TOTAL</span>
            <span className="text-2xl font-bold text-brand-500">EGP {(cart?.subtotal ?? 0).toFixed(0)}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-white/40">
            You pay the courier when it arrives. Nothing charged now.
          </p>
          {error && <p className="mt-4 text-sm font-medium text-red-400">{error}</p>}
          <Button
            size="lg"
            className="mt-5 w-full"
            disabled={items.length === 0 || placeOrder.isPending}
            onClick={handlePlaceOrder}
          >
            {placeOrder.isPending && <InlineSpinner />}
            {placeOrder.isPending ? "Placing Order…" : "Place order"}
          </Button>
        </div>
      </div>
    </Container>
  );
}

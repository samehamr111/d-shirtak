import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AddressInput } from "@d-shirtak/shared";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { PageSpinner } from "../components/ui/Spinner";
import { useAddresses } from "../features/addresses/addresses-api";
import { useCart } from "../features/cart/cart-api";
import { usePlaceOrder } from "../features/orders/orders-api";
import { ApiError } from "../lib/api-client";

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
  const { data: addresses, isLoading: loadingAddresses } = useAddresses();
  const { data: cart, isLoading: loadingCart } = useCart();
  const placeOrder = usePlaceOrder();

  const [selectedAddressId, setSelectedAddressId] = useState<string | "new" | null>(null);
  const [newAddress, setNewAddress] = useState<AddressInput>(emptyAddress);
  const [error, setError] = useState<string | null>(null);

  if (loadingAddresses || loadingCart) return <PageSpinner />;

  const effectiveSelection = selectedAddressId ?? addresses?.find((a) => a.isDefault)?.id ?? addresses?.[0]?.id ?? "new";
  const items = cart?.items ?? [];

  async function handlePlaceOrder() {
    setError(null);
    try {
      const order =
        effectiveSelection === "new"
          ? await placeOrder.mutateAsync({ newAddress })
          : await placeOrder.mutateAsync({ addressId: effectiveSelection });
      navigate(`/account/orders/${order.id}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't place your order. Try again.");
    }
  }

  return (
    <Container className="py-10">
      <h1 className="font-display text-5xl">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">Shipping Address</h2>

          <div className="space-y-3">
            {addresses?.map((address) => (
              <label
                key={address.id}
                className={`block cursor-pointer rounded-2xl border p-4 text-sm ${
                  effectiveSelection === address.id ? "border-brand-500 ring-2 ring-brand-500/20" : "border-ink/10"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  className="mr-2"
                  checked={effectiveSelection === address.id}
                  onChange={() => setSelectedAddressId(address.id)}
                />
                <span className="font-semibold">{address.fullName}</span> — {address.line1}, {address.city},{" "}
                {address.governorate}
              </label>
            ))}

            <label
              className={`block cursor-pointer rounded-2xl border p-4 text-sm font-semibold ${
                effectiveSelection === "new" ? "border-brand-500 ring-2 ring-brand-500/20" : "border-ink/10"
              }`}
            >
              <input
                type="radio"
                name="address"
                className="mr-2"
                checked={effectiveSelection === "new"}
                onChange={() => setSelectedAddressId("new")}
              />
              Ship to a new address
            </label>
          </div>

          {effectiveSelection === "new" && (
            <div className="mt-4 grid grid-cols-1 gap-4 rounded-2xl border border-ink/10 p-5 sm:grid-cols-2">
              <Field label="Full Name" htmlFor="fullName">
                <Input
                  id="fullName"
                  required
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress((a) => ({ ...a, fullName: e.target.value }))}
                />
              </Field>
              <Field label="Phone" htmlFor="phone">
                <Input
                  id="phone"
                  required
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress((a) => ({ ...a, phone: e.target.value }))}
                />
              </Field>
              <Field label="Address Line 1" htmlFor="line1">
                <Input
                  id="line1"
                  required
                  value={newAddress.line1}
                  onChange={(e) => setNewAddress((a) => ({ ...a, line1: e.target.value }))}
                />
              </Field>
              <Field label="Address Line 2 (optional)" htmlFor="line2">
                <Input
                  id="line2"
                  value={newAddress.line2}
                  onChange={(e) => setNewAddress((a) => ({ ...a, line2: e.target.value }))}
                />
              </Field>
              <Field label="City" htmlFor="city">
                <Input
                  id="city"
                  required
                  value={newAddress.city}
                  onChange={(e) => setNewAddress((a) => ({ ...a, city: e.target.value }))}
                />
              </Field>
              <Field label="Governorate" htmlFor="governorate">
                <Input
                  id="governorate"
                  required
                  value={newAddress.governorate}
                  onChange={(e) => setNewAddress((a) => ({ ...a, governorate: e.target.value }))}
                />
              </Field>
              <Field label="Postal Code (optional)" htmlFor="postalCode">
                <Input
                  id="postalCode"
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress((a) => ({ ...a, postalCode: e.target.value }))}
                />
              </Field>
              <Field label="Country" htmlFor="country">
                <Input
                  id="country"
                  required
                  value={newAddress.country}
                  onChange={(e) => setNewAddress((a) => ({ ...a, country: e.target.value }))}
                />
              </Field>
            </div>
          )}

          <div className="mt-8 rounded-2xl bg-ink/5 p-5 text-sm text-ink/70">
            <p className="font-semibold text-ink">Payment: Cash on Delivery</p>
            <p className="mt-1">Pay in cash when your order arrives. No card details needed today.</p>
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-ink/10 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">Order Summary</h2>
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span className="text-ink/70">
                  {item.productName} ({item.colorName}/{item.sizeName}) × {item.quantity}
                </span>
                <span className="font-semibold">EGP {(item.unitPrice * item.quantity).toFixed(0)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-ink/10 pt-4">
            <div className="flex justify-between text-sm text-ink/60">
              <span>Subtotal</span>
              <span>EGP {(cart?.subtotal ?? 0).toFixed(0)}</span>
            </div>
            <p className="mt-1 text-xs text-ink/40">+ shipping, confirmed on the next screen</p>
          </div>

          {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

          <Button
            size="lg"
            className="mt-6 w-full"
            disabled={items.length === 0 || placeOrder.isPending}
            onClick={handlePlaceOrder}
          >
            {placeOrder.isPending ? "Placing Order…" : "Place Order"}
          </Button>
        </div>
      </div>
    </Container>
  );
}

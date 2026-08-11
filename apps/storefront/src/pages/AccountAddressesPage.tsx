import { useState } from "react";
import type { AddressInput } from "@d-shirtak/shared";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { PageSpinner } from "../components/ui/Spinner";
import { AccountNav } from "../components/AccountNav";
import { useAddresses, useCreateAddress, useDeleteAddress } from "../features/addresses/addresses-api";

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

export function AccountAddressesPage() {
  const { data: addresses, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressInput>(emptyAddress);

  async function handleCreate() {
    await createAddress.mutateAsync(form);
    setForm(emptyAddress);
    setShowForm(false);
  }

  return (
    <Container className="py-10">
      <h1 className="font-display text-5xl">My Account</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <AccountNav />

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Addresses</h2>
            <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Cancel" : "+ Add Address"}
            </Button>
          </div>

          {isLoading && <PageSpinner />}

          {showForm && (
            <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-ink/10 p-5 sm:grid-cols-2">
              <Field label="Label" htmlFor="label">
                <Input id="label" value={form.label} onChange={(e) => setForm((a) => ({ ...a, label: e.target.value }))} />
              </Field>
              <Field label="Full Name" htmlFor="fullName">
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm((a) => ({ ...a, fullName: e.target.value }))}
                />
              </Field>
              <Field label="Phone" htmlFor="phone">
                <Input id="phone" value={form.phone} onChange={(e) => setForm((a) => ({ ...a, phone: e.target.value }))} />
              </Field>
              <Field label="Address Line 1" htmlFor="line1">
                <Input id="line1" value={form.line1} onChange={(e) => setForm((a) => ({ ...a, line1: e.target.value }))} />
              </Field>
              <Field label="City" htmlFor="city">
                <Input id="city" value={form.city} onChange={(e) => setForm((a) => ({ ...a, city: e.target.value }))} />
              </Field>
              <Field label="Governorate" htmlFor="governorate">
                <Input
                  id="governorate"
                  value={form.governorate}
                  onChange={(e) => setForm((a) => ({ ...a, governorate: e.target.value }))}
                />
              </Field>
              <div className="sm:col-span-2">
                <Button onClick={handleCreate} disabled={createAddress.isPending}>
                  Save Address
                </Button>
              </div>
            </div>
          )}

          <ul className="space-y-3">
            {addresses?.map((address) => (
              <li key={address.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 p-4">
                <div className="text-sm">
                  <p className="font-semibold">
                    {address.label} {address.isDefault && <span className="text-brand-500">· Default</span>}
                  </p>
                  <p className="text-ink/60">
                    {address.fullName} — {address.line1}, {address.city}, {address.governorate}
                  </p>
                </div>
                <button
                  onClick={() => deleteAddress.mutate(address.id)}
                  className="text-sm font-semibold text-ink/40 hover:text-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
            {addresses?.length === 0 && !showForm && <p className="text-sm text-ink/50">No saved addresses yet.</p>}
          </ul>
        </div>
      </div>
    </Container>
  );
}

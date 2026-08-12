import { useEffect, useState } from "react";
import { useStoreSettings, useUpdateStoreSettings } from "./api";
import { Field, Input, PrimaryButton } from "../../components/form";
import { ApiError } from "../../lib/api-client";

export function PricingSettingsPanel() {
  const { data: settings, isLoading } = useStoreSettings();
  const updateSettings = useUpdateStoreSettings();

  const [surcharge, setSurcharge] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) setSurcharge(settings.customizationSurchargeEgp);
  }, [settings]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await updateSettings.mutateAsync({ customizationSurchargeEgp: surcharge });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save pricing settings.");
    }
  };

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4">
      <h2 className="mb-1 text-base font-semibold">Pricing</h2>
      <p className="mb-4 text-sm text-ink/60">
        Customers pay this on top of the product price for every element they add in the designer -- each text
        block, each uploaded image, and each design library pick, across both sides.
      </p>

      {isLoading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <Field label="Customization surcharge (EGP per element)">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={surcharge}
              onChange={(e) => setSurcharge(Number(e.target.value))}
              className="w-48"
              required
            />
          </Field>
          <PrimaryButton type="submit" disabled={updateSettings.isPending}>
            Save
          </PrimaryButton>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {saved && !error && <p className="mt-2 text-sm text-emerald-600">Saved.</p>}
    </section>
  );
}

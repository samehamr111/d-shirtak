import { useState, type FormEvent } from "react";
import type { ProductDetailDto } from "@d-shirtak/shared";
import { useAddVariant, useRemoveVariant } from "./api";
import { DataTable } from "../../components/DataTable";
import { Field, Input, PrimaryButton, Select, DangerButton } from "../../components/form";
import { ApiError } from "../../lib/api-client";

interface ProductVariantsSectionProps {
  productId: string;
  product: ProductDetailDto;
}

export function ProductVariantsSection({ productId, product }: ProductVariantsSectionProps) {
  const addVariant = useAddVariant(productId);
  const removeVariant = useRemoveVariant(productId);

  const [colorId, setColorId] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [sku, setSku] = useState("");
  const [stockQuantity, setStockQuantity] = useState(0);
  const [priceOverride, setPriceOverride] = useState("");
  const [error, setError] = useState<string | null>(null);

  const colorName = (id: string) => product.colors.find((c) => c.colorId === id)?.color.name ?? id;
  const sizeName = (id: string) => product.sizes.find((s) => s.sizeId === id)?.size.name ?? id;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!colorId || !sizeId || !sku) {
      setError("Color, size, and SKU are required.");
      return;
    }
    try {
      await addVariant.mutateAsync({
        colorId,
        sizeId,
        sku,
        stockQuantity,
        priceOverride: priceOverride ? Number(priceOverride) : undefined,
      });
      setColorId("");
      setSizeId("");
      setSku("");
      setStockQuantity(0);
      setPriceOverride("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add variant.");
    }
  };

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4">
      <h2 className="mb-3 text-base font-semibold">Variants &amp; stock</h2>

      <DataTable
        rowKey={(row) => row.id}
        rows={product.variants}
        emptyMessage="No variants added yet."
        columns={[
          { header: "Color", render: (row) => colorName(row.colorId) },
          { header: "Size", render: (row) => sizeName(row.sizeId) },
          { header: "SKU", render: (row) => row.sku },
          { header: "Stock", render: (row) => row.stockQuantity },
          { header: "Price", render: (row) => `EGP ${row.price.toFixed(2)}` },
          {
            header: "",
            render: (row) => (
              <DangerButton onClick={() => removeVariant.mutate(row.id)} disabled={removeVariant.isPending}>
                Remove
              </DangerButton>
            ),
          },
        ]}
      />

      <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3 border-t border-ink/10 pt-4">
        <Field label="Color">
          <Select value={colorId} onChange={(e) => setColorId(e.target.value)} required>
            <option value="" disabled>
              Select…
            </option>
            {product.colors.map((c) => (
              <option key={c.colorId} value={c.colorId}>
                {c.color.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Size">
          <Select value={sizeId} onChange={(e) => setSizeId(e.target.value)} required>
            <option value="" disabled>
              Select…
            </option>
            {product.sizes.map((s) => (
              <option key={s.sizeId} value={s.sizeId}>
                {s.size.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="SKU">
          <Input value={sku} onChange={(e) => setSku(e.target.value)} required className="w-32" />
        </Field>
        <Field label="Stock quantity">
          <Input
            type="number"
            min="0"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(Number(e.target.value))}
            required
            className="w-28"
          />
        </Field>
        <Field label="Price override (EGP)">
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="optional"
            value={priceOverride}
            onChange={(e) => setPriceOverride(e.target.value)}
            className="w-32"
          />
        </Field>
        <PrimaryButton type="submit" disabled={addVariant.isPending}>
          Add variant
        </PrimaryButton>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {(product.colors.length === 0 || product.sizes.length === 0) && (
        <p className="mt-2 text-sm text-ink/50">Add at least one color and one size before creating variants.</p>
      )}
    </section>
  );
}

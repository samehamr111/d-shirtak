import { useState, type FormEvent } from "react";
import type { ProductDetailDto, ProductSizeInput } from "@d-shirtak/shared";
import { useSizes } from "../catalog/api";
import { useAddProductSize, useRemoveProductSize } from "./api";
import { DataTable } from "../../components/DataTable";
import { Field, Input, PrimaryButton, Select, DangerButton } from "../../components/form";
import { ApiError } from "../../lib/api-client";

interface ProductSizesSectionProps {
  productId: string;
  product: ProductDetailDto;
}

const MEASUREMENT_FIELDS: { key: keyof Omit<ProductSizeInput, "sizeId">; label: string }[] = [
  { key: "printAreaFrontWidthCm", label: "Front print area width (cm)" },
  { key: "printAreaFrontHeightCm", label: "Front print area height (cm)" },
  { key: "printAreaFrontOffsetXCm", label: "Front print area offset X (cm)" },
  { key: "printAreaFrontOffsetYCm", label: "Front print area offset Y (cm)" },
  { key: "printAreaBackWidthCm", label: "Back print area width (cm)" },
  { key: "printAreaBackHeightCm", label: "Back print area height (cm)" },
  { key: "printAreaBackOffsetXCm", label: "Back print area offset X (cm)" },
  { key: "printAreaBackOffsetYCm", label: "Back print area offset Y (cm)" },
  { key: "chestWidthCm", label: "Chest width (cm)" },
  { key: "lengthCm", label: "Garment length (cm)" },
  { key: "waistCm", label: "Waist width (cm)" },
];

const EMPTY_MEASUREMENTS: Omit<ProductSizeInput, "sizeId"> = {
  printAreaFrontWidthCm: 0,
  printAreaFrontHeightCm: 0,
  printAreaFrontOffsetXCm: 0,
  printAreaFrontOffsetYCm: 0,
  printAreaBackWidthCm: 0,
  printAreaBackHeightCm: 0,
  printAreaBackOffsetXCm: 0,
  printAreaBackOffsetYCm: 0,
  chestWidthCm: 0,
  lengthCm: 0,
  waistCm: 0,
};

export function ProductSizesSection({ productId, product }: ProductSizesSectionProps) {
  const { data: sizes } = useSizes();
  const addSize = useAddProductSize(productId);
  const removeSize = useRemoveProductSize(productId);

  const [sizeId, setSizeId] = useState("");
  const [measurements, setMeasurements] = useState(EMPTY_MEASUREMENTS);
  const [error, setError] = useState<string | null>(null);

  const availableSizes = (sizes ?? []).filter((s) => !product.sizes.some((ps) => ps.sizeId === s.id));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!sizeId) {
      setError("Pick a size.");
      return;
    }
    try {
      await addSize.mutateAsync({ sizeId, ...measurements });
      setSizeId("");
      setMeasurements(EMPTY_MEASUREMENTS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add size.");
    }
  };

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4">
      <h2 className="mb-3 text-base font-semibold">Sizes, print areas &amp; measurements</h2>

      <DataTable
        rowKey={(row) => row.sizeId}
        rows={product.sizes}
        emptyMessage="No sizes added yet."
        columns={[
          { header: "Size", render: (row) => row.size.name },
          {
            header: "Front print area",
            render: (row) =>
              `${row.printAreaFront.widthCm}×${row.printAreaFront.heightCm}cm @ (${row.printAreaFront.offsetXCm}, ${row.printAreaFront.offsetYCm})`,
          },
          {
            header: "Back print area",
            render: (row) =>
              `${row.printAreaBack.widthCm}×${row.printAreaBack.heightCm}cm @ (${row.printAreaBack.offsetXCm}, ${row.printAreaBack.offsetYCm})`,
          },
          { header: "Chest (cm)", render: (row) => row.chestWidthCm },
          { header: "Length (cm)", render: (row) => row.lengthCm },
          { header: "Waist (cm)", render: (row) => row.waistCm },
          {
            header: "",
            render: (row) => (
              <DangerButton onClick={() => removeSize.mutate(row.sizeId)} disabled={removeSize.isPending}>
                Remove
              </DangerButton>
            ),
          },
        ]}
      />

      <form onSubmit={handleSubmit} className="mt-4 border-t border-ink/10 pt-4">
        <div className="mb-3 max-w-xs">
          <Field label="Size">
            <Select value={sizeId} onChange={(e) => setSizeId(e.target.value)} required>
              <option value="" disabled>
                Select a size…
              </option>
              {availableSizes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MEASUREMENT_FIELDS.map(({ key, label }) => (
            <Field key={key} label={label}>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={measurements[key]}
                onChange={(e) => setMeasurements({ ...measurements, [key]: Number(e.target.value) })}
                required
              />
            </Field>
          ))}
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <PrimaryButton type="submit" disabled={addSize.isPending} className="mt-3">
          Add size
        </PrimaryButton>
      </form>
    </section>
  );
}

import { useState, type FormEvent } from "react";
import type { ProductDetailDto, ProductSizeInput } from "@d-shirtak/shared";
import { useSizes } from "../catalog/api";
import { useAddProductSize, useRemoveProductSize } from "./api";
import { DataTable } from "../../components/DataTable";
import { Field, Input, PrimaryButton, Select, DangerButton } from "../../components/form";
import { ApiError } from "../../lib/api-client";
import { PrintAreaEditor, type PrintAreaValue } from "./PrintAreaEditor";

interface ProductSizesSectionProps {
  productId: string;
  product: ProductDetailDto;
}

const BODY_MEASUREMENT_FIELDS: { key: keyof Pick<ProductSizeInput, "chestWidthCm" | "lengthCm" | "waistCm">; label: string }[] = [
  { key: "chestWidthCm", label: "Chest width (cm)" },
  { key: "lengthCm", label: "Garment length (cm)" },
  { key: "waistCm", label: "Waist width (cm)" },
];

const DEFAULT_PRINT_AREA: PrintAreaValue = { widthCm: 30, heightCm: 35, offsetXCm: 0, offsetYCm: 15 };

const EMPTY_MEASUREMENTS: Omit<ProductSizeInput, "sizeId"> = {
  printAreaFrontWidthCm: DEFAULT_PRINT_AREA.widthCm,
  printAreaFrontHeightCm: DEFAULT_PRINT_AREA.heightCm,
  printAreaFrontOffsetXCm: DEFAULT_PRINT_AREA.offsetXCm,
  printAreaFrontOffsetYCm: DEFAULT_PRINT_AREA.offsetYCm,
  printAreaBackWidthCm: DEFAULT_PRINT_AREA.widthCm,
  printAreaBackHeightCm: DEFAULT_PRINT_AREA.heightCm,
  printAreaBackOffsetXCm: DEFAULT_PRINT_AREA.offsetXCm,
  printAreaBackOffsetYCm: DEFAULT_PRINT_AREA.offsetYCm,
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
  const previewColor = product.colors[0];

  const frontPrintArea: PrintAreaValue = {
    widthCm: measurements.printAreaFrontWidthCm,
    heightCm: measurements.printAreaFrontHeightCm,
    offsetXCm: measurements.printAreaFrontOffsetXCm,
    offsetYCm: measurements.printAreaFrontOffsetYCm,
  };
  const backPrintArea: PrintAreaValue = {
    widthCm: measurements.printAreaBackWidthCm,
    heightCm: measurements.printAreaBackHeightCm,
    offsetXCm: measurements.printAreaBackOffsetXCm,
    offsetYCm: measurements.printAreaBackOffsetYCm,
  };

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
            render: (row) => `${row.printAreaFront.widthCm}×${row.printAreaFront.heightCm}cm, ${row.printAreaFront.offsetYCm}cm from top`,
          },
          {
            header: "Back print area",
            render: (row) => `${row.printAreaBack.widthCm}×${row.printAreaBack.heightCm}cm, ${row.printAreaBack.offsetYCm}cm from top`,
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
        {!previewColor && (
          <p className="mb-3 text-xs text-ink/50">
            Add a color with mockup photos above for a live preview here — the print area still works without one.
          </p>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <PrintAreaEditor
            label="Front print area"
            garmentType={product.garmentType}
            backgroundImageUrl={previewColor?.frontImageUrl}
            value={frontPrintArea}
            onChange={(next) =>
              setMeasurements((m) => ({
                ...m,
                printAreaFrontWidthCm: next.widthCm,
                printAreaFrontHeightCm: next.heightCm,
                printAreaFrontOffsetXCm: next.offsetXCm,
                printAreaFrontOffsetYCm: next.offsetYCm,
              }))
            }
          />
          <PrintAreaEditor
            label="Back print area"
            garmentType={product.garmentType}
            backgroundImageUrl={previewColor?.backImageUrl}
            value={backPrintArea}
            onChange={(next) =>
              setMeasurements((m) => ({
                ...m,
                printAreaBackWidthCm: next.widthCm,
                printAreaBackHeightCm: next.heightCm,
                printAreaBackOffsetXCm: next.offsetXCm,
                printAreaBackOffsetYCm: next.offsetYCm,
              }))
            }
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {BODY_MEASUREMENT_FIELDS.map(({ key, label }) => (
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

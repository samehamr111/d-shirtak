import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { ProductDetailDto } from "@d-shirtak/shared";
import { useColors } from "../catalog/api";
import { useAddProductColor, useRemoveProductColor, useUpdateProductColorModelImages } from "./api";
import { Field, PrimaryButton, Select, DangerButton, SecondaryButton } from "../../components/form";
import { ApiError } from "../../lib/api-client";
import { MockupUploadSlot } from "./MockupUploadSlot";
import { GeneratePromptModal } from "./GeneratePromptModal";
import { DesignImagePicker } from "./DesignImagePicker";
import { ModelShotPromptModal } from "./ModelShotPromptModal";

interface ProductColorsSectionProps {
  productId: string;
  product: ProductDetailDto;
}

function ModelImageUploadButton({
  label,
  onPick,
  disabled,
}: {
  label: string;
  onPick: (file: File) => void;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPick(file);
    e.target.value = "";
  };
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="text-xs font-medium text-brand-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
      >
        {label}
      </button>
    </>
  );
}

export function ProductColorsSection({ productId, product }: ProductColorsSectionProps) {
  const { data: colors } = useColors();
  const addColor = useAddProductColor(productId);
  const removeColor = useRemoveProductColor(productId);
  const updateModelImages = useUpdateProductColorModelImages(productId);

  const [colorId, setColorId] = useState("");
  const [front, setFront] = useState<Blob | null>(null);
  const [back, setBack] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const [modelShotColorId, setModelShotColorId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedDesignImageUrl, setSelectedDesignImageUrl] = useState<string | null>(null);

  const startModelShotFlow = (targetColorId: string) => {
    setModelShotColorId(targetColorId);
    setSelectedDesignImageUrl(null);
    setPickerOpen(true);
  };

  const uploadModelImage = (productColorId: string, side: "modelFront" | "modelBack", file: File) => {
    const form = new FormData();
    form.set(side, file, file.name);
    updateModelImages.mutate({ productColorId, form });
  };

  const availableColors = (colors ?? []).filter((c) => !product.colors.some((pc) => pc.colorId === c.id));
  const selectedColor = availableColors.find((c) => c.id === colorId);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!colorId || !front || !back) {
      setError("Pick a color and both mockup images.");
      return;
    }
    const form = new FormData();
    form.set("colorId", colorId);
    form.set("front", front, "front.png");
    form.set("back", back, "back.png");
    try {
      await addColor.mutateAsync(form);
      setColorId("");
      setFront(null);
      setBack(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to upload color mockups.");
    }
  };

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4">
      <h2 className="mb-3 text-base font-semibold">Colors &amp; mockups</h2>

      {product.colors.length === 0 ? (
        <p className="mb-4 text-sm text-ink/60">No colors added yet.</p>
      ) : (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {product.colors.map((pc) => (
            <div key={pc.id} className="rounded border border-ink/10 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-block h-4 w-4 rounded border border-ink/20" style={{ backgroundColor: pc.color.hexCode }} />
                <span className="text-sm font-medium">{pc.color.name}</span>
              </div>
              <div className="mb-2 flex gap-2">
                <img src={pc.frontImageUrl} alt={`${pc.color.name} front`} className="h-24 w-24 rounded border border-ink/10 object-cover" />
                <img src={pc.backImageUrl} alt={`${pc.color.name} back`} className="h-24 w-24 rounded border border-ink/10 object-cover" />
              </div>

              <div className="mb-2 border-t border-ink/10 pt-2">
                <p className="mb-1 text-xs font-semibold text-ink/70">Model shots</p>
                <div className="mb-1 flex gap-2">
                  {pc.modelFrontImageUrl ? (
                    <img src={pc.modelFrontImageUrl} alt={`${pc.color.name} model front`} className="h-16 w-16 rounded border border-ink/10 object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-ink/20 text-[10px] text-ink/40">
                      None
                    </div>
                  )}
                  {pc.modelBackImageUrl ? (
                    <img src={pc.modelBackImageUrl} alt={`${pc.color.name} model back`} className="h-16 w-16 rounded border border-ink/10 object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-ink/20 text-[10px] text-ink/40">
                      None
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <ModelImageUploadButton
                    label={pc.modelFrontImageUrl ? "Replace front" : "Upload front"}
                    disabled={updateModelImages.isPending}
                    onPick={(file) => uploadModelImage(pc.id, "modelFront", file)}
                  />
                  <ModelImageUploadButton
                    label={pc.modelBackImageUrl ? "Replace back" : "Upload back"}
                    disabled={updateModelImages.isPending}
                    onPick={(file) => uploadModelImage(pc.id, "modelBack", file)}
                  />
                  <button
                    type="button"
                    onClick={() => startModelShotFlow(pc.colorId)}
                    className="text-xs font-medium text-ink/70 hover:text-ink hover:underline"
                  >
                    Generate prompt…
                  </button>
                </div>
              </div>

              <DangerButton onClick={() => removeColor.mutate(pc.id)} disabled={removeColor.isPending}>
                Remove
              </DangerButton>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 border-t border-ink/10 pt-4">
        <Field label="Color">
          <Select value={colorId} onChange={(e) => setColorId(e.target.value)} required>
            <option value="" disabled>
              Select a color…
            </option>
            {availableColors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        <SecondaryButton type="button" disabled={!selectedColor} onClick={() => setShowPrompt(true)}>
          Generate image prompt
        </SecondaryButton>

        <MockupUploadSlot
          label="Front mockup"
          side="front"
          garmentType={product.garmentType}
          colorName={selectedColor?.name ?? "this color"}
          value={front}
          onChange={setFront}
        />
        <MockupUploadSlot
          label="Back mockup"
          side="back"
          garmentType={product.garmentType}
          colorName={selectedColor?.name ?? "this color"}
          value={back}
          onChange={setBack}
        />

        <PrimaryButton type="submit" disabled={addColor.isPending}>
          Add color
        </PrimaryButton>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {showPrompt && selectedColor && (
        <GeneratePromptModal
          productName={product.name}
          garmentType={product.garmentType}
          colorName={selectedColor.name}
          colorHex={selectedColor.hexCode}
          onClose={() => setShowPrompt(false)}
        />
      )}

      {pickerOpen && (
        <DesignImagePicker
          onSelect={(imageUrl) => {
            setSelectedDesignImageUrl(imageUrl);
            setPickerOpen(false);
          }}
          onClose={() => {
            setPickerOpen(false);
            setModelShotColorId(null);
          }}
        />
      )}

      {!pickerOpen && modelShotColorId && selectedDesignImageUrl && (() => {
        const targetColor = product.colors.find((c) => c.colorId === modelShotColorId);
        if (!targetColor) return null;
        return (
          <ModelShotPromptModal
            productName={product.name}
            garmentType={product.garmentType}
            colorName={targetColor.color.name}
            colorHex={targetColor.color.hexCode}
            designImageUrl={selectedDesignImageUrl}
            onClose={() => {
              setModelShotColorId(null);
              setSelectedDesignImageUrl(null);
            }}
          />
        );
      })()}
    </section>
  );
}

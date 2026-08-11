import { useRef, useState, type FormEvent } from "react";
import type { DesignAssetDto } from "@d-shirtak/shared";
import { useDesignCategories, useDeleteDesignAsset, useDesignAssets, useUploadDesignAsset } from "./api";
import { Field, Input, PrimaryButton, Select, DangerButton } from "../../components/form";
import { ApiError } from "../../lib/api-client";
import { ModelShotPromptModal } from "../products/ModelShotPromptModal";
import { ProductColorPicker, type ProductColorTarget } from "../products/ProductColorPicker";

interface ModelShotTarget extends ProductColorTarget {
  designImageUrl: string;
}

export function DesignAssetsPanel() {
  const { data: categories } = useDesignCategories();
  const { data: assets, isLoading } = useDesignAssets();
  const uploadAsset = useUploadDesignAsset();
  const deleteAsset = useDeleteDesignAsset();

  const [name, setName] = useState("");
  const [designCategoryId, setDesignCategoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justUploadedName, setJustUploadedName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [modelShotTarget, setModelShotTarget] = useState<ModelShotTarget | null>(null);

  const confirmGenerate = (asset: DesignAssetDto, target: ProductColorTarget) => {
    setModelShotTarget({ ...target, designImageUrl: asset.imageUrl });
    setGeneratingId(null);
  };

  const categoryName = (id: string) => categories?.find((c) => c.id === id)?.name ?? id;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setJustUploadedName(null);
    if (!file) {
      setError("Choose an image file.");
      return;
    }
    const form = new FormData();
    form.set("name", name);
    form.set("designCategoryId", designCategoryId);
    form.set("file", file);
    try {
      await uploadAsset.mutateAsync(form);
      setJustUploadedName(name);
      setName("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to upload design asset.");
    }
  };

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4">
      <h2 className="mb-3 text-base font-semibold">Design assets</h2>

      <form onSubmit={handleSubmit} className="mb-5 flex flex-wrap items-end gap-3 border-b border-ink/10 pb-5">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required className="w-40" />
        </Field>
        <Field label="Category">
          <Select value={designCategoryId} onChange={(e) => setDesignCategoryId(e.target.value)} required>
            <option value="" disabled>
              Select…
            </option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Image file">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            className="text-sm"
          />
        </Field>
        <PrimaryButton type="submit" disabled={uploadAsset.isPending}>
          {uploadAsset.isPending ? "Uploading…" : "Upload"}
        </PrimaryButton>
      </form>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {justUploadedName && !error && (
        <p className="mb-4 text-sm font-medium text-brand-600">
          Uploaded "{justUploadedName}" — look for it below (assets are sorted alphabetically, so it may not be first).
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : (assets ?? []).length === 0 ? (
        <p className="rounded border border-dashed border-ink/20 p-6 text-center text-sm text-ink/60">
          No design assets uploaded yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {assets?.map((asset) => (
            <div key={asset.id} className="rounded border border-ink/10 p-2">
              <img src={asset.imageUrl} alt={asset.name} className="mb-2 h-28 w-full rounded object-contain" />
              <p className="truncate text-sm font-medium">{asset.name}</p>
              <p className="mb-2 truncate text-xs text-ink/50">{categoryName(asset.designCategoryId)}</p>

              {generatingId === asset.id ? (
                <ProductColorPicker
                  onConfirm={(target) => confirmGenerate(asset, target)}
                  onCancel={() => setGeneratingId(null)}
                />
              ) : (
                <div className="flex flex-col items-start gap-1">
                  <button
                    type="button"
                    onClick={() => setGeneratingId(asset.id)}
                    className="text-xs font-medium text-brand-600 hover:underline"
                  >
                    Generate model shot
                  </button>
                  <DangerButton onClick={() => deleteAsset.mutate(asset.id)} disabled={deleteAsset.isPending}>
                    Delete
                  </DangerButton>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modelShotTarget && (
        <ModelShotPromptModal
          productName={modelShotTarget.productName}
          garmentType={modelShotTarget.garmentType}
          colorName={modelShotTarget.colorName}
          colorHex={modelShotTarget.colorHex}
          sizeName={modelShotTarget.sizeName}
          designImageUrl={modelShotTarget.designImageUrl}
          onClose={() => setModelShotTarget(null)}
        />
      )}
    </section>
  );
}

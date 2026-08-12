import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { DesignAssetDto } from "@d-shirtak/shared";
import {
  useAddDesignAssetModelShot,
  useDeleteDesignAsset,
  useDeleteDesignAssetModelShot,
  useDesignCategories,
  useDesignAssets,
  useUploadDesignAsset,
} from "./api";
import { Field, Input, PrimaryButton, Select, DangerButton } from "../../components/form";
import { ApiError } from "../../lib/api-client";
import { ModelShotPromptModal } from "../products/ModelShotPromptModal";
import { ProductColorPicker, type ProductColorTarget } from "../products/ProductColorPicker";

interface ModelShotTarget extends ProductColorTarget {
  designImageUrl: string;
}

function ModelShotUploadButton({ label, onPick, disabled }: { label: string; onPick: (file: File) => void; disabled: boolean }) {
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

export function DesignAssetsPanel() {
  const { data: categories } = useDesignCategories();
  const { data: assets, isLoading } = useDesignAssets();
  const uploadAsset = useUploadDesignAsset();
  const deleteAsset = useDeleteDesignAsset();
  const addModelShot = useAddDesignAssetModelShot();
  const deleteModelShot = useDeleteDesignAssetModelShot();

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

              <div className="mb-2 border-t border-ink/10 pt-2">
                <p className="mb-1 text-xs font-semibold text-ink/70">
                  Model shots {asset.modelShots.length > 0 && `(${asset.modelShots.length})`}
                </p>
                {asset.modelShots.length > 0 && (
                  <div className="mb-1.5 flex flex-wrap gap-1.5">
                    {asset.modelShots.map((shot) => (
                      <div key={shot.id} className="group relative">
                        <img
                          src={shot.imageUrl}
                          alt={`${asset.name} on a model`}
                          className="h-16 w-16 rounded border border-ink/10 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => deleteModelShot.mutate({ id: asset.id, shotId: shot.id })}
                          disabled={deleteModelShot.isPending}
                          title="Remove this model shot"
                          className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold leading-none text-white group-hover:flex"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <ModelShotUploadButton
                  label="Add model shot"
                  disabled={addModelShot.isPending}
                  onPick={(file) => {
                    const form = new FormData();
                    form.set("file", file, file.name);
                    addModelShot.mutate({ id: asset.id, form });
                  }}
                />
              </div>

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
                    Generate prompt…
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

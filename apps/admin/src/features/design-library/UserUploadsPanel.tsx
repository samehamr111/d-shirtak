import { useState } from "react";
import type { UserUploadDto } from "@d-shirtak/shared";
import { useDesignCategories, usePromoteUserUpload, useUserUploads } from "./api";
import { PrimaryButton, Select } from "../../components/form";
import { ApiError } from "../../lib/api-client";
import { ModelShotPromptModal } from "../products/ModelShotPromptModal";
import { ProductColorPicker, type ProductColorTarget } from "../products/ProductColorPicker";

interface ModelShotTarget extends ProductColorTarget {
  designImageUrl: string;
}

export function UserUploadsPanel() {
  const { data: uploads, isLoading } = useUserUploads();
  const { data: categories } = useDesignCategories();
  const promote = usePromoteUserUpload();

  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [designCategoryId, setDesignCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [modelShotTarget, setModelShotTarget] = useState<ModelShotTarget | null>(null);

  const startPromoting = (id: string, suggestedName: string) => {
    setGeneratingId(null);
    setPromotingId(id);
    setName(suggestedName);
    setDesignCategoryId("");
    setError(null);
  };

  const confirmPromote = async (id: string) => {
    if (!designCategoryId) {
      setError("Choose a category.");
      return;
    }
    setError(null);
    try {
      await promote.mutateAsync({ id, input: { name, designCategoryId } });
      setPromotingId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to promote this upload.");
    }
  };

  const startGenerating = (upload: UserUploadDto) => {
    setPromotingId(null);
    setGeneratingId(upload.id);
  };

  const confirmGenerate = (upload: UserUploadDto, target: ProductColorTarget) => {
    setModelShotTarget({ ...target, designImageUrl: upload.imageUrl });
    setGeneratingId(null);
  };

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4">
      <h2 className="mb-1 text-base font-semibold">Customer &amp; admin uploads</h2>
      <p className="mb-4 text-sm text-ink/60">
        Raw images uploaded in the storefront designer (or attached here for a model-shot prompt), kept around in case
        one is worth promoting into the curated library below.
      </p>

      {isLoading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : (uploads ?? []).length === 0 ? (
        <p className="rounded border border-dashed border-ink/20 p-6 text-center text-sm text-ink/60">
          No uploads tracked yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {uploads?.map((upload) => (
            <div key={upload.id} className="rounded border border-ink/10 p-2">
              <img
                src={upload.imageUrl}
                alt={upload.originalName ?? "Upload"}
                className="mb-2 h-28 w-full rounded object-contain"
              />
              <p className="truncate text-xs text-ink/50">{upload.uploaderEmail}</p>
              <p className="mb-2 truncate text-xs text-ink/40">{new Date(upload.createdAt).toLocaleDateString()}</p>

              {promotingId === upload.id ? (
                <div className="space-y-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="w-full rounded border border-ink/20 px-2 py-1 text-xs"
                  />
                  <Select
                    value={designCategoryId}
                    onChange={(e) => setDesignCategoryId(e.target.value)}
                    className="w-full text-xs"
                  >
                    <option value="" disabled>
                      Category…
                    </option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                  <div className="flex gap-2">
                    <PrimaryButton
                      type="button"
                      onClick={() => confirmPromote(upload.id)}
                      disabled={promote.isPending}
                      className="text-xs"
                    >
                      Confirm
                    </PrimaryButton>
                    <button
                      type="button"
                      onClick={() => setPromotingId(null)}
                      className="text-xs text-ink/50 hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-600">{error}</p>}
                </div>
              ) : generatingId === upload.id ? (
                <ProductColorPicker
                  onConfirm={(target) => confirmGenerate(upload, target)}
                  onCancel={() => setGeneratingId(null)}
                />
              ) : (
                <div className="flex flex-col items-start gap-1">
                  <button
                    type="button"
                    onClick={() => startGenerating(upload)}
                    className="text-xs font-medium text-brand-600 hover:underline"
                  >
                    Generate model shot
                  </button>
                  {upload.promoted ? (
                    <p className="text-xs font-medium text-ink/40">In library</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startPromoting(upload.id, upload.originalName ?? "Untitled")}
                      className="text-xs font-medium text-ink/70 hover:text-ink hover:underline"
                    >
                      Promote to library
                    </button>
                  )}
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

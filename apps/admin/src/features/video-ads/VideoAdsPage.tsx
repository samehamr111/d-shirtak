import { useMemo, useState } from "react";
import type { CreateVideoJobInput, VideoJobDto } from "@d-shirtak/shared";
import { useProducts } from "../products/api";
import { useDesignAssets } from "../design-library/api";
import { useCreateVideoJob, useVideoJobs } from "./api";
import { PageHeader } from "../../components/PageHeader";
import { Field, PrimaryButton, Select, Textarea } from "../../components/form";
import { ApiError, api } from "../../lib/api-client";

/** Same Egyptian-colloquial ad-copy template as apps/api's ad-script.service.ts, computed
 *  client-side purely as text -- no network round-trip needed just to pre-fill a textarea the
 *  admin is going to edit anyway. */
function buildAdScriptPreview(input: {
  productName: string;
  basePrice: number;
  colorNames: string[];
  garmentType: "TEE" | "HOODIE";
}): string {
  const garmentWord = input.garmentType === "HOODIE" ? "الهودي" : "التيشيرت";
  const colorsPhrase = input.colorNames.length > 0 ? `متوفر بألوان ${input.colorNames.join("، ")}.` : "";
  return [
    `قدّملكم ${garmentWord} ${input.productName}.`,
    `تصميم مريح وجودة عالية تناسب يومك.`,
    colorsPhrase,
    `وتقدر كمان تصمم طباعتك الخاصة وتخلي القطعة بأسلوبك.`,
    `السعر بس ${input.basePrice} جنيه.`,
    `اطلب دلوقتي من D-Shirtak، وهيوصلك لحد باب البيت.`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function VideoAdsPage() {
  const { data: products } = useProducts();
  const { data: designAssets } = useDesignAssets();
  const { data: jobs, isLoading: jobsLoading } = useVideoJobs();
  const createJob = useCreateVideoJob();

  const [mode, setMode] = useState<"product" | "upload">("product");
  const [productId, setProductId] = useState("");
  const [colorId, setColorId] = useState("");
  const [designAssetId, setDesignAssetId] = useState("");
  const [scriptText, setScriptText] = useState("");
  const [scriptTouched, setScriptTouched] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const product = products?.find((p) => p.id === productId);

  const autoScript = useMemo(() => {
    if (!product) return "";
    const color = product.colors.find((c) => c.colorId === colorId);
    return buildAdScriptPreview({
      productName: product.name,
      basePrice: product.basePrice,
      colorNames: color ? [color.color.name] : [],
      garmentType: product.garmentType,
    });
  }, [product, colorId]);

  const effectiveScript = scriptTouched ? scriptText : autoScript;

  const handleProductChange = (id: string) => {
    setProductId(id);
    setColorId("");
    setScriptTouched(false);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.set("file", file, file.name);
        const uploaded = await api.postForm<{ imageUrl: string }>("/user-uploads", form);
        urls.push(uploaded.imageUrl);
      }
      setUploadedImageUrls((prev) => [...prev, ...urls]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const canSubmit =
    effectiveScript.trim().length > 0 &&
    (mode === "product" ? Boolean(productId && colorId) : uploadedImageUrls.length > 0);

  const handleSubmit = async () => {
    setError(null);
    const input: CreateVideoJobInput =
      mode === "product"
        ? { productId, colorId, designAssetId: designAssetId || undefined, scriptText: effectiveScript }
        : { imageUrls: uploadedImageUrls, scriptText: effectiveScript };
    try {
      await createJob.mutateAsync(input);
      setUploadedImageUrls([]);
      setScriptTouched(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to start the video job.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Video Ads"
        description="Generate a vertical (Reels/TikTok) commercial with Arabic narration from a product's images, or your own uploads."
      />

      <section className="mb-6 space-y-4 rounded-lg border border-ink/10 bg-white p-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("product")}
            className={`rounded px-3 py-1.5 text-sm font-medium ${mode === "product" ? "bg-brand-500 text-white" : "text-ink/60 hover:bg-ink/5"}`}
          >
            Use a product
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`rounded px-3 py-1.5 text-sm font-medium ${mode === "upload" ? "bg-brand-500 text-white" : "text-ink/60 hover:bg-ink/5"}`}
          >
            Upload my own image(s)
          </button>
        </div>

        {mode === "product" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Product">
              <Select value={productId} onChange={(e) => handleProductChange(e.target.value)}>
                <option value="" disabled>
                  Select…
                </option>
                {products?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Color">
              <Select value={colorId} onChange={(e) => setColorId(e.target.value)} disabled={!product}>
                <option value="" disabled>
                  Select…
                </option>
                {product?.colors.map((c) => (
                  <option key={c.colorId} value={c.colorId}>
                    {c.color.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Print / design (optional)">
              <Select value={designAssetId} onChange={(e) => setDesignAssetId(e.target.value)} disabled={!product}>
                <option value="">None</option>
                {designAssets?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={(e) => handleUpload(e.target.files)}
              disabled={uploading}
              className="text-sm"
            />
            {uploadedImageUrls.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {uploadedImageUrls.map((url) => (
                  <img key={url} src={url} alt="" className="h-20 w-20 rounded border border-ink/10 object-cover" />
                ))}
              </div>
            )}
          </div>
        )}

        <Field label="Script (Arabic — edit freely before generating)">
          <Textarea
            dir="rtl"
            rows={5}
            value={effectiveScript}
            onChange={(e) => {
              setScriptText(e.target.value);
              setScriptTouched(true);
            }}
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <PrimaryButton type="button" onClick={handleSubmit} disabled={!canSubmit || createJob.isPending}>
          {createJob.isPending ? "Starting…" : "Generate video"}
        </PrimaryButton>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-4">
        <h2 className="mb-3 text-base font-semibold">Jobs</h2>
        {jobsLoading ? (
          <p className="text-sm text-ink/60">Loading…</p>
        ) : (jobs ?? []).length === 0 ? (
          <p className="rounded border border-dashed border-ink/20 p-6 text-center text-sm text-ink/60">
            No videos generated yet.
          </p>
        ) : (
          <div className="space-y-3">
            {jobs?.map((job) => (
              <VideoJobRow key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const JOB_STATUS_STYLES: Record<VideoJobDto["status"], string> = {
  PENDING: "bg-amber-100 text-amber-800",
  RENDERING: "bg-sky-100 text-sky-800",
  DONE: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
};

function VideoJobStatusBadge({ status }: { status: VideoJobDto["status"] }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${JOB_STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

function VideoJobRow({ job }: { job: VideoJobDto }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-ink/10 p-3">
      <div>
        <p className="text-sm font-medium">{job.productName}</p>
        <p className="text-xs text-ink/50">{new Date(job.createdAt).toLocaleString()}</p>
        {job.status === "FAILED" && job.errorMessage && (
          <p className="mt-1 text-xs text-red-600">{job.errorMessage}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <VideoJobStatusBadge status={job.status} />
        {job.status === "DONE" && job.videoUrl && (
          <>
            <video src={job.videoUrl} controls className="h-24 w-auto rounded" />
            <a
              href={job.videoUrl}
              download
              className="rounded border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/5"
            >
              Download
            </a>
          </>
        )}
      </div>
    </div>
  );
}

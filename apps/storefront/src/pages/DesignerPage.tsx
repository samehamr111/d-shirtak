import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import type { FontDto } from "@d-shirtak/shared";
import type { TextStyle } from "../features/designer/SideCanvas";
import { SideCanvas, type SideCanvasHandle } from "../features/designer/SideCanvas";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../features/designer/canvas-constants";
import { useLoadWebFonts } from "../features/designer/use-load-web-fonts";
import { useDesignAssets, useDesignCategories, useFonts, useProduct, useStoreSettings } from "../features/catalog/catalog-api";
import { useSaveDesign } from "../features/designer/design-api";
import { useAddToCart } from "../features/cart/cart-api";
import { useAuth } from "../features/auth/auth-context";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { PageSpinner } from "../components/ui/Spinner";
import { api, ApiError } from "../lib/api-client";

type Side = "front" | "back";
type Tab = "garment" | "design" | "text";

const DEFAULT_TEXT_STYLE: TextStyle = { fontFamily: "sans-serif", fontSize: 48, fill: "#111111" };
const SWATCH_COLORS = ["#111111", "#ffffff", "#dc2626", "#1e3a8a", "#f8471a", "#16a34a", "#facc15"];
const AR_PREVIEW_PLACEHOLDER = "تصميمك";

function ShirtIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 4 3 8l2.5 3L8 9.5V21h8V9.5L18.5 11 21 8l-5-4-1.5 1.5a3 3 0 0 1-5 0Z" strokeLinejoin="round" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m3 16 5-5 4 4 3-3 6 6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
function FlipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 2.1 21 6l-4 3.9M3 11V9a4 4 0 0 1 4-4h14M7 21.9 3 18l4-3.9M21 13v2a4 4 0 0 1-4 4H3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RailButton({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
        active ? "bg-brand-500 text-white" : "text-paper/45 hover:bg-white/10 hover:text-paper"
      }`}
    >
      {children}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink/50">{children}</p>;
}

export function DesignerPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useAuth();
  const { data: product, isLoading } = useProduct(slug);
  const { data: storeSettings } = useStoreSettings();
  const { data: fonts } = useFonts();
  const { data: designCategories } = useDesignCategories();
  const [activeDesignCategoryId, setActiveDesignCategoryId] = useState<string | undefined>(undefined);
  const { data: designAssets } = useDesignAssets(activeDesignCategoryId);
  useLoadWebFonts(fonts);
  const saveDesign = useSaveDesign();
  const addToCart = useAddToCart();

  const [colorId, setColorId] = useState<string | null>(null);
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [side, setSide] = useState<Side>("front");
  const [tab, setTab] = useState<Tab>("garment");
  const [textDraft, setTextDraft] = useState("");
  const [textStyle, setTextStyle] = useState<TextStyle>(DEFAULT_TEXT_STYLE);
  const [selection, setSelection] = useState<{ isText: boolean; style?: TextStyle } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const frontRef = useRef<SideCanvasHandle>(null);
  const backRef = useRef<SideCanvasHandle>(null);
  const activeCanvasRef = side === "front" ? frontRef : backRef;

  useEffect(() => setSelection(null), [side]);

  useEffect(() => {
    if (fonts && fonts.length > 0) {
      setTextStyle((prev) => (prev.fontFamily === "sans-serif" ? { ...prev, fontFamily: fonts[0]!.fontFamily } : prev));
    }
  }, [fonts]);

  const activeColorId = colorId ?? product?.colors[0]?.colorId ?? null;
  const activeSizeId = sizeId ?? product?.sizes[0]?.sizeId ?? null;
  const activeColor = product?.colors.find((c) => c.colorId === activeColorId);
  const activeSize = product?.sizes.find((s) => s.sizeId === activeSizeId);
  const variant = useMemo(
    () => product?.variants.find((v) => v.colorId === activeColorId && v.sizeId === activeSizeId) ?? null,
    [product, activeColorId, activeSizeId],
  );

  const enFonts = fonts?.filter((f) => f.language === "EN") ?? [];
  const arFonts = fonts?.filter((f) => f.language === "AR") ?? [];

  if (isLoading) return <PageSpinner />;
  if (!product) {
    return <Container className="py-20 text-center text-ink/60">Couldn't find that product.</Container>;
  }
  if (!product.isCustomizable) {
    return <Container className="py-20 text-center text-ink/60">This product can't be customized.</Container>;
  }

  function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") activeCanvasRef.current?.addImageFromUrl(reader.result, false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";

    // Track the raw upload server-side so a good one can later be promoted into the curated
    // design library. Fire-and-forget: never blocks or interrupts the canvas above.
    const form = new FormData();
    form.set("file", file, file.name);
    api.postForm("/user-uploads", form).catch(() => {});
  }

  function applyStylePatch(patch: Partial<TextStyle>) {
    setTextStyle((prev) => ({ ...prev, ...patch }));
    if (selection?.isText) activeCanvasRef.current?.applyTextStyle(patch);
  }

  function useFont(font: FontDto) {
    const style = { ...textStyle, fontFamily: font.fontFamily };
    setTextStyle(style);
    if (selection?.isText) {
      activeCanvasRef.current?.applyTextStyle({ fontFamily: font.fontFamily });
    } else {
      activeCanvasRef.current?.addText(textDraft.trim() || "YOUR TEXT", style);
    }
  }

  function fontPreviewText(font: FontDto): string {
    if (textDraft.trim()) return textDraft;
    return font.language === "AR" ? AR_PREVIEW_PLACEHOLDER : "Your text";
  }

  async function handleAddToCart() {
    if (!variant) return;
    if (status !== "authenticated") {
      navigate("/login", { state: { from: location } });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let frontDesignId: string | undefined;
      let backDesignId: string | undefined;

      if (frontRef.current?.hasContent()) {
        const design = await saveDesign.mutateAsync({
          productVariantId: variant.id,
          side: "FRONT",
          canvasJson: frontRef.current.exportJson(),
          previewImageDataUrl: frontRef.current.exportPng(),
        });
        frontDesignId = design.id;
      }
      if (backRef.current?.hasContent()) {
        const design = await saveDesign.mutateAsync({
          productVariantId: variant.id,
          side: "BACK",
          canvasJson: backRef.current.exportJson(),
          previewImageDataUrl: backRef.current.exportPng(),
        });
        backDesignId = design.id;
      }

      await addToCart.mutateAsync({ productVariantId: variant.id, quantity: 1, frontDesignId, backDesignId });
      navigate("/cart");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your design. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="py-8">
      <Link to={`/shop/${product.slug}`} className="text-sm font-semibold text-ink/50 hover:text-ink">
        ← Back to {product.name}
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl">Design your {product.name}</h1>
        <div className="text-right">
          {variant && <p className="text-lg font-semibold">EGP {variant.price.toFixed(0)}</p>}
          {storeSettings && (
            <p className="text-xs text-ink/50">+ EGP {storeSettings.customizationSurchargeEgp.toFixed(0)} per printed side</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:grid lg:grid-cols-[64px_320px_1fr] lg:items-start lg:gap-6">
        {/* Canvas — first in the DOM so it appears first on mobile */}
        <div className="lg:col-start-3 lg:row-start-1">
          <div
            className="relative mx-auto w-full max-w-md touch-none overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-pop lg:max-w-none"
            style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
          >
            <SideCanvas
              ref={frontRef}
              visible={side === "front"}
              backgroundUrl={activeColor?.frontImageUrl}
              printArea={activeSize?.printAreaFront}
              onSelectionChange={setSelection}
            />
            <SideCanvas
              ref={backRef}
              visible={side === "back"}
              backgroundUrl={activeColor?.backImageUrl}
              printArea={activeSize?.printAreaBack}
              onSelectionChange={setSelection}
            />
            <button
              type="button"
              onClick={() => setSide((s) => (s === "front" ? "back" : "front"))}
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-ink shadow-pop backdrop-blur transition-transform hover:scale-105"
            >
              <FlipIcon />
              {side === "front" ? "Front" : "Back"}
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-ink/40">
            The dashed line marks the printable area for size {activeSize?.size.name ?? "—"}.
          </p>

          {selection && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-brand-500/30 bg-brand-50 p-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">Selected</span>
              <button
                onClick={() => activeCanvasRef.current?.bringForward()}
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-sm"
              >
                Forward
              </button>
              <button
                onClick={() => activeCanvasRef.current?.sendBackward()}
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-sm"
              >
                Backward
              </button>
              <button
                onClick={() => {
                  activeCanvasRef.current?.deleteSelected();
                  setSelection(null);
                }}
                className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white"
              >
                Delete
              </button>
            </div>
          )}

          <div className="sticky bottom-0 z-10 -mx-4 mt-4 border-t border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            {error && <p className="mb-2 text-sm font-medium text-red-600">{error}</p>}
            <Button size="lg" className="w-full" disabled={!variant || busy} onClick={handleAddToCart}>
              {busy ? "Saving your design…" : `Add to Cart — EGP ${(variant?.price ?? product.basePrice).toFixed(0)}`}
            </Button>
          </div>
        </div>

        {/* Icon rail */}
        <div className="flex flex-row gap-2 rounded-2xl bg-ink p-2 lg:col-start-1 lg:row-start-1 lg:flex-col">
          <RailButton active={tab === "garment"} label="Garment" onClick={() => setTab("garment")}>
            <ShirtIcon />
          </RailButton>
          <RailButton active={tab === "design"} label="Designs" onClick={() => setTab("design")}>
            <ImageIcon />
          </RailButton>
          <RailButton active={tab === "text"} label="Text" onClick={() => setTab("text")}>
            <span className="font-display text-xl leading-none">T</span>
          </RailButton>
        </div>

        {/* Tool panel */}
        <div className="rounded-2xl bg-brand-200/70 p-4 lg:col-start-2 lg:row-start-1">
          {tab === "garment" && (
            <div className="space-y-5">
              <div>
                <Label>Choose your color</Label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.colorId}
                      onClick={() => setColorId(c.colorId)}
                      title={c.color.name}
                      className={`h-9 w-9 rounded-full border-2 ring-1 ring-ink/10 transition-transform ${
                        activeColorId === c.colorId ? "scale-110 border-ink" : "border-white"
                      }`}
                      style={{ backgroundColor: c.color.hexCode }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label>Choose your size</Label>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((s) => (
                    <button
                      key={s.sizeId}
                      onClick={() => setSizeId(s.sizeId)}
                      className={`h-9 min-w-9 rounded-lg border px-2.5 text-sm font-semibold ${
                        activeSizeId === s.sizeId ? "border-ink bg-ink text-paper" : "border-ink/20 bg-white/60 hover:border-ink"
                      }`}
                    >
                      {s.size.name}
                    </button>
                  ))}
                </div>
              </div>
              {activeSize && (
                <div className="rounded-xl bg-white/60 p-3 text-xs text-ink/70">
                  <p className="mb-1 font-semibold text-ink">Measurements ({activeSize.size.name})</p>
                  <ul className="grid grid-cols-3 gap-1">
                    <li>Chest {activeSize.chestWidthCm}cm</li>
                    <li>Length {activeSize.lengthCm}cm</li>
                    <li>Waist {activeSize.waistCm}cm</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {tab === "design" && (
            <div className="space-y-4">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/25 bg-white/50 px-4 py-3 text-center text-sm font-semibold text-ink hover:bg-white/80">
                Can't find what you're looking for? Upload your own
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleUploadFile} />
              </label>

              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveDesignCategoryId(undefined)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                      !activeDesignCategoryId ? "bg-ink text-paper" : "bg-white/60 text-ink/60"
                    }`}
                  >
                    All
                  </button>
                  {designCategories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveDesignCategoryId(cat.id)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                        activeDesignCategoryId === cat.id ? "bg-ink text-paper" : "bg-white/60 text-ink/60"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {designAssets?.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => activeCanvasRef.current?.addImageFromUrl(asset.imageUrl, true)}
                      className="aspect-square overflow-hidden rounded-xl border border-ink/10 bg-white/70 p-2 transition-transform hover:scale-105"
                      title={asset.name}
                    >
                      <img src={asset.imageUrl} alt={asset.name} className="h-full w-full object-contain" />
                    </button>
                  ))}
                  {designAssets?.length === 0 && <p className="col-span-3 text-sm text-ink/50">No designs here yet.</p>}
                </div>
              </div>
            </div>
          )}

          {tab === "text" && (
            <div className="space-y-4">
              <div>
                <Label>Your text</Label>
                <input
                  value={textDraft}
                  onChange={(e) => setTextDraft(e.target.value)}
                  placeholder="Type here…"
                  dir="auto"
                  className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Size</Label>
                  <input
                    type="range"
                    min={16}
                    max={160}
                    value={textStyle.fontSize}
                    onChange={(e) => applyStylePatch({ fontSize: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <input
                    type="color"
                    value={textStyle.fill}
                    onChange={(e) => applyStylePatch({ fill: e.target.value })}
                    className="h-9 w-full cursor-pointer rounded-lg border border-ink/15"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SWATCH_COLORS.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => applyStylePatch({ fill: hex })}
                    className="h-5 w-5 rounded-full border border-ink/10"
                    style={{ backgroundColor: hex }}
                    aria-label={`Quick color ${hex}`}
                  />
                ))}
              </div>

              <div>
                <Label>{selection?.isText ? "Change font" : "Pick a font to add your text"}</Label>
                <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                  {enFonts.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => useFont(font)}
                      className="flex w-full items-center justify-between rounded-xl bg-white/70 px-3 py-2.5 text-left hover:bg-white"
                    >
                      <span
                        className="truncate text-lg text-ink"
                        style={{ fontFamily: font.fontFamily, color: textStyle.fill }}
                      >
                        {fontPreviewText(font)}
                      </span>
                      <span className="ml-2 shrink-0 rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase text-paper">
                        {font.name}
                      </span>
                    </button>
                  ))}
                  {arFonts.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => useFont(font)}
                      className="flex w-full items-center justify-between rounded-xl bg-white/70 px-3 py-2.5 text-left hover:bg-white"
                      dir="rtl"
                    >
                      <span
                        className="truncate text-lg text-ink"
                        style={{ fontFamily: font.fontFamily, color: textStyle.fill }}
                      >
                        {fontPreviewText(font)}
                      </span>
                      <span className="mr-2 shrink-0 rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase text-paper" dir="ltr">
                        {font.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

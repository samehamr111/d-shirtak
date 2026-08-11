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
import { Sparkle } from "../components/ui/ShirtMark";
import { api } from "../lib/api-client";
import { describeError } from "../lib/errors";

type Side = "front" | "back";
type Tab = "garment" | "design" | "text";

const DEFAULT_TEXT_STYLE: TextStyle = { fontFamily: "sans-serif", fontSize: 48, fill: "#111111" };
const SWATCH_COLORS = ["#111111", "#ffffff", "#dc2626", "#1e3a8a", "#f8471a", "#16a34a", "#facc15"];
const AR_PREVIEW_PLACEHOLDER = "تصميمك";

function ShirtIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 4 3 8l2.5 3L8 9.5V21h8V9.5L18.5 11 21 8l-5-4-1.5 1.5a3 3 0 0 1-5 0Z" strokeLinejoin="round" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m3 16 5-5 4 4 3-3 6 6" strokeLinejoin="round" strokeLinecap="round" />
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
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
        active ? "bg-brand-500 text-ink" : "text-white/45 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest">{children}</p>;
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
      if (typeof reader.result === "string") {
        activeCanvasRef.current
          ?.addImageFromUrl(reader.result, false)
          .catch(() => setError("Couldn't add that image to the canvas. Try a different file."));
      }
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
      setError(describeError(err, "Couldn't save your design. Try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/[.07] pb-4.5">
        <div>
          <Link to={`/shop/${product.slug}`} className="text-[12.5px] font-medium text-ink/50 hover:text-ink">
            ← Back to {product.name}
          </Link>
          <h1 className="mt-2.5 font-display text-4xl tracking-wide sm:text-5xl">DESIGN YOUR {product.name.toUpperCase()}</h1>
        </div>
        <div className="text-right">
          {variant && <p className="font-display text-4xl text-brand-700">EGP {variant.price.toFixed(0)}</p>}
          {storeSettings && (
            <p className="mt-1 font-mono text-[11px] text-ink/45">
              EGP {product.basePrice.toFixed(0)} base · +EGP {storeSettings.customizationSurchargeEgp.toFixed(0)} per printed side
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[20px] border border-ink/[.08] bg-white shadow-[0_2px_10px_rgba(0,0,0,.08)]">
        <div className="grid lg:grid-cols-[64px_320px_1fr]">
          {/* Canvas — first in the DOM so it appears first on mobile */}
          <div className="relative flex flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_50%_36%,#f6f5f0_0%,#e9e7e1_100%)] p-9 lg:col-start-3 lg:row-start-1">
            <div className="relative">
              <div
                className="relative w-full max-w-md touch-none overflow-hidden rounded-2xl bg-white shadow-[0_24px_42px_rgba(4,4,4,.15)] lg:max-w-[420px]"
                style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
              >
                <SideCanvas
                  ref={frontRef}
                  visible={side === "front"}
                  backgroundUrl={activeColor?.frontImageUrl}
                  printArea={activeSize?.printAreaFront}
                  onSelectionChange={setSelection}
                  onBackgroundError={() => setError("Couldn't load the garment image for this color. Try picking a different color or refreshing the page.")}
                />
                <SideCanvas
                  ref={backRef}
                  visible={side === "back"}
                  backgroundUrl={activeColor?.backImageUrl}
                  printArea={activeSize?.printAreaBack}
                  onSelectionChange={setSelection}
                  onBackgroundError={() => setError("Couldn't load the garment image for this color. Try picking a different color or refreshing the page.")}
                />
              </div>

              {selection && (
                <div className="absolute -top-[52px] left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-ink p-1.5 shadow-pop">
                  <button
                    onClick={() => activeCanvasRef.current?.bringForward()}
                    className="rounded-full px-3 py-2 text-[11.5px] font-medium text-white hover:bg-white/10"
                  >
                    Forward
                  </button>
                  <button
                    onClick={() => activeCanvasRef.current?.sendBackward()}
                    className="rounded-full px-3 py-2 text-[11.5px] font-medium text-white hover:bg-white/10"
                  >
                    Backward
                  </button>
                  <button
                    onClick={() => {
                      activeCanvasRef.current?.deleteSelected();
                      setSelection(null);
                    }}
                    className="rounded-full bg-brand-500 px-3 py-2 text-[11.5px] font-semibold text-ink"
                  >
                    Delete
                  </button>
                </div>
              )}

              <div className="absolute right-3.5 top-3.5 flex gap-1.5 rounded-full bg-white p-1.5 shadow-[0_6px_18px_rgba(0,0,0,.1)]">
                <button
                  onClick={() => setSide("front")}
                  className={`rounded-full px-4.5 py-2.5 text-xs font-semibold transition-colors ${
                    side === "front" ? "bg-ink text-paper" : "text-ink/55 hover:bg-ink/5"
                  }`}
                >
                  Front
                </button>
                <button
                  onClick={() => setSide("back")}
                  className={`rounded-full px-4.5 py-2.5 text-xs font-semibold transition-colors ${
                    side === "back" ? "bg-ink text-paper" : "text-ink/55 hover:bg-ink/5"
                  }`}
                >
                  Back
                </button>
              </div>
            </div>
            <span className="font-mono text-[10.5px] tracking-wide text-ink/42">
              DASHED LINE = REAL PRINTABLE AREA FOR SIZE {activeSize?.size.name ?? "—"}
            </span>
          </div>

          {/* Icon rail */}
          <div className="flex flex-row gap-2 bg-ink p-3 lg:col-start-1 lg:row-start-1 lg:flex-col lg:items-center">
            <RailButton active={tab === "garment"} label="Garment" onClick={() => setTab("garment")}>
              <ShirtIcon />
            </RailButton>
            <RailButton active={tab === "design"} label="Designs" onClick={() => setTab("design")}>
              <ImageIcon />
            </RailButton>
            <RailButton active={tab === "text"} label="Text" onClick={() => setTab("text")}>
              <span className="font-display text-lg leading-none">Aa</span>
            </RailButton>
          </div>

          {/* Tool panel */}
          <div className="border-r border-ink/[.08] bg-white p-6 lg:col-start-2 lg:row-start-1 lg:max-h-[660px] lg:overflow-y-auto">
            {tab === "garment" && (
              <div className="space-y-6">
                <div>
                  <Label>
                    Garment color — <span className="text-brand-700">{activeColor?.color.name}</span>
                  </Label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((c) => (
                      <button
                        key={c.colorId}
                        onClick={() => setColorId(c.colorId)}
                        title={c.color.name}
                        className={`h-8 w-8 rounded-full shadow-sm transition-transform hover:scale-110 ${
                          activeColorId === c.colorId ? "border-2 border-brand-500 ring-2 ring-brand-500/25" : "border border-ink/15"
                        }`}
                        style={{ backgroundColor: c.color.hexCode }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Size</Label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s.sizeId}
                        onClick={() => setSizeId(s.sizeId)}
                        className={`rounded-[10px] border-[1.5px] px-4 py-3 text-sm font-semibold transition-colors ${
                          activeSizeId === s.sizeId ? "border-ink bg-ink text-paper" : "border-ink/16 bg-white hover:border-ink"
                        }`}
                      >
                        {s.size.name}
                      </button>
                    ))}
                  </div>
                </div>
                {activeSize && (
                  <div className="rounded-2xl bg-paper p-4">
                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest">Measurements — size {activeSize.size.name}</p>
                    <div className="flex flex-col gap-2 text-[13.5px] text-ink/68">
                      <div className="flex justify-between"><span>Chest</span><span className="font-semibold text-ink">{activeSize.chestWidthCm} cm</span></div>
                      <div className="flex justify-between"><span>Length</span><span className="font-semibold text-ink">{activeSize.lengthCm} cm</span></div>
                      <div className="flex justify-between"><span>Waist</span><span className="font-semibold text-ink">{activeSize.waistCm} cm</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "design" && (
              <div className="space-y-5">
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-brand-500/60 bg-brand-500/[.06] p-5.5 text-center">
                  <Sparkle size={22} className="animate-twinkle text-brand-500" />
                  <span className="text-[13px] font-semibold text-brand-700">Upload your own art</span>
                  <span className="text-[11.5px] text-ink/50">PNG, JPG or WEBP</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleUploadFile} />
                </label>

                <div>
                  <div className="mb-2.5 flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveDesignCategoryId(undefined)}
                      className={`rounded-full px-3.5 py-2 text-xs font-semibold ${
                        !activeDesignCategoryId ? "bg-ink text-paper" : "bg-paper text-ink/60"
                      }`}
                    >
                      All
                    </button>
                    {designCategories?.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveDesignCategoryId(cat.id)}
                        className={`rounded-full px-3.5 py-2 text-xs font-semibold ${
                          activeDesignCategoryId === cat.id ? "bg-ink text-paper" : "bg-paper text-ink/60"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {designAssets?.map((asset) => (
                      <button
                        key={asset.id}
                        onClick={() =>
                          activeCanvasRef.current
                            ?.addImageFromUrl(asset.imageUrl, true)
                            .catch(() => setError("Couldn't add that design to the canvas. Try again."))
                        }
                        className="flex h-[100px] items-center justify-center rounded-xl border border-ink/[.08] bg-paper p-3 transition-transform hover:scale-[1.04]"
                        title={asset.name}
                      >
                        <img src={asset.imageUrl} alt={asset.name} className="h-full w-full object-contain" />
                      </button>
                    ))}
                    {designAssets?.length === 0 && <p className="col-span-2 text-sm text-ink/50">No designs here yet.</p>}
                  </div>
                </div>
              </div>
            )}

            {tab === "text" && (
              <div className="space-y-5">
                <div>
                  <Label>Your text — EN or AR</Label>
                  <textarea
                    value={textDraft}
                    onChange={(e) => setTextDraft(e.target.value)}
                    placeholder="Type your text… اكتب هنا"
                    dir="auto"
                    className="min-h-[72px] w-full resize-none rounded-xl border-[1.5px] border-ink/[.14] bg-white px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  />
                </div>

                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <Label>Size</Label>
                    <span className="text-xs font-semibold text-brand-700">{textStyle.fontSize}pt</span>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={160}
                    value={textStyle.fontSize}
                    onChange={(e) => applyStylePatch({ fontSize: Number(e.target.value) })}
                    className="w-full accent-brand-500"
                  />
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {SWATCH_COLORS.map((hex) => (
                      <button
                        key={hex}
                        onClick={() => applyStylePatch({ fill: hex })}
                        className={`h-7 w-7 rounded-full shadow-sm ${textStyle.fill === hex ? "border-2 border-brand-500" : "border border-ink/15"}`}
                        style={{ backgroundColor: hex }}
                        aria-label={`Quick color ${hex}`}
                      />
                    ))}
                    <input
                      type="color"
                      value={textStyle.fill}
                      onChange={(e) => applyStylePatch({ fill: e.target.value })}
                      className="h-7 w-7 cursor-pointer rounded-full border border-ink/15"
                      aria-label="Custom color"
                    />
                  </div>
                </div>

                <div>
                  <Label>{selection?.isText ? "Change font — English" : "Font — English"}</Label>
                  <div className="flex flex-col gap-2">
                    {enFonts.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => useFont(font)}
                        className="rounded-[10px] border-[1.5px] border-ink/[.12] bg-white px-3.5 py-3 text-left transition-colors hover:border-brand-500"
                      >
                        <span className="truncate text-base" style={{ fontFamily: font.fontFamily, color: textStyle.fill }}>
                          {fontPreviewText(font)}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mb-2.5 mt-4 text-[11px] font-semibold uppercase tracking-widest">Font — Arabic</p>
                  <div className="flex flex-col gap-2">
                    {arFonts.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => useFont(font)}
                        dir="rtl"
                        className="rounded-[10px] border-[1.5px] border-ink/[.12] bg-white px-3.5 py-3 text-right transition-colors hover:border-brand-500"
                      >
                        <span className="truncate text-base" style={{ fontFamily: font.fontFamily, color: textStyle.fill }}>
                          {fontPreviewText(font)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-4 border-t border-ink/[.08] bg-white px-6 py-4.5">
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <Button size="lg" className="animate-glow" disabled={!variant || busy} onClick={handleAddToCart}>
            {busy ? "Saving your design…" : `Add to Cart — EGP ${(variant?.price ?? product.basePrice).toFixed(0)}`}
          </Button>
        </div>
      </div>
    </Container>
  );
}

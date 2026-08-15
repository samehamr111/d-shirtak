import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { LinkButton } from "../components/ui/LinkButton";
import { PageSpinner } from "../components/ui/Spinner";
import { Sparkle } from "../components/ui/ShirtMark";
import { ImageOrPlaceholder } from "../components/ui/ImageOrPlaceholder";
import { useProduct } from "../features/catalog/catalog-api";
import { useAddToCart } from "../features/cart/cart-api";
import { useAuth } from "../features/auth/auth-context";
import { describeError } from "../lib/errors";
import { trackAddToCart } from "../lib/analytics";

export function ProductPage() {
  const { slug } = useParams();
  const { data: product, isLoading, isError } = useProduct(slug);
  const { status } = useAuth();
  const addToCart = useAddToCart();

  const [colorId, setColorId] = useState<string | null>(null);
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [side, setSide] = useState<"front" | "back">("front");
  const [view, setView] = useState<"flat" | "model">("flat");
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const activeColorId = colorId ?? product?.colors[0]?.colorId ?? null;
  const activeSizeId = sizeId ?? product?.sizes[0]?.sizeId ?? null;

  const variant = useMemo(
    () => product?.variants.find((v) => v.colorId === activeColorId && v.sizeId === activeSizeId) ?? null,
    [product, activeColorId, activeSizeId],
  );
  const activeColor = product?.colors.find((c) => c.colorId === activeColorId);
  const activeSize = product?.sizes.find((s) => s.sizeId === activeSizeId);

  if (isLoading) return <PageSpinner />;
  if (isError || !product) {
    return <Container className="py-20 text-center text-ink/60">Couldn't find that product.</Container>;
  }

  async function handleAddToCart() {
    if (!variant || !product) return;
    setMessage(null);
    try {
      await addToCart.mutateAsync({
        productVariantId: variant.id,
        quantity,
        guestSnapshot:
          status === "authenticated"
            ? undefined
            : {
                productName: product.name,
                colorName: activeColor?.color.name ?? "",
                sizeName: activeSize?.size.name ?? "",
                imageUrl: activeColor?.frontImageUrl ?? "",
                unitPrice: variant.price,
                stockQuantity: variant.stockQuantity,
                frontDesignPreviewUrl: null,
                backDesignPreviewUrl: null,
                frontDesignJson: null,
                backDesignJson: null,
              },
      });
      trackAddToCart({ item_id: variant.sku, item_name: product.name, price: variant.price, quantity });
      setMessage({ text: "Added to your cart.", isError: false });
    } catch (err) {
      setMessage({ text: describeError(err, "Couldn't add that to your cart."), isError: true });
    }
  }

  // The flat image is the actual print/mockup for this color; the model image (when the admin
  // has generated one) is a photo of it worn -- a lifestyle shot, not something a customer can
  // design onto. Show both, defaulting to the real print rather than silently swapping one for
  // the other.
  const flatImage = activeColor && (side === "front" ? activeColor.frontImageUrl : activeColor.backImageUrl);
  const modelImage = activeColor && (side === "front" ? activeColor.modelFrontImageUrl : activeColor.modelBackImageUrl);
  const image = view === "model" && modelImage ? modelImage : flatImage;

  return (
    <Container className="py-8">
      <div className="grid gap-11 lg:grid-cols-2">
        <div>
          <div className="relative rounded-[20px] bg-white p-6 shadow-[0_16px_44px_rgba(4,4,4,0.07)]">
            <div className="relative flex h-[470px] items-center justify-center overflow-hidden rounded-2xl bg-[repeating-linear-gradient(135deg,#f5f4f0_0px,#f5f4f0_10px,#eeece6_10px,#eeece6_20px)]">
              <ImageOrPlaceholder
                src={image}
                alt={`${product.name} ${side}`}
                className="h-full w-full object-contain"
                iconClassName="h-1/3 w-1/3 text-ink/20"
              />
              <span
                className={`absolute left-3.5 top-3.5 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-wide ${
                  product.isCustomizable ? "bg-brand-500 text-ink" : "bg-ink/[.07] text-ink/60"
                }`}
              >
                {product.isCustomizable ? "Customizable" : "Ready-Printed"}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-1.5 rounded-full bg-paper p-1.5">
                <button
                  onClick={() => setSide("front")}
                  className={`rounded-full px-4 py-2.5 text-xs font-semibold transition-colors ${
                    side === "front" ? "bg-ink text-paper" : "text-ink/55 hover:bg-ink/5"
                  }`}
                >
                  Front
                </button>
                <button
                  onClick={() => setSide("back")}
                  className={`rounded-full px-4 py-2.5 text-xs font-semibold transition-colors ${
                    side === "back" ? "bg-ink text-paper" : "text-ink/55 hover:bg-ink/5"
                  }`}
                >
                  Back
                </button>
              </div>
              {modelImage && (
                <div className="flex gap-1.5 rounded-full bg-paper p-1.5">
                  <button
                    onClick={() => setView("flat")}
                    className={`rounded-full px-4 py-2.5 text-xs font-semibold transition-colors ${
                      view === "flat" ? "bg-ink text-paper" : "text-ink/55 hover:bg-ink/5"
                    }`}
                  >
                    Print
                  </button>
                  <button
                    onClick={() => setView("model")}
                    className={`rounded-full px-4 py-2.5 text-xs font-semibold transition-colors ${
                      view === "model" ? "bg-ink text-paper" : "text-ink/55 hover:bg-ink/5"
                    }`}
                  >
                    On Model
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink/45">
            Shop / {product.code}
          </p>
          <h1 className="mt-3 font-display text-6xl leading-[0.92] tracking-wide">{product.name}</h1>
          <div className="mt-2.5 flex items-baseline gap-3.5">
            <span className="text-2xl font-semibold text-brand-700">EGP {(variant?.price ?? product.basePrice).toFixed(0)}</span>
            <span className="text-xs text-ink/50">{product.isCustomizable ? "print included · no setup fee" : "ships as-is"}</span>
          </div>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink/65">{product.description}</p>

          <div className="mt-7">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest">
              Color — <span className="text-brand-700">{activeColor?.color.name}</span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c.colorId}
                  onClick={() => setColorId(c.colorId)}
                  title={c.color.name}
                  className={`h-9 w-9 rounded-full shadow-sm transition-transform hover:scale-110 ${
                    activeColorId === c.colorId ? "border-2 border-brand-500 ring-2 ring-brand-500/25" : "border border-ink/15"
                  }`}
                  style={{ backgroundColor: c.color.hexCode }}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const stock = product.variants.find((v) => v.colorId === activeColorId && v.sizeId === s.sizeId);
                const outOfStock = !stock || stock.stockQuantity === 0;
                return (
                  <button
                    key={s.sizeId}
                    disabled={outOfStock}
                    onClick={() => setSizeId(s.sizeId)}
                    className={`rounded-xl border-[1.5px] px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                      activeSizeId === s.sizeId ? "border-ink bg-ink text-paper" : "border-ink/16 bg-white hover:border-ink"
                    }`}
                  >
                    {s.size.name}
                  </button>
                );
              })}
            </div>
            {variant && (
              <p className="mt-2.5 text-xs text-ink/50">
                {variant.stockQuantity > 0 ? `${variant.stockQuantity} in stock` : "Out of stock"}
              </p>
            )}
          </div>

          {product.isCustomizable ? (
            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              {product.variants.some((v) => v.stockQuantity > 0) ? (
                <LinkButton to={`/design/${product.slug}`} size="lg" className="animate-glow">
                  Start Designing →
                </LinkButton>
              ) : (
                <Button size="lg" disabled>
                  Out of Stock
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                disabled={!variant || variant.stockQuantity === 0 || addToCart.isPending}
                onClick={handleAddToCart}
              >
                {variant && variant.stockQuantity === 0 ? "Out of Stock" : "Add blank to cart"}
              </Button>
            </div>
          ) : (
            <div className="mt-7 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-ink/15 px-1">
                <button className="h-11 w-9 text-lg" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                <button className="h-11 w-9 text-lg" onClick={() => setQuantity((q) => Math.min(20, q + 1))} aria-label="Increase quantity">
                  +
                </button>
              </div>
              <Button
                size="lg"
                variant="secondary"
                disabled={!variant || variant.stockQuantity === 0 || addToCart.isPending}
                onClick={handleAddToCart}
              >
                {variant && variant.stockQuantity === 0 ? "Out of Stock" : "Add to cart"}
              </Button>
            </div>
          )}

          {message && (
            <p className={`mt-3.5 text-sm font-medium ${message.isError ? "text-red-600" : "text-brand-700"}`}>{message.text}</p>
          )}

          {product.isCustomizable ? (
            <div className="mt-6 flex max-w-[440px] items-center gap-3.5 rounded-2xl bg-brand-500/10 p-4">
              <Sparkle size={20} className="animate-twinkle text-brand-500" />
              <span className="text-[13px] leading-relaxed text-ink/70">
                Design free, pay only when you order. Your work saves to the canvas as you go.
              </span>
            </div>
          ) : (
            <div className="mt-6 flex max-w-[430px] items-center gap-3.5 rounded-2xl border border-brand-500/40 bg-white p-4">
              <Sparkle size={26} className="text-brand-500" />
              <div>
                <p className="text-sm font-semibold">Want this, but yours?</p>
                <p className="text-xs leading-relaxed text-ink/60">Open a blank and put your own art on it instead.</p>
              </div>
              <LinkButton to="/design" size="sm" className="ml-auto whitespace-nowrap">
                Start Designing
              </LinkButton>
            </div>
          )}

          <div className="mt-6 flex gap-6 font-mono text-[11px] text-ink/50">
            <span>Cash on delivery</span>
            <span>Free returns</span>
          </div>

          {product.sizes.find((s) => s.sizeId === activeSizeId) && (
            <div className="mt-8 rounded-2xl bg-ink/5 p-5 text-sm text-ink/70">
              <p className="mb-2 font-semibold text-ink">
                Garment measurements ({product.sizes.find((s) => s.sizeId === activeSizeId)?.size.name})
              </p>
              {(() => {
                const size = product.sizes.find((s) => s.sizeId === activeSizeId)!;
                return (
                  <ul className="grid grid-cols-3 gap-2">
                    <li>Chest: {size.chestWidthCm}cm</li>
                    <li>Length: {size.lengthCm}cm</li>
                    <li>Waist: {size.waistCm}cm</li>
                  </ul>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

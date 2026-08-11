import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { LinkButton } from "../components/ui/LinkButton";
import { PageSpinner } from "../components/ui/Spinner";
import { Badge } from "../components/ui/Badge";
import { useProduct } from "../features/catalog/catalog-api";
import { useAddToCart } from "../features/cart/cart-api";
import { useAuth } from "../features/auth/auth-context";
import { describeError } from "../lib/errors";

export function ProductPage() {
  const { slug } = useParams();
  const { data: product, isLoading, isError } = useProduct(slug);
  const { status } = useAuth();
  const navigate = useNavigate();
  const addToCart = useAddToCart();

  const [colorId, setColorId] = useState<string | null>(null);
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [side, setSide] = useState<"front" | "back">("front");
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const activeColorId = colorId ?? product?.colors[0]?.colorId ?? null;
  const activeSizeId = sizeId ?? product?.sizes[0]?.sizeId ?? null;

  const variant = useMemo(
    () => product?.variants.find((v) => v.colorId === activeColorId && v.sizeId === activeSizeId) ?? null,
    [product, activeColorId, activeSizeId],
  );
  const activeColor = product?.colors.find((c) => c.colorId === activeColorId);

  if (isLoading) return <PageSpinner />;
  if (isError || !product) {
    return (
      <Container className="py-20 text-center text-ink/60">Couldn't find that product.</Container>
    );
  }

  async function handleAddToCart() {
    if (!variant) return;
    if (status !== "authenticated") {
      navigate("/login");
      return;
    }
    setMessage(null);
    try {
      await addToCart.mutateAsync({ productVariantId: variant.id, quantity });
      setMessage({ text: "Added to your cart.", isError: false });
    } catch (err) {
      setMessage({ text: describeError(err, "Couldn't add that to your cart."), isError: true });
    }
  }

  return (
    <Container className="py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-ink/5">
            {activeColor && (
              <img
                src={
                  side === "front"
                    ? activeColor.modelFrontImageUrl ?? activeColor.frontImageUrl
                    : activeColor.modelBackImageUrl ?? activeColor.backImageUrl
                }
                alt={`${product.name} ${side}`}
                className="h-full w-full object-contain"
              />
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setSide("front")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                side === "front" ? "bg-ink text-paper" : "bg-ink/5 text-ink/60"
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setSide("back")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                side === "back" ? "bg-ink text-paper" : "bg-ink/5 text-ink/60"
              }`}
            >
              Back
            </button>
          </div>
        </div>

        <div>
          {product.isCustomizable ? (
            <Badge tone="brand">Customizable</Badge>
          ) : (
            <Badge tone="pop">Ready-Printed</Badge>
          )}
          <h1 className="mt-3 font-display text-5xl">{product.name}</h1>
          <p className="mt-1 font-mono text-xs text-ink/40">Style {product.code}</p>
          <p className="mt-3 max-w-md text-ink/60">{product.description}</p>
          <p className="mt-4 text-2xl font-semibold">EGP {(variant?.price ?? product.basePrice).toFixed(0)}</p>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Color</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.colorId}
                  onClick={() => setColorId(c.colorId)}
                  title={c.color.name}
                  className={`h-10 w-10 rounded-full border-2 ring-1 ring-ink/10 transition-transform ${
                    activeColorId === c.colorId ? "scale-110 border-brand-500" : "border-white"
                  }`}
                  style={{ backgroundColor: c.color.hexCode }}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Size</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const stock = product.variants.find((v) => v.colorId === activeColorId && v.sizeId === s.sizeId);
                const outOfStock = !stock || stock.stockQuantity === 0;
                return (
                  <button
                    key={s.sizeId}
                    disabled={outOfStock}
                    onClick={() => setSizeId(s.sizeId)}
                    className={`h-11 min-w-11 rounded-xl border px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                      activeSizeId === s.sizeId ? "border-ink bg-ink text-paper" : "border-ink/20 hover:border-ink"
                    }`}
                  >
                    {s.size.name}
                  </button>
                );
              })}
            </div>
            {variant && (
              <p className="mt-2 text-xs text-ink/50">
                {variant.stockQuantity > 0 ? `${variant.stockQuantity} in stock` : "Out of stock"}
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Qty</p>
            <div className="flex items-center rounded-full border border-ink/15">
              <button
                className="h-10 w-10 text-lg"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
                className="h-10 w-10 text-lg"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {product.isCustomizable && (
              <LinkButton to={`/design/${product.slug}`} size="lg" className="sm:flex-1">
                Design This
              </LinkButton>
            )}
            <Button
              variant="outline"
              size="lg"
              className="sm:flex-1"
              disabled={!variant || variant.stockQuantity === 0 || addToCart.isPending}
              onClick={handleAddToCart}
            >
              {variant && variant.stockQuantity === 0
                ? "Out of Stock"
                : product.isCustomizable
                  ? "Add Blank to Cart"
                  : "Add to Cart"}
            </Button>
          </div>
          {message && (
            <p className={`mt-3 text-sm font-medium ${message.isError ? "text-red-600" : "text-brand-600"}`}>
              {message.text}
            </p>
          )}

          {product.sizes.find((s) => s.sizeId === activeSizeId) && (
            <div className="mt-10 rounded-2xl bg-ink/5 p-5 text-sm text-ink/70">
              <p className="mb-2 font-semibold text-ink">Garment measurements ({product.sizes.find((s) => s.sizeId === activeSizeId)?.size.name})</p>
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

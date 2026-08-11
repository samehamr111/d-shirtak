import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { LinkButton } from "../components/ui/LinkButton";
import { ProductCard } from "../components/ProductCard";
import { PageSpinner } from "../components/ui/Spinner";
import { useCategories, useProducts } from "../features/catalog/catalog-api";

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const colorId = searchParams.get("color") ?? undefined;

  const { data: categories } = useCategories();
  const { data: allProducts, isLoading, isError } = useProducts({ category });

  const customCount = allProducts?.filter((p) => p.isCustomizable).length ?? 0;
  const readyCount = allProducts ? allProducts.length - customCount : 0;

  const colorSwatches = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; hexCode: string }>();
    allProducts?.forEach((p) => p.colors.forEach((c) => seen.set(c.id, c)));
    return [...seen.values()];
  }, [allProducts]);

  const products = allProducts
    ?.filter((p) => !type || p.productType === type)
    .filter((p) => !colorId || p.colors.some((c) => c.id === colorId));

  const setParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  return (
    <Container className="py-10">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-6xl tracking-wide">SHOP BLANKS &amp; PRINTS</h1>
          <p className="mt-2 max-w-lg text-sm text-ink/60">
            Every blank below can be customized. Start from one, or take a ready-printed piece as-is.
          </p>
        </div>
        <div className="flex gap-1.5 rounded-full border border-ink/10 bg-white p-1.5">
          <button
            onClick={() => setParam("type", "CUSTOMIZABLE")}
            className={`rounded-full px-4 py-2.5 text-xs font-semibold transition-colors ${
              type === "CUSTOMIZABLE" ? "bg-brand-500 text-ink" : "text-ink/60 hover:bg-ink/5"
            }`}
          >
            Customizable
          </button>
          <button
            onClick={() => setParam("type", undefined)}
            className={`rounded-full px-4 py-2.5 text-xs font-semibold transition-colors ${
              !type ? "bg-ink text-white" : "text-ink/60 hover:bg-ink/5"
            }`}
          >
            All products
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside className="flex flex-col gap-5">
          {categories && categories.length > 0 && (
            <div className="rounded-2xl border border-ink/[.08] bg-white p-4">
              <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-widest">Category</p>
              <div className="flex flex-col gap-1.5 text-sm">
                <button
                  onClick={() => setParam("category", undefined)}
                  className={`flex justify-between rounded-lg px-3 py-2.5 text-left font-medium transition-colors ${
                    !category ? "bg-brand-500/15 text-brand-700" : "text-ink/65 hover:bg-ink/5"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setParam("category", cat.slug)}
                    className={`flex justify-between rounded-lg px-3 py-2.5 text-left font-medium transition-colors ${
                      category === cat.slug ? "bg-brand-500/15 text-brand-700" : "text-ink/65 hover:bg-ink/5"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-ink/[.08] bg-white p-4">
            <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-widest">Type</p>
            <div className="flex flex-col gap-2 text-sm">
              <button
                onClick={() => setParam("type", "CUSTOMIZABLE")}
                className={`flex justify-between rounded-lg px-3 py-2.5 font-semibold transition-colors ${
                  type === "CUSTOMIZABLE" ? "bg-brand-500/15 text-brand-700" : "text-ink/65 hover:bg-ink/5"
                }`}
              >
                Customizable <span>{customCount}</span>
              </button>
              <button
                onClick={() => setParam("type", "READY_PRINTED")}
                className={`flex justify-between rounded-lg px-3 py-2.5 font-semibold transition-colors ${
                  type === "READY_PRINTED" ? "bg-brand-500/15 text-brand-700" : "text-ink/65 hover:bg-ink/5"
                }`}
              >
                Ready-printed <span>{readyCount}</span>
              </button>
            </div>
          </div>

          {colorSwatches.length > 0 && (
            <div className="rounded-2xl border border-ink/[.08] bg-white p-4">
              <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-widest">Garment color</p>
              <div className="flex flex-wrap gap-2.5">
                {colorSwatches.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setParam("color", colorId === c.id ? undefined : c.id)}
                    title={c.name}
                    style={{ backgroundColor: c.hexCode }}
                    className={`h-7 w-7 rounded-full border shadow-sm transition-transform hover:scale-110 ${
                      colorId === c.id ? "border-2 border-brand-500 ring-2 ring-brand-500/30" : "border-ink/15"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-pop-500/10 p-4">
            <p className="font-display text-2xl tracking-wide text-pop-600">CAN'T DECIDE?</p>
            <p className="mt-2 text-xs leading-relaxed text-ink/65">Open a blank canvas and design from scratch.</p>
            <LinkButton to="/design" size="sm" className="mt-3">
              Start Designing
            </LinkButton>
          </div>
        </aside>

        <div>
          {isLoading && <PageSpinner />}
          {isError && (
            <p className="rounded-xl bg-red-50 p-6 text-sm text-red-700">Couldn't load products. Is the API running?</p>
          )}
          {!isLoading && !isError && products?.length === 0 && (
            <p className="text-ink/60">No products found. Try clearing a filter.</p>
          )}
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
            {products?.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}

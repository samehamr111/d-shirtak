import { useSearchParams } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { ProductCard } from "../components/ProductCard";
import { PageSpinner } from "../components/ui/Spinner";
import { useCategories, useProducts } from "../features/catalog/catalog-api";

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  const type = searchParams.get("type") ?? undefined;

  const { data: categories } = useCategories();
  const { data: allProducts, isLoading, isError } = useProducts({ category });
  const products = type ? allProducts?.filter((p) => p.productType === type) : allProducts;

  const setType = (next: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (next) params.set("type", next);
    else params.delete("type");
    setSearchParams(params);
  };

  return (
    <Container className="py-12">
      <div className="mb-10">
        <h1 className="font-display text-5xl">Shop All</h1>
        <p className="mt-2 max-w-lg text-ink/60">
          Blank slates and ready-to-wear favorites. Pick a piece, then make it yours in the designer.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setSearchParams({})}
          className={`rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
            !category ? "bg-ink text-paper" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
          }`}
        >
          All
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSearchParams({ category: cat.slug })}
            className={`rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
              category === cat.slug ? "bg-ink text-paper" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setType(undefined)}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
            !type ? "bg-pop-500 text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
          }`}
        >
          All types
        </button>
        <button
          onClick={() => setType("CUSTOMIZABLE")}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
            type === "CUSTOMIZABLE" ? "bg-pop-500 text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
          }`}
        >
          Customizable
        </button>
        <button
          onClick={() => setType("READY_PRINTED")}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
            type === "READY_PRINTED" ? "bg-pop-500 text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
          }`}
        >
          Ready-Printed
        </button>
      </div>

      {isLoading && <PageSpinner />}
      {isError && (
        <p className="rounded-xl bg-red-50 p-6 text-sm text-red-700">
          Couldn't load products. Is the API running?
        </p>
      )}
      {!isLoading && !isError && products?.length === 0 && (
        <p className="text-ink/60">No products found in this category yet.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products?.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </Container>
  );
}

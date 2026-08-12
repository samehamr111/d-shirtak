import { useSearchParams } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { ProductCard } from "../components/ProductCard";
import { PageSpinner } from "../components/ui/Spinner";
import { ImageOrPlaceholder } from "../components/ui/ImageOrPlaceholder";
import { useDesignAssets, useProducts } from "../features/catalog/catalog-api";

export function DesignPickerPage() {
  const { data: products, isLoading } = useProducts();
  const [searchParams] = useSearchParams();
  const presetAssetId = searchParams.get("asset");
  // Any design in the library works on any customizable garment -- this page doesn't need to
  // filter assets by product, just look up the one the user clicked through with.
  const { data: designAssets } = useDesignAssets();
  const presetAsset = presetAssetId ? designAssets?.find((a) => a.id === presetAssetId) : undefined;

  // Out-of-stock products are excluded here (not just disabled on the product page) because
  // this page's preset-design cards link straight into /design/:slug, bypassing that page
  // entirely.
  const customizable = products?.filter((p) => p.isCustomizable && p.inStock);

  return (
    <Container className="py-12">
      <div className="mb-10 max-w-2xl">
        {presetAsset ? (
          <>
            <div className="mb-4 flex items-center gap-3">
              <ImageOrPlaceholder
                src={presetAsset.imageUrl}
                alt={presetAsset.name}
                className="h-14 w-14 rounded-xl border border-ink/10 bg-white object-contain p-1.5"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">Using "{presetAsset.name}"</p>
                <h1 className="font-display text-4xl">Pick a garment for it</h1>
              </div>
            </div>
            <p className="text-ink/60">This design works on any of these — pick one and it'll already be on the canvas.</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-5xl">Design Your Own</h1>
            <p className="mt-2 text-ink/60">
              Pick a blank canvas — a tee or a hoodie — then upload your art, add text, and lay out a print for the
              front and back.
            </p>
          </>
        )}
      </div>

      {isLoading && <PageSpinner />}

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {customizable?.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            linkTo={presetAsset ? `/design/${product.slug}?asset=${presetAsset.id}` : undefined}
          />
        ))}
      </div>
    </Container>
  );
}

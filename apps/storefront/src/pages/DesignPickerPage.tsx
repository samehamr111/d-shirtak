import { Container } from "../components/ui/Container";
import { ProductCard } from "../components/ProductCard";
import { PageSpinner } from "../components/ui/Spinner";
import { useProducts } from "../features/catalog/catalog-api";

export function DesignPickerPage() {
  const { data: products, isLoading } = useProducts();
  const customizable = products?.filter((p) => p.isCustomizable);

  return (
    <Container className="py-12">
      <div className="mb-10 max-w-2xl">
        <h1 className="font-display text-5xl">Design Your Own</h1>
        <p className="mt-2 text-ink/60">
          Pick a blank canvas — a tee or a hoodie — then upload your art, add text, and lay out a print for the
          front and back.
        </p>
      </div>

      {isLoading && <PageSpinner />}

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {customizable?.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
      </div>
    </Container>
  );
}

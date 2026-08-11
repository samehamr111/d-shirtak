import { useMemo, useState } from "react";
import { useProducts, useUpdateAnyVariant } from "../products/api";
import { PageHeader } from "../../components/PageHeader";
import { DataTable } from "../../components/DataTable";
import { Input } from "../../components/form";
import { SearchInput } from "../../components/SearchInput";
import { Pagination } from "../../components/Pagination";
import { SkeletonRows } from "../../components/Skeleton";
import { usePagedList } from "../../lib/paginate";

const LOW_STOCK = 5;
const WATCH_STOCK = 15;

interface InventoryRow {
  key: string;
  productId: string;
  productName: string;
  variantId: string;
  colorName: string;
  colorHex: string;
  sizeName: string;
  sku: string;
  stockQuantity: number;
  price: number;
  costPrice: number | null;
}

function StockCell({ row }: { row: InventoryRow }) {
  const updateVariant = useUpdateAnyVariant();
  const [value, setValue] = useState(row.stockQuantity);

  const tone =
    row.stockQuantity < LOW_STOCK ? "text-red-600" : row.stockQuantity < WATCH_STOCK ? "text-amber-600" : "text-ink";

  const commit = () => {
    if (value !== row.stockQuantity && value >= 0) {
      updateVariant.mutate({ productId: row.productId, variantId: row.variantId, input: { stockQuantity: value } });
    }
  };

  return (
    <Input
      type="number"
      min="0"
      value={value}
      onChange={(e) => setValue(Number(e.target.value))}
      onBlur={commit}
      className={`w-20 font-semibold ${tone}`}
    />
  );
}

export function InventoryPage() {
  const { data: products, isLoading } = useProducts();
  const [search, setSearch] = useState("");

  const rows = useMemo<InventoryRow[]>(() => {
    return (products ?? []).flatMap((p) =>
      p.variants.map((v) => {
        const color = p.colors.find((c) => c.colorId === v.colorId);
        const size = p.sizes.find((s) => s.sizeId === v.sizeId);
        return {
          key: `${p.id}-${v.id}`,
          productId: p.id,
          productName: p.name,
          variantId: v.id,
          colorName: color?.color.name ?? "—",
          colorHex: color?.color.hexCode ?? "#cccccc",
          sizeName: size?.size.name ?? "—",
          sku: v.sku,
          stockQuantity: v.stockQuantity,
          price: v.price,
          costPrice: p.costPrice,
        };
      }),
    );
  }, [products]);

  const filtered = search.trim()
    ? rows.filter((r) => r.productName.toLowerCase().includes(search.trim().toLowerCase()))
    : rows;

  const { page, setPage, pageRows, pageSize, total } = usePagedList(filtered, 25);

  const lowStockCount = rows.filter((r) => r.stockQuantity < LOW_STOCK).length;

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Every product, color, and size in one place — check and adjust stock without opening each product."
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Filter by product name…" className="w-64" />
        {lowStockCount > 0 && (
          <p className="text-sm font-medium text-red-600">
            {lowStockCount} variant{lowStockCount === 1 ? "" : "s"} below {LOW_STOCK} in stock
          </p>
        )}
      </div>

      {isLoading ? (
        <SkeletonRows columns={7} />
      ) : (
        <>
        <DataTable
          rowKey={(row) => row.key}
          rows={pageRows}
          emptyMessage="No variants match."
          columns={[
            { header: "Product", render: (row) => row.productName },
            {
              header: "Color",
              render: (row) => (
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full border border-ink/20"
                    style={{ backgroundColor: row.colorHex }}
                  />
                  {row.colorName}
                </span>
              ),
            },
            { header: "Size", render: (row) => row.sizeName },
            { header: "SKU", render: (row) => <span className="font-mono text-xs">{row.sku}</span> },
            { header: "Stock", render: (row) => <StockCell row={row} /> },
            { header: "Cost", render: (row) => (row.costPrice === null ? "—" : `EGP ${row.costPrice.toFixed(2)}`) },
            {
              header: "Margin",
              render: (row) =>
                row.costPrice === null ? "—" : `EGP ${(row.price - row.costPrice).toFixed(2)}`,
            },
            { header: "Price", render: (row) => `EGP ${row.price.toFixed(2)}` },
          ]}
        />
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

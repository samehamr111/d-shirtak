import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../catalog/api";
import { useProducts } from "./api";
import { PageHeader } from "../../components/PageHeader";
import { DataTable } from "../../components/DataTable";
import { PrimaryButton } from "../../components/form";
import { BooleanBadge } from "../../components/StatusBadge";
import { SearchInput } from "../../components/SearchInput";
import { Pagination } from "../../components/Pagination";
import { SkeletonRows } from "../../components/Skeleton";
import { usePagedList } from "../../lib/paginate";

export function ProductsListPage() {
  const { data: products, isLoading, error } = useProducts();
  const { data: categories } = useCategories();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const categoryName = (categoryId: string) => categories?.find((c) => c.id === categoryId)?.name ?? categoryId;

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
  }, [products, search]);

  const { page, setPage, pageRows, pageSize, total } = usePagedList(filtered, 20);

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage the product catalog: base info, mockup colors, sizes, and stock variants."
        actions={<PrimaryButton onClick={() => navigate("/products/new")}>New product</PrimaryButton>}
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or code…" className="w-64" />
      </div>

      {isLoading && <SkeletonRows columns={6} />}
      {error && <p className="text-sm text-red-600">Failed to load products.</p>}

      {products && (
        <>
          <DataTable
            rowKey={(row) => row.id}
            rows={pageRows}
            emptyMessage={products.length === 0 ? "No products yet. Create one to get started." : "No products match your search."}
            columns={[
              {
                header: "Name",
                render: (row) => (
                  <button className="font-medium text-brand-600 hover:underline" onClick={() => navigate(`/products/${row.id}`)}>
                    {row.name}
                  </button>
                ),
              },
              { header: "Code", render: (row) => <span className="font-mono text-xs text-ink/60">{row.code}</span> },
              { header: "Category", render: (row) => categoryName(row.categoryId) },
              { header: "Base price", render: (row) => `EGP ${row.basePrice.toFixed(2)}` },
              { header: "Variants", render: (row) => row.variants.length },
              { header: "Status", render: (row) => <BooleanBadge value={row.isActive} /> },
            ]}
          />
          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

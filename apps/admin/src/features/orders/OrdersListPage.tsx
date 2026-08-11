import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { OrderStatus } from "@d-shirtak/shared";
import type { OrderStatus as OrderStatusType } from "@d-shirtak/shared";
import { useOrders } from "./api";
import { PageHeader } from "../../components/PageHeader";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { Select } from "../../components/form";
import { SearchInput } from "../../components/SearchInput";
import { Pagination } from "../../components/Pagination";
import { SkeletonRows } from "../../components/Skeleton";
import { usePagedList } from "../../lib/paginate";

const STATUS_OPTIONS = Object.values(OrderStatus);

function isOrderStatus(value: string): value is OrderStatusType {
  return (STATUS_OPTIONS as string[]).includes(value);
}

export function OrdersListPage() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status");
  const [status, setStatus] = useState<OrderStatusType | "">(
    initialStatus && isOrderStatus(initialStatus) ? initialStatus : "",
  );
  const [search, setSearch] = useState("");
  const { data: orders, isLoading, error } = useOrders(status || undefined);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!orders) return [];
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => o.customerName.toLowerCase().includes(q) || o.orderNumber.toLowerCase().includes(q));
  }, [orders, search]);

  const { page, setPage, pageRows, pageSize, total } = usePagedList(filtered, 20);

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Track and update customer orders."
        actions={
          <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatusType | "")} className="w-44">
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by customer or order #…" className="w-64" />
      </div>

      {isLoading && <SkeletonRows columns={6} />}
      {error && <p className="text-sm text-red-600">Failed to load orders.</p>}

      {orders && (
        <>
          <DataTable
            rowKey={(row) => row.id}
            rows={pageRows}
            emptyMessage={orders.length === 0 ? "No orders found." : "No orders match your search."}
            columns={[
              {
                header: "Order #",
                render: (row) => (
                  <button className="font-medium text-brand-600 hover:underline" onClick={() => navigate(`/orders/${row.id}`)}>
                    {row.orderNumber}
                  </button>
                ),
              },
              { header: "Customer", render: (row) => row.customerName },
              { header: "Total", render: (row) => `EGP ${row.total.toFixed(2)}` },
              { header: "Items", render: (row) => row.itemCount },
              { header: "Created", render: (row) => new Date(row.createdAt).toLocaleString() },
              { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
            ]}
          />
          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

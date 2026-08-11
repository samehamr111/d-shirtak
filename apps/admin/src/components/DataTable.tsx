import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { EmptyState } from "./EmptyState";

export interface DataTableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, rows, rowKey, emptyMessage = "Nothing here yet." }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <EmptyState icon={Inbox} message={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto rounded border border-ink/10">
      <table className="min-w-full divide-y divide-ink/10 text-sm">
        <thead className="bg-ink/5">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-ink/70">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10 bg-white">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-ink/5">
              {columns.map((col) => (
                <td key={col.header} className={`whitespace-nowrap px-3 py-2 ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

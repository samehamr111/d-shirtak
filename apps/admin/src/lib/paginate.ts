import { useEffect, useMemo, useState } from "react";

/** Slices an already-fetched in-memory array into pages. None of the current list endpoints
 *  support server-side paging, and at today's data volumes that's the right trade-off -- this
 *  hook can be swapped for server-side paging later without changing Pagination's props. */
export function usePagedList<T>(rows: T[], pageSize = 20) {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [pageCount, page]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  return { page, setPage, pageRows, pageSize, total: rows.length };
}

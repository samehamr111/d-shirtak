import { useMemo, useState } from "react";
import type { AdminUserDto } from "@d-shirtak/shared";
import { CalendarClock, ShieldAlert, Users as UsersIcon } from "lucide-react";
import { useBlockUser, useUnblockUser, useUserStats, useUsers } from "./api";
import { PageHeader } from "../../components/PageHeader";
import { DataTable } from "../../components/DataTable";
import { BooleanBadge } from "../../components/StatusBadge";
import { SearchInput } from "../../components/SearchInput";
import { Pagination } from "../../components/Pagination";
import { SkeletonRows } from "../../components/Skeleton";
import { KpiCard } from "../../components/KpiCard";
import { Modal } from "../../components/Modal";
import { DangerButton, SecondaryButton, Textarea } from "../../components/form";
import { useToast } from "../../components/Toast";
import { ApiError } from "../../lib/api-client";
import { usePagedList } from "../../lib/paginate";

export function UsersListPage() {
  const { data: users, isLoading, error } = useUsers();
  const { data: stats } = useUserStats();
  const [search, setSearch] = useState("");
  const [blockTarget, setBlockTarget] = useState<AdminUserDto | null>(null);
  const [reason, setReason] = useState("");
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || (u.phone ?? "").includes(q),
    );
  }, [users, search]);

  const { page, setPage, pageRows, pageSize, total } = usePagedList(filtered, 20);

  const handleBlockSubmit = async () => {
    if (!blockTarget) return;
    try {
      await blockUser.mutateAsync({ id: blockTarget.id, reason });
      showToast({ type: "success", message: `${blockTarget.username} has been blocked.` });
      setBlockTarget(null);
      setReason("");
    } catch (err) {
      showToast({ type: "error", message: err instanceof ApiError ? err.message : "Failed to block this account." });
    }
  };

  const handleUnblock = async (user: AdminUserDto) => {
    try {
      await unblockUser.mutateAsync(user.id);
      showToast({ type: "success", message: `${user.username} has been unblocked.` });
    } catch (err) {
      showToast({ type: "error", message: err instanceof ApiError ? err.message : "Failed to unblock this account." });
    }
  };

  return (
    <div>
      <PageHeader title="Users" description="Customer accounts, signups, and account status." />

      {stats && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label="Total customers" value={String(stats.totalCustomers)} icon={UsersIcon} />
          <KpiCard label="New — last 7 days" value={String(stats.newLast7Days)} tone="brand" icon={CalendarClock} />
          <KpiCard label="New — last 30 days" value={String(stats.newLast30Days)} tone="brand" icon={ShieldAlert} />
        </div>
      )}

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by email, phone, or username…" className="w-72" />
      </div>

      {isLoading && <SkeletonRows columns={6} />}
      {error && <p className="text-sm text-red-600">Failed to load users.</p>}

      {users && (
        <>
          <DataTable
            rowKey={(row) => row.id}
            rows={pageRows}
            emptyMessage={users.length === 0 ? "No customer accounts yet." : "No users match your search."}
            columns={[
              { header: "Username", render: (row) => row.username },
              { header: "Email", render: (row) => row.email },
              { header: "Phone", render: (row) => row.phone ?? "—" },
              { header: "Orders", render: (row) => row.orderCount },
              { header: "Joined", render: (row) => new Date(row.createdAt).toLocaleDateString() },
              {
                header: "Status",
                render: (row) => (
                  <div>
                    <BooleanBadge value={!row.isBlocked} trueLabel="Active" falseLabel="Blocked" />
                    {row.isBlocked && row.blockedReason && (
                      <p className="mt-1 max-w-[16rem] truncate text-xs text-ink/50" title={row.blockedReason}>
                        {row.blockedReason}
                      </p>
                    )}
                  </div>
                ),
              },
              {
                header: "",
                render: (row) =>
                  row.isBlocked ? (
                    <SecondaryButton onClick={() => handleUnblock(row)} disabled={unblockUser.isPending}>
                      Unblock
                    </SecondaryButton>
                  ) : (
                    <DangerButton
                      onClick={() => {
                        setBlockTarget(row);
                        setReason("");
                      }}
                    >
                      Block
                    </DangerButton>
                  ),
              },
            ]}
          />
          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </>
      )}

      {blockTarget && (
        <Modal title={`Block ${blockTarget.username}?`} onClose={() => setBlockTarget(null)}>
          <p className="mb-3 text-sm text-ink/60">
            They'll be signed out immediately and won't be able to log back in until unblocked. Give a reason so
            there's a record of why — this shows up on their account.
          </p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Repeated fake orders, abusive messages to support…"
            rows={3}
            autoFocus
          />
          <div className="mt-4 flex justify-end gap-2">
            <SecondaryButton onClick={() => setBlockTarget(null)}>Cancel</SecondaryButton>
            <DangerButton onClick={handleBlockSubmit} disabled={blockUser.isPending || reason.trim().length < 3}>
              {blockUser.isPending ? "Blocking…" : "Block account"}
            </DangerButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

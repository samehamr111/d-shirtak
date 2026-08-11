import { Link } from "react-router-dom";
import { AlertTriangle, Package, Receipt, ShoppingBag, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import { useDashboardStats } from "../orders/api";
import { useAuth } from "../auth/auth-context";
import { PageHeader } from "../../components/PageHeader";
import { Card } from "../../components/Card";
import { RevenueChart } from "./RevenueChart";
import { DashboardSkeleton } from "./DashboardSkeleton";

function KpiCard({
  label,
  value,
  to,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  to?: string;
  tone?: "brand" | "danger";
  icon: LucideIcon;
}) {
  const valueTone = tone === "brand" ? "text-brand-600" : tone === "danger" ? "text-red-600" : "text-ink";
  const iconTone = tone === "brand" ? "bg-brand-50 text-brand-600" : tone === "danger" ? "bg-red-50 text-red-600" : "bg-ink/5 text-ink/60";
  const content = (
    <Card className="h-full transition-shadow hover:shadow-pop">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</p>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconTone}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className={`mt-2 text-2xl font-semibold ${valueTone}`}>{value}</p>
    </Card>
  );
  return to ? (
    <Link to={to} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div>
      <PageHeader title="Dashboard" description={user ? `Signed in as ${user.username} (${user.email})` : undefined} />

      {isLoading || !stats ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="Revenue" value={`EGP ${stats.totalRevenue.toFixed(2)}`} icon={Wallet} />
            <KpiCard label="Cost" value={`EGP ${stats.totalCost.toFixed(2)}`} icon={Receipt} />
            <KpiCard label="Profit" value={`EGP ${stats.totalProfit.toFixed(2)}`} tone="brand" icon={TrendingUp} />
            <KpiCard label="Avg order value" value={`EGP ${stats.avgOrderValue.toFixed(2)}`} icon={ShoppingBag} />
            <KpiCard label="Orders" value={String(stats.orderCount)} to="/orders" icon={Package} />
            <KpiCard
              label="Pending orders"
              value={String(stats.pendingCount)}
              to="/orders?status=PENDING"
              tone={stats.pendingCount > 0 ? "danger" : undefined}
              icon={AlertTriangle}
            />
          </div>
          {stats.hasIncompleteCostData && (
            <p className="mt-3 text-sm text-amber-700">
              Cost and profit are underestimated — some sold products don't have a cost price set yet.{" "}
              <Link to="/inventory" className="font-medium underline">
                Fill them in from Inventory
              </Link>
              .
            </p>
          )}
          <p className="mt-1 text-xs text-ink/40">
            Cost/profit use each product's current cost price, not what it cost at the time of sale.
          </p>

          <Card className="mt-6">
            <h2 className="mb-2 text-base font-semibold">Revenue, last {stats.dailyRevenue.length} days</h2>
            <RevenueChart data={stats.dailyRevenue} />
          </Card>
        </>
      )}
    </div>
  );
}

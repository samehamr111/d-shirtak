import { Link } from "react-router-dom";
import { AlertTriangle, Package, Receipt, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import { useDashboardStats } from "../orders/api";
import { useAuth } from "../auth/auth-context";
import { PageHeader } from "../../components/PageHeader";
import { Card } from "../../components/Card";
import { KpiCard } from "../../components/KpiCard";
import { RevenueChart } from "./RevenueChart";
import { DashboardSkeleton } from "./DashboardSkeleton";

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

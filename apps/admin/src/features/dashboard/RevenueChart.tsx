import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardStatsDto } from "@d-shirtak/shared";

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-ink/10 bg-ink px-3 py-1.5 text-xs text-white shadow-dropdown">
      EGP {payload[0]!.value.toFixed(0)}
    </div>
  );
}

export function RevenueChart({ data }: { data: DashboardStatsDto["dailyRevenue"] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00c97a" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#00c97a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          tick={{ fontSize: 10, fill: "#0b0b0d66" }}
          axisLine={{ stroke: "#0b0b0d1a" }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis hide />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#0b0b0d1a" }} />
        <Area type="monotone" dataKey="revenue" stroke="#00c97a" strokeWidth={2} fill="url(#revenueFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

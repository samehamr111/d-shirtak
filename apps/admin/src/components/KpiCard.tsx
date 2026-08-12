import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

export function KpiCard({
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

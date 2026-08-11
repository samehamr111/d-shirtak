import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded border border-dashed border-ink/20 p-8 text-center">
      {Icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 text-ink/40">
          <Icon size={18} />
        </div>
      )}
      <p className="text-sm text-ink/60">{message}</p>
      {action}
    </div>
  );
}

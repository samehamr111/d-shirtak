import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "../auth/auth-context";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function UserMenu({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!user) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-ink/5"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-xs font-semibold text-brand-700">
          {initials(user.username)}
        </div>
        <span className="hidden font-medium text-ink sm:inline">{user.username}</span>
        <ChevronDown size={14} className="text-ink/40" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1.5 w-56 rounded-xl border border-ink/10 bg-white p-1.5 shadow-dropdown">
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-medium text-ink">{user.username}</p>
            <p className="truncate text-xs text-ink/50">{user.email}</p>
          </div>
          <div className="my-1 border-t border-ink/10" />
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-ink/70 hover:bg-ink/5 hover:text-ink"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

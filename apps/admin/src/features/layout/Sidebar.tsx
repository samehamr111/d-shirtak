import { NavLink } from "react-router-dom";
import {
  Boxes,
  Images,
  LayoutDashboard,
  Shirt,
  ShoppingCart,
  SlidersHorizontal,
  Type,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../auth/auth-context";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", end: true, icon: LayoutDashboard }],
  },
  {
    label: "Catalog",
    items: [
      { to: "/products", label: "Products", end: false, icon: Shirt },
      { to: "/inventory", label: "Inventory", end: false, icon: Boxes },
      { to: "/catalog", label: "Catalog Settings", end: false, icon: SlidersHorizontal },
      { to: "/fonts", label: "Fonts", end: false, icon: Type },
      { to: "/design-library", label: "Design Library", end: false, icon: Images },
    ],
  },
  {
    label: "Sales",
    items: [{ to: "/orders", label: "Orders", end: false, icon: ShoppingCart }],
  },
  {
    label: "Accounts",
    items: [{ to: "/users", label: "Users", end: false, icon: Users }],
  },
] satisfies { label: string; items: { to: string; label: string; end: boolean; icon: LucideIcon }[] }[];

interface SidebarProps {
  onNavigate?: () => void;
  onLogout: () => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function Sidebar({ onNavigate, onLogout }: SidebarProps) {
  const { user } = useAuth();

  return (
    <nav className="flex h-full flex-col bg-ink text-paper">
      <div className="flex items-center gap-2 px-4 py-5 text-lg font-semibold tracking-wide">
        <img src="/icon.png" alt="" className="h-6 w-6" />
        D-Shirtak Admin
      </div>
      <div className="flex-1 space-y-5 px-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-paper/40">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? "bg-brand-500 text-white" : "text-paper/70 hover:bg-white/10 hover:text-paper"
                      }`
                    }
                  >
                    <item.icon size={16} className="shrink-0" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 p-2">
        {user && (
          <div className="mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-semibold text-brand-300">
              {initials(user.username)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-paper">{user.username}</p>
              <p className="truncate text-xs text-paper/50">{user.email}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onLogout}
          className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-paper/70 transition-colors hover:bg-white/10 hover:text-paper"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

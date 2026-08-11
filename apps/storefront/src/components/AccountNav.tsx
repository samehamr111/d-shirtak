import { NavLink } from "react-router-dom";
import { useAuth } from "../features/auth/auth-context";
import { LinkButton } from "./ui/LinkButton";

const links = [
  { to: "/account/orders", label: "Orders" },
  { to: "/account/addresses", label: "Addresses" },
];

export function AccountNav() {
  const { user, logout } = useAuth();
  const initials = user?.username
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-3.5">
      <div className="rounded-2xl border border-ink/[.08] bg-white p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500/15 text-sm font-semibold text-brand-700">
          {initials}
        </div>
        <p className="mt-3 truncate text-[15px] font-semibold">{user?.username}</p>
        <p className="mt-1 truncate text-xs text-ink/50">{user?.email}</p>
      </div>

      <nav className="flex flex-col gap-1 rounded-2xl border border-ink/[.08] bg-white p-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                isActive ? "bg-ink text-paper" : "text-ink/65 hover:bg-ink/5"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
        <button
          onClick={() => logout()}
          className="mt-1 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-ink/45 hover:bg-ink/5"
        >
          Sign Out
        </button>
      </nav>

      <div className="rounded-2xl bg-brand-500/10 p-4">
        <p className="font-display text-2xl tracking-wide text-brand-700">DESIGN SOMETHING NEW</p>
        <LinkButton to="/design" size="sm" className="mt-3">
          Start Designing
        </LinkButton>
      </div>
    </div>
  );
}

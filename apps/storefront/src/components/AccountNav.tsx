import { NavLink } from "react-router-dom";
import { useAuth } from "../features/auth/auth-context";

const links = [
  { to: "/account/orders", label: "Orders" },
  { to: "/account/addresses", label: "Addresses" },
];

export function AccountNav() {
  const { user, logout } = useAuth();
  return (
    <nav className="h-fit rounded-2xl border border-ink/10 p-4">
      <p className="mb-3 truncate text-sm font-semibold text-ink/70">{user?.username}</p>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-semibold ${
                  isActive ? "bg-ink text-paper" : "text-ink/70 hover:bg-ink/5"
                }`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
        <li>
          <button
            onClick={() => logout()}
            className="mt-2 block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink/50 hover:bg-ink/5"
          >
            Sign Out
          </button>
        </li>
      </ul>
    </nav>
  );
}

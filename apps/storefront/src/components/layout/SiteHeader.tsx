import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Container } from "../ui/Container";
import { useAuth } from "../../features/auth/auth-context";
import { useCart } from "../../features/cart/cart-api";

const navLinks = [
  { to: "/shop", label: "Shop All" },
  { to: "/shop?category=hoodies", label: "Hoodies" },
  { to: "/shop?category=shirts", label: "Tees" },
  { to: "/design", label: "Design Your Own" },
];

/** NavLink's default `isActive` only looks at pathname, so "/shop" and "/shop?category=…"
 *  would all light up together — compare the category query param too. */
function isNavLinkActive(linkTo: string, pathname: string, search: string): boolean {
  const [linkPath, linkQuery] = linkTo.split("?");
  if (linkPath !== pathname) return false;
  const linkCategory = new URLSearchParams(linkQuery ?? "").get("category");
  const currentCategory = new URLSearchParams(search).get("category");
  return linkCategory === currentCategory;
}

function CartIcon({ count }: { count: number }) {
  return (
    <span className="relative">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 8h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" strokeLinejoin="round" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { data: cart } = useCart();
  const location = useLocation();
  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/logo-color.png" alt="D-Shirtak" className="h-9 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active = isNavLinkActive(link.to, location.pathname, location.search);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-semibold uppercase tracking-wide transition-colors hover:text-brand-500 ${
                  active ? "text-brand-500" : "text-ink/80"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to={user ? "/account/orders" : "/login"}
            className="hidden text-sm font-semibold uppercase tracking-wide text-ink/80 hover:text-brand-500 sm:block"
          >
            {user ? user.username.split(" ")[0] : "Sign In"}
          </Link>
          <Link to="/cart" aria-label="Cart" className="text-ink hover:text-brand-500">
            <CartIcon count={itemCount} />
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            className="text-ink md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-ink/10 bg-white md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => {
              const active = isNavLinkActive(link.to, location.pathname, location.search);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-2 py-3 text-base font-semibold uppercase tracking-wide hover:bg-ink/5 ${
                    active ? "text-brand-500" : "text-ink/80"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <NavLink
              to={user ? "/account/orders" : "/login"}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-3 text-base font-semibold uppercase tracking-wide text-ink/80 hover:bg-ink/5"
            >
              {user ? "My Account" : "Sign In"}
            </NavLink>
          </Container>
        </div>
      )}
    </header>
  );
}

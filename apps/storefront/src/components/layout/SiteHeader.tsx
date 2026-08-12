import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Container } from "../ui/Container";
import { ShirtMark, Sparkle } from "../ui/ShirtMark";
import { useAuth } from "../../features/auth/auth-context";
import { useCart } from "../../features/cart/cart-api";

const navLinks = [
  { to: "/design", label: "Design Your Own", accent: true },
  { to: "/shop", label: "Shop" },
  { to: "/shop?type=READY_PRINTED", label: "Ready-Printed" },
];

function isNavLinkActive(linkTo: string, pathname: string, search: string): boolean {
  const [linkPath, linkQuery] = linkTo.split("?");
  if (linkPath !== pathname) return false;
  if (!linkQuery) return !search;
  const linkType = new URLSearchParams(linkQuery).get("type");
  return linkType === new URLSearchParams(search).get("type");
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { data: cart } = useCart();
  const location = useLocation();
  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-ink">
      <Container className="flex h-16 items-center gap-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="relative">
            <ShirtMark size={22} className="text-brand-500" />
            <Sparkle size={9} className="absolute -right-1.5 -top-1.5 animate-twinkle text-white" />
          </span>
          <span className="font-display text-[21px] leading-none tracking-wide text-white">D-SHIRTAK</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navLinks.map((link) => {
            const active = isNavLinkActive(link.to, location.pathname, location.search);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[13px] font-medium transition-colors ${
                  active || link.accent ? "text-brand-500" : "text-white/72 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Link
            to="/cart"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            className="relative flex items-center gap-1.5 text-white/85 hover:text-white"
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6h15l-1.5 9h-12L6 6Zm0 0-1-3H2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9.5" cy="19.5" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="17.5" cy="19.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold leading-none text-ink">
                {itemCount}
              </span>
            )}
            <span className="hidden text-[13px] font-medium sm:block">Cart</span>
          </Link>
          <Link
            to={user ? "/account/orders" : "/login"}
            className="hidden text-[13px] font-medium text-white/72 hover:text-white sm:block"
          >
            {user ? user.username.split(" ")[0] : "Account"}
          </Link>
          <Link
            to="/design"
            className="rounded-full bg-brand-500 px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-brand-400"
          >
            Start Designing
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            className="text-white md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
        <div className="border-t border-white/10 bg-ink md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => {
              const active = isNavLinkActive(link.to, location.pathname, location.search);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    active || link.accent ? "text-brand-500" : "text-white/80"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-white/80"
            >
              Cart ({itemCount})
            </Link>
            <Link
              to={user ? "/account/orders" : "/login"}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-white/80"
            >
              {user ? "My Account" : "Sign In"}
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}

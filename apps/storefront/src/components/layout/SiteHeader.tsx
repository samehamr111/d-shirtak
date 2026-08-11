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
    <header className="sticky top-0 z-40 bg-paper/0 px-4 pt-3.5 sm:px-6 lg:px-8">
      <Container className="!px-0">
        <div className="flex items-center gap-6 rounded-full bg-ink py-2.5 pl-5 pr-2.5 shadow-pop">
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

          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/cart"
              className="hidden text-[13px] font-medium text-white/72 hover:text-white sm:block"
            >
              Cart ({itemCount})
            </Link>
            <Link
              to={user ? "/account/orders" : "/login"}
              className="hidden text-[13px] font-medium text-white/72 hover:text-white sm:block"
            >
              {user ? user.username.split(" ")[0] : "Account"}
            </Link>
            <Link
              to="/design"
              className="rounded-full bg-brand-500 px-5 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-brand-400"
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
        </div>

        {open && (
          <div className="mt-2 rounded-2xl bg-ink p-4 shadow-pop md:hidden">
            <div className="flex flex-col gap-1">
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
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}

import { Link } from "react-router-dom";
import { Container } from "../ui/Container";
import { ShirtMark } from "../ui/ShirtMark";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-white">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <ShirtMark size={22} className="text-brand-500" />
            <span className="font-display text-[22px] leading-none tracking-wide text-ink">D-SHIRTAK</span>
          </div>
          <p className="mt-3 font-display text-3xl leading-tight tracking-wide text-ink">BE YOUR OWN DESIGNER.</p>
          <Link
            to="/design"
            className="mt-4 inline-block rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-ink hover:bg-brand-400"
          >
            Start Designing
          </Link>
        </div>

        <div>
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-ink">Design</p>
          <ul className="space-y-2 text-sm text-ink/60">
            <li><Link className="hover:text-brand-700" to="/design">Editor</Link></li>
            <li><Link className="hover:text-brand-700" to="/design">Design Library</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-ink">Shop</p>
          <ul className="space-y-2 text-sm text-ink/60">
            <li><Link className="hover:text-brand-700" to="/shop?category=hoodies">Hoodies</Link></li>
            <li><Link className="hover:text-brand-700" to="/shop?category=shirts">Tees</Link></li>
            <li><Link className="hover:text-brand-700" to="/shop?type=READY_PRINTED">Ready-Printed</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-ink">Account</p>
          <ul className="space-y-2 text-sm text-ink/60">
            <li><Link className="hover:text-brand-700" to="/account/orders">My Orders</Link></li>
            <li><Link className="hover:text-brand-700" to="/account/addresses">Addresses</Link></li>
            <li><Link className="hover:text-brand-700" to="/cart">Cart</Link></li>
          </ul>
        </div>
      </Container>

      <Container className="flex flex-col gap-2 border-t border-ink/10 py-6 text-xs text-ink/45 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} D-Shirtak. All designs belong to the people who made them.</span>
        <span className="font-mono text-[11px] tracking-wide">CASH ON DELIVERY, EVERYWHERE WE SHIP</span>
      </Container>
    </footer>
  );
}

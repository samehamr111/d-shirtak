import { Link } from "react-router-dom";
import { Container } from "../ui/Container";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-ink text-paper">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <img src="/logo-white.png" alt="D-Shirtak" className="h-8 w-auto" />
          <p className="mt-3 max-w-xs text-sm text-paper/60">
            Blank canvas hoodies and tees. Bring your own design, or start from ours — then wear it.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-paper/50">Shop</p>
          <ul className="mt-4 space-y-2 text-sm text-paper/80">
            <li><Link className="hover:text-brand-400" to="/shop?category=hoodies">Hoodies</Link></li>
            <li><Link className="hover:text-brand-400" to="/shop?category=shirts">Tees</Link></li>
            <li><Link className="hover:text-brand-400" to="/design">Design Your Own</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-paper/50">Account</p>
          <ul className="mt-4 space-y-2 text-sm text-paper/80">
            <li><Link className="hover:text-brand-400" to="/account/orders">My Orders</Link></li>
            <li><Link className="hover:text-brand-400" to="/account/addresses">Addresses</Link></li>
            <li><Link className="hover:text-brand-400" to="/cart">Cart</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-paper/50">Payment</p>
          <p className="mt-4 text-sm text-paper/80">Cash on delivery, everywhere we ship.</p>
        </div>
      </Container>

      <Container className="border-t border-paper/10 py-6 text-xs text-paper/50">
        © {new Date().getFullYear()} D-Shirtak. All designs belong to the people who made them.
      </Container>
    </footer>
  );
}

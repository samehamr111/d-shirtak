import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { ShirtMark, Sparkle } from "../components/ui/ShirtMark";
import { InlineSpinner } from "../components/ui/Spinner";
import { useAuth } from "../features/auth/auth-context";
import { describeError } from "../lib/errors";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from;
      navigate(from ? `${from.pathname}${from.search}` : "/account/orders", { replace: true });
    } catch (err) {
      setError(describeError(err, "Something went wrong. Try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="py-8">
    <div className="grid min-h-[600px] overflow-hidden rounded-[20px] border border-ink/[.08] bg-white shadow-[0_2px_10px_rgba(0,0,0,.08)] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative flex flex-col justify-between overflow-hidden p-9 sm:p-14">
        <div className="flex items-center gap-2.5">
          <span className="relative">
            <ShirtMark size={26} className="text-brand-500" />
            <Sparkle size={9} className="absolute -right-1.5 -top-1.5 animate-twinkle text-ink" />
          </span>
          <span className="font-display text-2xl tracking-wide">D-SHIRTAK</span>
        </div>
        <div className="py-10">
          <p className="font-display text-[clamp(2.6rem,6vw,5.4rem)] leading-[0.88] tracking-wide">
            BE YOUR OWN
            <br />
            <span className="text-brand-500">DESIGNER.</span>
          </p>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink/62">
            Your account keeps every order and every print file in one place.
          </p>
        </div>
        <div className="flex gap-5 font-mono text-[11px] text-ink/45">
          <span>Orders saved</span>
          <span>Reorder anytime</span>
          <span>Cash on delivery</span>
        </div>
        <ShirtMark size={220} className="pointer-events-none absolute -bottom-10 -right-10 text-ink/[.06]" />
      </div>

      <div className="border-t border-ink/[.07] p-9 sm:p-14 lg:border-l lg:border-t-0">
        <div className="mb-6 flex w-fit gap-1.5 rounded-full bg-paper p-1.5">
          <span className="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white">Sign in</span>
          <Link to="/signup" className="rounded-full px-5 py-2.5 text-xs font-semibold text-ink/55 hover:text-ink">
            Create account
          </Link>
        </div>
        <h1 className="font-display text-4xl tracking-wide">WELCOME BACK</h1>
        <p className="mt-1.5 text-sm text-ink/55">Sign in to see your orders and saved designs.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <InlineSpinner />}
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          No account yet?{" "}
          <Link to="/signup" className="font-semibold text-brand-700 hover:underline">
            Create one — it takes 20 seconds
          </Link>
        </p>
      </div>
    </div>
    </Container>
  );
}

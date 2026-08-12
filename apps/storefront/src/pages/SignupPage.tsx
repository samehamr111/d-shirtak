import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { ShirtMark, Sparkle } from "../components/ui/ShirtMark";
import { InlineSpinner } from "../components/ui/Spinner";
import { useAuth } from "../features/auth/auth-context";
import { describeError } from "../lib/errors";

const RESEND_COOLDOWN_SECONDS = 45;

export function SignupPage() {
  const { startSignup, verifySignup, resendSignupOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<"form" | "verify">("form");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  // Local Egyptian mobile digits only, no country code and no leading 0 -- e.g. typing either
  // "01012345678" or "1012345678" both normalize to "1012345678", combined with the fixed "+20"
  // prefix the customer never has to type themselves.
  const [phoneLocal, setPhoneLocal] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const phone = `+20${phoneLocal}`;

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  function goToDestination() {
    const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from;
    navigate(from ? `${from.pathname}${from.search}` : "/account/orders", { replace: true });
  }

  async function onSubmitDetails(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await startSignup({ username, email, phone, password });
      setStep("verify");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(describeError(err, "Something went wrong. Try again."));
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifySignup({ email, code });
      goToDestination();
    } catch (err) {
      setError(describeError(err, "That code didn't work. Try again."));
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setError(null);
    try {
      await resendSignupOtp(email);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(describeError(err, "Couldn't resend the code. Try again in a moment."));
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
            Make an account and every draft, order and print file stays right where you left it.
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
          <Link to="/login" className="rounded-full px-5 py-2.5 text-xs font-semibold text-ink/55 hover:text-ink">
            Sign in
          </Link>
          <span className="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white">Create account</span>
        </div>

        {step === "form" ? (
          <>
            <h1 className="font-display text-4xl tracking-wide">CREATE YOUR ACCOUNT</h1>
            <p className="mt-1.5 text-sm text-ink/55">Save your designs, track orders, checkout faster.</p>

            <form onSubmit={onSubmitDetails} className="mt-6 space-y-4">
              <Field label="Username" htmlFor="username">
                <Input id="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
              </Field>
              <Field label="Email" htmlFor="email">
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label="Phone number" htmlFor="phone">
                <div className="flex items-stretch gap-2">
                  <span className="flex shrink-0 items-center rounded-xl border border-ink/15 bg-paper px-3.5 text-sm font-semibold text-ink/70">
                    +20
                  </span>
                  <div className="flex-1">
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      required
                      placeholder="1012345678"
                      value={phoneLocal}
                      onChange={(e) => setPhoneLocal(e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 10))}
                    />
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-ink/45">We'll only use this to contact you about your order.</p>
              </Field>
              <Field label="Password" htmlFor="password">
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>

              {error && <p className="text-sm font-medium text-red-600">{error}</p>}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading && <InlineSpinner />}
                {loading ? "Sending code…" : "Continue"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-display text-4xl tracking-wide">CHECK YOUR EMAIL</h1>
            <p className="mt-1.5 text-sm text-ink/55">
              We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>.
            </p>

            <form onSubmit={onSubmitCode} className="mt-6 space-y-4">
              <Field label="Verification code" htmlFor="code">
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                />
              </Field>

              {error && <p className="text-sm font-medium text-red-600">{error}</p>}

              <Button type="submit" size="lg" className="w-full" disabled={loading || code.length !== 6}>
                {loading && <InlineSpinner />}
                {loading ? "Verifying…" : "Verify & Create Account"}
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setCode("");
                  setError(null);
                }}
                className="font-medium text-ink/55 hover:text-ink"
              >
                ← Use a different email
              </button>
              <button
                type="button"
                onClick={onResend}
                disabled={resendCooldown > 0}
                className="font-semibold text-brand-700 hover:underline disabled:cursor-not-allowed disabled:text-ink/35 disabled:no-underline"
              >
                {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
              </button>
            </div>
          </>
        )}

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
    </Container>
  );
}

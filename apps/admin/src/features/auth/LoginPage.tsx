import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../../lib/api-client";
import { useAuth } from "./auth-context";
import { Field, Input, PrimaryButton } from "../../components/form";

export function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") {
    const target = (location.state as { from?: string } | null)?.from ?? "/";
    return <Navigate to={target} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? "Invalid email or password." : err.message);
      } else if (err instanceof TypeError && /fetch/i.test(err.message)) {
        setError("Couldn't reach the server. Check your connection and try again.");
      } else if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink/5 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-6 shadow-pop">
        <img src="/logo-stacked.png" alt="D-Shirtak" className="mx-auto mb-4 h-14 w-auto" />
        <h1 className="mb-1 text-xl font-semibold text-ink">D-Shirtak Admin</h1>
        <p className="mb-5 text-sm text-ink/60">Sign in with your admin account.</p>

        {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <div className="space-y-3">
          <Field label="Email">
            <Input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </div>

        <PrimaryButton type="submit" disabled={submitting} className="mt-5 w-full">
          {submitting ? "Signing in…" : "Sign in"}
        </PrimaryButton>
      </form>
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { useAuth } from "../features/auth/auth-context";
import { describeError } from "../lib/errors";

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup({ username, email, password });
      navigate("/account/orders", { replace: true });
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-4xl">Create your account</h1>
        <p className="mt-2 text-sm text-ink/60">Save your designs, track orders, checkout faster.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field label="Username" htmlFor="username">
            <Input id="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </Container>
  );
}

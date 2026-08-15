import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  AuthResponseDto,
  AuthUserDto,
  LoginInput,
  SignupInput,
  SignupStartedDto,
  VerifySignupInput,
} from "@d-shirtak/shared";
import { api, setAccessToken } from "../../lib/api-client";
import { flushLocalCartToServer } from "../cart/guest-cart-sync";
import { localCart } from "../cart/local-cart";
import { trackLogin, trackSignUp } from "../../lib/analytics";

type AuthStatus = "loading" | "authenticated" | "guest";

interface AuthContextValue {
  user: AuthUserDto | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<void>;
  /** Step 1 of signup -- sends an OTP to the given email. No account exists yet. */
  startSignup: (input: SignupInput) => Promise<SignupStartedDto>;
  /** Step 2 of signup -- confirms the OTP and actually creates + logs into the account. */
  verifySignup: (input: VerifySignupInput) => Promise<void>;
  resendSignupOtp: (email: string) => Promise<SignupStartedDto>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    api
      .post<AuthResponseDto>("/auth/refresh")
      .then(async (res) => {
        if (cancelled) return;
        setAccessToken(res.accessToken);
        setUser(res.user);
        setStatus("authenticated");
        // Safety net: normally the local cart is empty by the time someone's session is already
        // authenticated, but if a past login/signup flush partially failed, whatever it left
        // behind is otherwise invisible (the UI only shows the server cart once authenticated) --
        // retry it here so it isn't stranded forever.
        if (localCart.getAll().length > 0) await flushLocalCartToServer().catch(() => undefined);
      })
      .catch(() => {
        if (!cancelled) setStatus("guest");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      login: async (input) => {
        const res = await api.post<AuthResponseDto>("/auth/login", input);
        setAccessToken(res.accessToken);
        setUser(res.user);
        setStatus("authenticated");
        trackLogin();
        // Best-effort: migrate anything they added to the cart before logging in. A failure here
        // (e.g. a variant went out of stock) shouldn't block the login that already succeeded.
        await flushLocalCartToServer().catch(() => undefined);
      },
      startSignup: (input) => api.post<SignupStartedDto>("/auth/signup", input),
      verifySignup: async (input) => {
        const res = await api.post<AuthResponseDto>("/auth/signup/verify", input);
        setAccessToken(res.accessToken);
        setUser(res.user);
        setStatus("authenticated");
        trackSignUp();
        await flushLocalCartToServer().catch(() => undefined);
      },
      resendSignupOtp: (email) => api.post<SignupStartedDto>("/auth/signup/resend", { email }),
      logout: async () => {
        await api.post("/auth/logout").catch(() => undefined);
        setAccessToken(null);
        setUser(null);
        setStatus("guest");
      },
    }),
    [user, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

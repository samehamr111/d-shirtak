import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthResponseDto, AuthUserDto, LoginInput, SignupInput } from "@d-shirtak/shared";
import { api, setAccessToken } from "../../lib/api-client";
import { flushLocalCartToServer } from "../cart/guest-cart-sync";

type AuthStatus = "loading" | "authenticated" | "guest";

interface AuthContextValue {
  user: AuthUserDto | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
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
      .then((res) => {
        if (cancelled) return;
        setAccessToken(res.accessToken);
        setUser(res.user);
        setStatus("authenticated");
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
        // Best-effort: migrate anything they added to the cart before logging in. A failure here
        // (e.g. a variant went out of stock) shouldn't block the login that already succeeded.
        await flushLocalCartToServer().catch(() => undefined);
      },
      signup: async (input) => {
        const res = await api.post<AuthResponseDto>("/auth/signup", input);
        setAccessToken(res.accessToken);
        setUser(res.user);
        setStatus("authenticated");
        await flushLocalCartToServer().catch(() => undefined);
      },
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

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthResponseDto, AuthUserDto, LoginInput } from "@d-shirtak/shared";
import { Role } from "@d-shirtak/shared";
import { api, setAccessToken } from "../../lib/api-client";

type AuthStatus = "loading" | "authenticated" | "guest";

interface AuthContextValue {
  user: AuthUserDto | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function assertAdmin(res: AuthResponseDto): void {
  if (res.user.role !== Role.ADMIN) {
    throw new Error("This account is not an admin account.");
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    api
      .post<AuthResponseDto>("/auth/refresh")
      .then((res) => {
        if (cancelled) return;
        if (res.user.role !== Role.ADMIN) {
          setAccessToken(null);
          setStatus("guest");
          return;
        }
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
        try {
          assertAdmin(res);
        } catch (err) {
          setAccessToken(null);
          await api.post("/auth/logout").catch(() => undefined);
          throw err;
        }
        setAccessToken(res.accessToken);
        setUser(res.user);
        setStatus("authenticated");
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

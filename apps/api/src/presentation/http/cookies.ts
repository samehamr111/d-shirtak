import type { Response } from "express";

const REFRESH_COOKIE_NAME = "d_shirtak_refresh";
const isProduction = process.env.NODE_ENV === "production";

export function setRefreshCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    // The storefront (d-shirtak.com) and this API (*.up.railway.app) are different registrable
    // domains in production, which makes every /auth/refresh call cross-site -- a SameSite=Lax
    // cookie is never attached to a cross-site fetch/XHR (only top-level GET navigations), so
    // this was silently dropping the refresh cookie on every request and making the refresh
    // flow 401 unconditionally. "None" is required for a cross-site cookie to be sent at all,
    // and browsers require Secure whenever SameSite=None is used (already true in production).
    // Local dev keeps "lax": localhost:5173 and localhost:4000 differ only by port, which counts
    // as the same site, so this bug never showed up there.
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    expires: expiresAt,
    path: "/auth",
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/auth" });
}

export function getRefreshCookie(cookies: Record<string, string | undefined>): string | undefined {
  return cookies[REFRESH_COOKIE_NAME];
}

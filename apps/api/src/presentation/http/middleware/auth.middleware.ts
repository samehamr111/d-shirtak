import type { NextFunction, Request, Response } from "express";
import type { Role } from "@d-shirtak/shared";
import { ForbiddenError, UnauthorizedError } from "../../../domain/errors.js";
import { services } from "../../../infrastructure/container.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new UnauthorizedError());
    return;
  }
  const token = header.slice("Bearer ".length);
  req.user = services.tokenService.verifyAccessToken(token);
  next();
}

/** Attaches req.user when a valid Bearer token is present, but never rejects the
 *  request when it's absent or invalid -- for routes guests are allowed to hit
 *  (e.g. the designer canvas, which doesn't require sign-in) that still want to
 *  attribute the action to a signed-in user when one exists. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      req.user = services.tokenService.verifyAccessToken(header.slice("Bearer ".length));
    } catch {
      // Invalid/expired token on an optional-auth route: proceed as a guest instead of failing.
    }
  }
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError());
      return;
    }
    next();
  };
}

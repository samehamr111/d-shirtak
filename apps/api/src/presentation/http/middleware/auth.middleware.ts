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

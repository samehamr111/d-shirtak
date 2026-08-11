import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import {
  ConflictError,
  ForbiddenError,
  InsufficientStockError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../../domain/errors.js";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: "Route not found" });
}

// Prisma codes for a database that's unreachable, timed out, or still resuming from an
// auto-pause (Azure SQL's free serverless tier suspends after inactivity) — worth telling
// the caller to just retry, instead of a bare "something went wrong".
const DB_UNAVAILABLE_CODES = new Set(["P1001", "P1002", "P1008", "P1017"]);

function describeZodIssues(err: ZodError): string {
  const first = err.issues[0];
  if (!first) return "Validation failed";
  const path = first.path.join(".");
  return path ? `${path}: ${first.message}` : first.message;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ message: describeZodIssues(err), issues: err.flatten() });
    return;
  }
  if (err instanceof ValidationError || err instanceof InsufficientStockError) {
    res.status(400).json({ message: err.message });
    return;
  }
  if (err instanceof UnauthorizedError) {
    res.status(401).json({ message: err.message });
    return;
  }
  if (err instanceof ForbiddenError) {
    res.status(403).json({ message: err.message });
    return;
  }
  if (err instanceof NotFoundError) {
    res.status(404).json({ message: err.message });
    return;
  }
  if (err instanceof ConflictError) {
    res.status(409).json({ message: err.message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const fields = (err.meta?.target as string[] | string | undefined) ?? "value";
      const field = Array.isArray(fields) ? fields.join(", ") : fields;
      console.error(err);
      res.status(409).json({ message: `That ${field} is already in use — try a different one.` });
      return;
    }
    if (err.code === "P2003") {
      const field = (err.meta?.field_name as string | undefined) ?? "reference";
      console.error(err);
      res.status(400).json({ message: `That ${field} doesn't refer to anything that exists — refresh and try again.` });
      return;
    }
    if (err.code === "P2025") {
      console.error(err);
      res.status(404).json({ message: "That record no longer exists — it may have already been deleted." });
      return;
    }
  }

  console.error(err);

  const isDbUnavailable =
    (err instanceof Prisma.PrismaClientKnownRequestError && DB_UNAVAILABLE_CODES.has(err.code)) ||
    err instanceof Prisma.PrismaClientInitializationError ||
    (err instanceof Error && err.name === "PrismaClientInitializationError");
  if (isDbUnavailable) {
    res.status(503).json({
      message:
        "Can't reach the database right now — this can happen right after a period of inactivity. Please try again in a few seconds.",
    });
    return;
  }

  const message = err instanceof Error && err.message ? err.message : "Unexpected server error";
  res.status(500).json({ message: `Unexpected server error: ${message}` });
}

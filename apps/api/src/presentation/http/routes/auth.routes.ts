import { Router } from "express";
import { loginSchema, signupSchema } from "@d-shirtak/shared";
import { appServices } from "../../../application/container.js";
import { asyncHandler } from "../async-handler.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { clearRefreshCookie, getRefreshCookie, setRefreshCookie } from "../cookies.js";
import { UnauthorizedError } from "../../../domain/errors.js";

export const authRouter = Router();

authRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const input = signupSchema.parse(req.body);
    const result = await appServices.auth.signup(input);
    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    res.status(201).json(result.response);
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const result = await appServices.auth.login(input);
    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    res.json(result.response);
  }),
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const raw = getRefreshCookie(req.cookies);
    if (!raw) throw new UnauthorizedError("No refresh token");
    const result = await appServices.auth.refresh(raw);
    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    res.json(result.response);
  }),
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const raw = getRefreshCookie(req.cookies);
    if (raw) await appServices.auth.logout(raw);
    clearRefreshCookie(res);
    res.status(204).send();
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(req.user);
  }),
);

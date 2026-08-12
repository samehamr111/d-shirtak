import { Router } from "express";
import { loginSchema, resendSignupOtpSchema, signupSchema, verifySignupSchema } from "@d-shirtak/shared";
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
    const result = await appServices.auth.startSignup(input);
    res.status(201).json(result);
  }),
);

authRouter.post(
  "/signup/resend",
  asyncHandler(async (req, res) => {
    const input = resendSignupOtpSchema.parse(req.body);
    const result = await appServices.auth.resendSignupOtp(input);
    res.json(result);
  }),
);

authRouter.post(
  "/signup/verify",
  asyncHandler(async (req, res) => {
    const input = verifySignupSchema.parse(req.body);
    const result = await appServices.auth.verifySignup(input);
    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    res.json(result.response);
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

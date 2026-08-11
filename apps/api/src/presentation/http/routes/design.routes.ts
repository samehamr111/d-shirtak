import { Router } from "express";
import { saveDesignSchema } from "@d-shirtak/shared";
import { appServices } from "../../../application/container.js";
import { asyncHandler } from "../async-handler.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { UnauthorizedError } from "../../../domain/errors.js";

export const designRouter = Router();
designRouter.use(requireAuth);

designRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    if (!req.user) throw new UnauthorizedError();
    const input = saveDesignSchema.parse(req.body);
    res.status(201).json(await appServices.design.save(req.user.sub, input));
  }),
);

import { Router } from "express";
import { blockUserSchema } from "@d-shirtak/shared";
import { appServices } from "../../../../application/container.js";
import { asyncHandler } from "../../async-handler.js";

export const adminUserRouter = Router();

adminUserRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await appServices.adminUser.listUsers());
  }),
);

adminUserRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    res.json(await appServices.adminUser.getStats());
  }),
);

adminUserRouter.patch(
  "/:id/block",
  asyncHandler(async (req, res) => {
    const input = blockUserSchema.parse(req.body);
    res.json(await appServices.adminUser.blockUser(req.params.id as string, input.reason));
  }),
);

adminUserRouter.patch(
  "/:id/unblock",
  asyncHandler(async (req, res) => {
    res.json(await appServices.adminUser.unblockUser(req.params.id as string));
  }),
);

import { Router } from "express";
import { updateOrderStatusSchema } from "@d-shirtak/shared";
import type { OrderStatus } from "@d-shirtak/shared";
import { appServices } from "../../../../application/container.js";
import { asyncHandler } from "../../async-handler.js";

export const adminOrderRouter = Router();

adminOrderRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === "string" ? (req.query.status as OrderStatus) : undefined;
    res.json(await appServices.adminOrder.listOrders(status));
  }),
);

adminOrderRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    res.json(await appServices.adminOrder.getStats());
  }),
);

adminOrderRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await appServices.adminOrder.getOrder(req.params.id as string));
  }),
);

adminOrderRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const input = updateOrderStatusSchema.parse(req.body);
    res.json(await appServices.adminOrder.updateStatus(req.params.id as string, input.status));
  }),
);

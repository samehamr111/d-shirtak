import { Router } from "express";
import { placeOrderSchema } from "@d-shirtak/shared";
import { appServices } from "../../../application/container.js";
import { asyncHandler } from "../async-handler.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { UnauthorizedError } from "../../../domain/errors.js";

export const orderRouter = Router();
orderRouter.use(requireAuth);

function userId(req: { user?: { sub: string } }): string {
  if (!req.user) throw new UnauthorizedError();
  return req.user.sub;
}

orderRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await appServices.order.listMyOrders(userId(req)));
  }),
);

orderRouter.get(
  "/:orderId",
  asyncHandler(async (req, res) => {
    res.json(await appServices.order.getMyOrder(userId(req), req.params.orderId as string));
  }),
);

orderRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = placeOrderSchema.parse(req.body);
    res.status(201).json(await appServices.order.placeOrder(userId(req), input));
  }),
);

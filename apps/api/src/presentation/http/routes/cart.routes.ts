import { Router } from "express";
import { addCartItemSchema, updateCartItemSchema } from "@d-shirtak/shared";
import { appServices } from "../../../application/container.js";
import { asyncHandler } from "../async-handler.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { UnauthorizedError } from "../../../domain/errors.js";

export const cartRouter = Router();
cartRouter.use(requireAuth);

function userId(req: { user?: { sub: string } }): string {
  if (!req.user) throw new UnauthorizedError();
  return req.user.sub;
}

cartRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await appServices.cart.getCart(userId(req)));
  }),
);

cartRouter.post(
  "/items",
  asyncHandler(async (req, res) => {
    const input = addCartItemSchema.parse(req.body);
    res.status(201).json(await appServices.cart.addItem(userId(req), input));
  }),
);

cartRouter.patch(
  "/items/:itemId",
  asyncHandler(async (req, res) => {
    const input = updateCartItemSchema.parse(req.body);
    res.json(await appServices.cart.updateItemQuantity(userId(req), req.params.itemId as string, input.quantity));
  }),
);

cartRouter.delete(
  "/items/:itemId",
  asyncHandler(async (req, res) => {
    res.json(await appServices.cart.removeItem(userId(req), req.params.itemId as string));
  }),
);

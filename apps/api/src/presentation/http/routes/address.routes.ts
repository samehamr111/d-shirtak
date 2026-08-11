import { Router } from "express";
import { addressSchema } from "@d-shirtak/shared";
import { appServices } from "../../../application/container.js";
import { asyncHandler } from "../async-handler.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { UnauthorizedError } from "../../../domain/errors.js";

export const addressRouter = Router();
addressRouter.use(requireAuth);

function userId(req: { user?: { sub: string } }): string {
  if (!req.user) throw new UnauthorizedError();
  return req.user.sub;
}

addressRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await appServices.address.list(userId(req)));
  }),
);

addressRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = addressSchema.parse(req.body);
    res.status(201).json(await appServices.address.create(userId(req), input));
  }),
);

addressRouter.patch(
  "/:addressId",
  asyncHandler(async (req, res) => {
    const input = addressSchema.partial().parse(req.body);
    res.json(await appServices.address.update(userId(req), req.params.addressId as string, input));
  }),
);

addressRouter.delete(
  "/:addressId",
  asyncHandler(async (req, res) => {
    await appServices.address.delete(userId(req), req.params.addressId as string);
    res.status(204).send();
  }),
);

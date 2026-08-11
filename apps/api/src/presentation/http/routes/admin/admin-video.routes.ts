import { Router } from "express";
import { createVideoJobSchema } from "@d-shirtak/shared";
import { appServices } from "../../../../application/container.js";
import { asyncHandler } from "../../async-handler.js";

export const adminVideoRouter = Router();

adminVideoRouter.get(
  "/",
  asyncHandler(async (_req, res) => res.json(await appServices.videoAd.listJobs())),
);

adminVideoRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createVideoJobSchema.parse(req.body);
    res.status(201).json(await appServices.videoAd.createJob(input));
  }),
);

adminVideoRouter.get(
  "/:id",
  asyncHandler(async (req, res) => res.json(await appServices.videoAd.getJob(req.params.id as string))),
);

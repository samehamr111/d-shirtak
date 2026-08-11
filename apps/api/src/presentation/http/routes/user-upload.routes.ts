import { Router } from "express";
import { appServices } from "../../../application/container.js";
import { asyncHandler } from "../async-handler.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { imageUpload } from "../upload.js";
import { UnauthorizedError, ValidationError } from "../../../domain/errors.js";

export const userUploadRouter = Router();
userUploadRouter.use(requireAuth);

userUploadRouter.post(
  "/",
  imageUpload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.user) throw new UnauthorizedError();
    if (!req.file) throw new ValidationError("A file is required");
    const created = await appServices.userUpload.track(req.user.sub, {
      buffer: req.file.buffer,
      originalName: req.file.originalname,
    });
    res.status(201).json(created);
  }),
);

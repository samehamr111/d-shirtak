import { Router } from "express";
import { appServices } from "../../../application/container.js";
import { asyncHandler } from "../async-handler.js";
import { optionalAuth } from "../middleware/auth.middleware.js";
import { imageUpload } from "../upload.js";
import { ValidationError } from "../../../domain/errors.js";

export const userUploadRouter = Router();

// Guests can use the designer canvas without signing in, so this must not require auth --
// it just attributes the upload to a user when one is signed in, and tracks it as anonymous
// otherwise (see UserUpload.userId, nullable for exactly this reason).
userUploadRouter.post(
  "/",
  optionalAuth,
  imageUpload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ValidationError("A file is required");
    const created = await appServices.userUpload.track(req.user?.sub ?? null, {
      buffer: req.file.buffer,
      originalName: req.file.originalname,
    });
    res.status(201).json(created);
  }),
);

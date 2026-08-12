import { Router } from "express";
import { designAssetMetaSchema, designCategorySchema, fontMetaSchema, promoteUserUploadSchema } from "@d-shirtak/shared";
import { appServices } from "../../../../application/container.js";
import { asyncHandler } from "../../async-handler.js";
import { fontUpload, imageUpload } from "../../upload.js";
import { ValidationError } from "../../../../domain/errors.js";

export const adminDesignLibraryRouter = Router();

// -- Fonts ---------------------------------------------------------
adminDesignLibraryRouter.get(
  "/fonts",
  asyncHandler(async (_req, res) => res.json(await appServices.adminDesignLibrary.listFonts())),
);
adminDesignLibraryRouter.post(
  "/fonts",
  fontUpload.single("file"),
  asyncHandler(async (req, res) => {
    const meta = fontMetaSchema.parse(req.body);
    if (!req.file) throw new ValidationError("A font file is required");
    const created = await appServices.adminDesignLibrary.uploadFont(meta, {
      buffer: req.file.buffer,
      originalName: req.file.originalname,
    });
    res.status(201).json(created);
  }),
);
adminDesignLibraryRouter.delete(
  "/fonts/:id",
  asyncHandler(async (req, res) => {
    await appServices.adminDesignLibrary.deleteFont(req.params.id as string);
    res.status(204).send();
  }),
);

// -- Design categories ---------------------------------------------------------
adminDesignLibraryRouter.get(
  "/design-categories",
  asyncHandler(async (_req, res) => res.json(await appServices.adminDesignLibrary.listDesignCategories())),
);
adminDesignLibraryRouter.post(
  "/design-categories",
  asyncHandler(async (req, res) => {
    const input = designCategorySchema.parse(req.body);
    res.status(201).json(await appServices.adminDesignLibrary.createDesignCategory(input));
  }),
);
adminDesignLibraryRouter.delete(
  "/design-categories/:id",
  asyncHandler(async (req, res) => {
    await appServices.adminDesignLibrary.deleteDesignCategory(req.params.id as string);
    res.status(204).send();
  }),
);

// -- Design assets (curated library) --------------------------------------
adminDesignLibraryRouter.get(
  "/design-assets",
  asyncHandler(async (_req, res) => res.json(await appServices.adminDesignLibrary.listDesignAssets())),
);
adminDesignLibraryRouter.post(
  "/design-assets",
  imageUpload.single("file"),
  asyncHandler(async (req, res) => {
    const meta = designAssetMetaSchema.parse(req.body);
    if (!req.file) throw new ValidationError("An image file is required");
    const created = await appServices.adminDesignLibrary.uploadDesignAsset(meta, {
      buffer: req.file.buffer,
      originalName: req.file.originalname,
    });
    res.status(201).json(created);
  }),
);
adminDesignLibraryRouter.post(
  "/design-assets/:id/model-shots",
  imageUpload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ValidationError("An image file is required");
    const updated = await appServices.adminDesignLibrary.addDesignAssetModelShot(req.params.id as string, {
      buffer: req.file.buffer,
      originalName: req.file.originalname,
    });
    res.status(201).json(updated);
  }),
);
adminDesignLibraryRouter.delete(
  "/design-assets/:id/model-shots/:shotId",
  asyncHandler(async (req, res) => {
    const updated = await appServices.adminDesignLibrary.deleteDesignAssetModelShot(
      req.params.id as string,
      req.params.shotId as string,
    );
    res.json(updated);
  }),
);
adminDesignLibraryRouter.delete(
  "/design-assets/:id",
  asyncHandler(async (req, res) => {
    await appServices.adminDesignLibrary.deleteDesignAsset(req.params.id as string);
    res.status(204).send();
  }),
);

// -- Tracked customer/admin uploads ---------------------------------------
adminDesignLibraryRouter.get(
  "/user-uploads",
  asyncHandler(async (_req, res) => res.json(await appServices.adminDesignLibrary.listUserUploads())),
);
adminDesignLibraryRouter.post(
  "/user-uploads/:id/promote",
  asyncHandler(async (req, res) => {
    const input = promoteUserUploadSchema.parse(req.body);
    res.status(201).json(await appServices.adminDesignLibrary.promoteUserUpload(req.params.id as string, input));
  }),
);

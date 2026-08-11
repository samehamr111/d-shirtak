import { Router } from "express";
import {
  createCategorySchema,
  createColorSchema,
  createSizeSchema,
  productSchema,
  productSizeSchema,
  updateStoreSettingsSchema,
  variantStockSchema,
} from "@d-shirtak/shared";
import { appServices } from "../../../../application/container.js";
import { asyncHandler } from "../../async-handler.js";
import { imageUpload } from "../../upload.js";
import { ValidationError } from "../../../../domain/errors.js";

export const adminCatalogRouter = Router();

// -- Categories ---------------------------------------------------------
adminCatalogRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => res.json(await appServices.adminCatalog.listCategories())),
);
adminCatalogRouter.post(
  "/categories",
  asyncHandler(async (req, res) => {
    const input = createCategorySchema.parse(req.body);
    res.status(201).json(await appServices.adminCatalog.createCategory(input));
  }),
);
adminCatalogRouter.patch(
  "/categories/:id",
  asyncHandler(async (req, res) => {
    const input = createCategorySchema.partial().parse(req.body);
    res.json(await appServices.adminCatalog.updateCategory(req.params.id as string, input));
  }),
);
adminCatalogRouter.delete(
  "/categories/:id",
  asyncHandler(async (req, res) => {
    await appServices.adminCatalog.deleteCategory(req.params.id as string);
    res.status(204).send();
  }),
);

// -- Colors ---------------------------------------------------------
adminCatalogRouter.get(
  "/colors",
  asyncHandler(async (_req, res) => res.json(await appServices.adminCatalog.listColors())),
);
adminCatalogRouter.post(
  "/colors",
  asyncHandler(async (req, res) => {
    const input = createColorSchema.parse(req.body);
    res.status(201).json(await appServices.adminCatalog.createColor(input));
  }),
);
adminCatalogRouter.delete(
  "/colors/:id",
  asyncHandler(async (req, res) => {
    await appServices.adminCatalog.deleteColor(req.params.id as string);
    res.status(204).send();
  }),
);

// -- Sizes ---------------------------------------------------------
adminCatalogRouter.get(
  "/sizes",
  asyncHandler(async (_req, res) => res.json(await appServices.adminCatalog.listSizes())),
);
adminCatalogRouter.post(
  "/sizes",
  asyncHandler(async (req, res) => {
    const input = createSizeSchema.parse(req.body);
    res.status(201).json(await appServices.adminCatalog.createSize(input));
  }),
);
adminCatalogRouter.delete(
  "/sizes/:id",
  asyncHandler(async (req, res) => {
    await appServices.adminCatalog.deleteSize(req.params.id as string);
    res.status(204).send();
  }),
);

// -- Products ---------------------------------------------------------
adminCatalogRouter.get(
  "/products",
  asyncHandler(async (_req, res) => res.json(await appServices.adminCatalog.listProducts())),
);
adminCatalogRouter.get(
  "/products/:id",
  asyncHandler(async (req, res) => res.json(await appServices.adminCatalog.getProduct(req.params.id as string))),
);
adminCatalogRouter.post(
  "/products",
  asyncHandler(async (req, res) => {
    const input = productSchema.parse(req.body);
    res.status(201).json(await appServices.adminCatalog.createProduct(input));
  }),
);
adminCatalogRouter.patch(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const input = productSchema.partial().parse(req.body);
    res.json(await appServices.adminCatalog.updateProduct(req.params.id as string, input));
  }),
);
adminCatalogRouter.delete(
  "/products/:id",
  asyncHandler(async (req, res) => {
    await appServices.adminCatalog.deleteProduct(req.params.id as string);
    res.status(204).send();
  }),
);

// -- Product colors (mockup images) --------------------------------------
adminCatalogRouter.post(
  "/products/:id/colors",
  imageUpload.fields([{ name: "front", maxCount: 1 }, { name: "back", maxCount: 1 }]),
  asyncHandler(async (req, res) => {
    const colorId = typeof req.body.colorId === "string" ? req.body.colorId : undefined;
    if (!colorId) throw new ValidationError("colorId is required");
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const front = files?.front?.[0];
    const back = files?.back?.[0];
    if (!front || !back) throw new ValidationError("front and back images are both required");

    const result = await appServices.adminCatalog.addProductColor(
      req.params.id as string,
      colorId,
      { buffer: front.buffer, originalName: front.originalname },
      { buffer: back.buffer, originalName: back.originalname },
    );
    res.status(201).json(result);
  }),
);
adminCatalogRouter.delete(
  "/products/:id/colors/:productColorId",
  asyncHandler(async (req, res) => {
    res.json(await appServices.adminCatalog.removeProductColor(req.params.id as string, req.params.productColorId as string));
  }),
);

// -- Product colors (on-model shots, added after the color already exists) ----------------
adminCatalogRouter.patch(
  "/products/:id/colors/:productColorId/model-images",
  imageUpload.fields([{ name: "modelFront", maxCount: 1 }, { name: "modelBack", maxCount: 1 }]),
  asyncHandler(async (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const modelFront = files?.modelFront?.[0];
    const modelBack = files?.modelBack?.[0];
    if (!modelFront && !modelBack) throw new ValidationError("At least one of modelFront or modelBack is required");

    const result = await appServices.adminCatalog.updateProductColorModelImages(
      req.params.id as string,
      req.params.productColorId as string,
      modelFront ? { buffer: modelFront.buffer, originalName: modelFront.originalname } : undefined,
      modelBack ? { buffer: modelBack.buffer, originalName: modelBack.originalname } : undefined,
    );
    res.json(result);
  }),
);

// -- Product sizes (print area + measurements) -----------------------------
adminCatalogRouter.post(
  "/products/:id/sizes",
  asyncHandler(async (req, res) => {
    const input = productSizeSchema.parse(req.body);
    res.status(201).json(await appServices.adminCatalog.addProductSize(req.params.id as string, input));
  }),
);
adminCatalogRouter.patch(
  "/products/:id/sizes/:productSizeId",
  asyncHandler(async (req, res) => {
    const input = productSizeSchema.partial().parse(req.body);
    res.json(
      await appServices.adminCatalog.updateProductSize(req.params.id as string, req.params.productSizeId as string, input),
    );
  }),
);
adminCatalogRouter.delete(
  "/products/:id/sizes/:productSizeId",
  asyncHandler(async (req, res) => {
    res.json(await appServices.adminCatalog.removeProductSize(req.params.id as string, req.params.productSizeId as string));
  }),
);

// -- Variants (stock) ------------------------------------------------------
adminCatalogRouter.post(
  "/products/:id/variants",
  asyncHandler(async (req, res) => {
    const input = variantStockSchema.parse(req.body);
    res.status(201).json(await appServices.adminCatalog.addVariant(req.params.id as string, input));
  }),
);
adminCatalogRouter.patch(
  "/products/:id/variants/:variantId",
  asyncHandler(async (req, res) => {
    const input = variantStockSchema.partial().parse(req.body);
    res.json(await appServices.adminCatalog.updateVariant(req.params.id as string, req.params.variantId as string, input));
  }),
);
adminCatalogRouter.delete(
  "/products/:id/variants/:variantId",
  asyncHandler(async (req, res) => {
    res.json(await appServices.adminCatalog.removeVariant(req.params.id as string, req.params.variantId as string));
  }),
);

// -- Store settings ---------------------------------------------------------
adminCatalogRouter.get(
  "/settings",
  asyncHandler(async (_req, res) => res.json(await appServices.adminCatalog.getSettings())),
);
adminCatalogRouter.patch(
  "/settings",
  asyncHandler(async (req, res) => {
    const input = updateStoreSettingsSchema.parse(req.body);
    res.json(await appServices.adminCatalog.updateSettings(input));
  }),
);

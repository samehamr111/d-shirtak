import { Router } from "express";
import { appServices } from "../../../application/container.js";
import { asyncHandler } from "../async-handler.js";

export const catalogRouter = Router();

catalogRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    res.json(await appServices.catalog.listCategories());
  }),
);

catalogRouter.get(
  "/colors",
  asyncHandler(async (_req, res) => {
    res.json(await appServices.catalog.listColors());
  }),
);

catalogRouter.get(
  "/sizes",
  asyncHandler(async (_req, res) => {
    res.json(await appServices.catalog.listSizes());
  }),
);

catalogRouter.get(
  "/fonts",
  asyncHandler(async (_req, res) => {
    res.json(await appServices.catalog.listFonts());
  }),
);

catalogRouter.get(
  "/design-categories",
  asyncHandler(async (_req, res) => {
    res.json(await appServices.catalog.listDesignCategories());
  }),
);

catalogRouter.get(
  "/design-assets",
  asyncHandler(async (req, res) => {
    const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
    res.json(await appServices.catalog.listDesignAssets(categoryId));
  }),
);

catalogRouter.get(
  "/products",
  asyncHandler(async (req, res) => {
    const categorySlug = typeof req.query.category === "string" ? req.query.category : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    res.json(await appServices.catalog.listProducts({ categorySlug, search }));
  }),
);

catalogRouter.get(
  "/products/:slug",
  asyncHandler(async (req, res) => {
    res.json(await appServices.catalog.getProductBySlug(req.params.slug as string));
  }),
);

catalogRouter.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    res.json(await appServices.catalog.getSettings());
  }),
);

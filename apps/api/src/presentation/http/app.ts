import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import { env } from "../../infrastructure/config/env.js";
import { requireAuth, requireRole } from "./middleware/auth.middleware.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { catalogRouter } from "./routes/catalog.routes.js";
import { designRouter } from "./routes/design.routes.js";
import { cartRouter } from "./routes/cart.routes.js";
import { addressRouter } from "./routes/address.routes.js";
import { orderRouter } from "./routes/order.routes.js";
import { userUploadRouter } from "./routes/user-upload.routes.js";
import { adminCatalogRouter } from "./routes/admin/admin-catalog.routes.js";
import { adminDesignLibraryRouter } from "./routes/admin/admin-design-library.routes.js";
import { adminOrderRouter } from "./routes/admin/admin-order.routes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  // Every uploaded file gets a fresh random name and is never overwritten (see
  // LocalDiskFileStorage/R2FileStorage) -- safe to cache aggressively and forever.
  app.use("/uploads", express.static(path.resolve(env.UPLOADS_DIR), { maxAge: "1y", immutable: true }));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/auth", authRouter);
  app.use("/catalog", catalogRouter);
  app.use("/designs", designRouter);
  app.use("/cart", cartRouter);
  app.use("/addresses", addressRouter);
  app.use("/orders", orderRouter);
  app.use("/user-uploads", userUploadRouter);

  app.use("/admin", requireAuth, requireRole("ADMIN"));
  app.use("/admin/catalog", adminCatalogRouter);
  app.use("/admin/design-library", adminDesignLibraryRouter);
  app.use("/admin/orders", adminOrderRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

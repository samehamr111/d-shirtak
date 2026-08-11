import { Router } from "express";
import type { R2FileStorage } from "../../../infrastructure/storage/r2-file-storage.js";
import { asyncHandler } from "../async-handler.js";

/** Streams R2 objects through the API's own domain instead of the R2 public URL, so image
 *  loads never need browser-side CORS at all (this route's response already carries the app's
 *  normal CORS headers via the global cors() middleware, same as every other endpoint). */
export function createUploadsProxyRouter(storage: R2FileStorage): Router {
  const router = Router();

  router.get(
    "/*",
    asyncHandler(async (req, res) => {
      const relativePath = req.params[0];
      if (!relativePath) {
        res.status(404).end();
        return;
      }
      const object = await storage.getObject(relativePath);
      if (!object) {
        res.status(404).end();
        return;
      }
      res.setHeader("Content-Type", object.contentType ?? "application/octet-stream");
      if (object.contentLength !== undefined) res.setHeader("Content-Length", String(object.contentLength));
      if (object.etag) res.setHeader("ETag", object.etag);
      // Every object is saved under a fresh random key and never overwritten -- safe to cache forever.
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      object.body.pipe(res);
    }),
  );

  return router;
}

import { fileURLToPath } from "node:url";
import path from "node:path";
import { promises as fs } from "node:fs";
import os from "node:os";
import { randomUUID } from "node:crypto";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { ProductCommercialProps } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const entryPoint = path.join(__dirname, "index.ts");

/** Bundling is slow (webpack) -- do it once per process and reuse the bundle for every render. */
let bundleLocationPromise: Promise<string> | null = null;
function getBundleLocation(): Promise<string> {
  if (!bundleLocationPromise) {
    bundleLocationPromise = bundle({ entryPoint });
  }
  return bundleLocationPromise;
}

export async function renderProductCommercial(props: ProductCommercialProps): Promise<Buffer> {
  const serveUrl = await getBundleLocation();
  // Remotion's Node API takes untyped `Record<string, unknown>` input props (the composition's
  // own `calculateMetadata`/`component` re-establish the real type on the render side).
  const inputProps = props as unknown as Record<string, unknown>;

  const composition = await selectComposition({
    serveUrl,
    id: "ProductCommercial",
    inputProps,
  });

  const outputLocation = path.join(os.tmpdir(), `d-shirtak-commercial-${randomUUID()}.mp4`);

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation,
    inputProps,
  });

  const buffer = await fs.readFile(outputLocation);
  await fs.rm(outputLocation, { force: true });
  return buffer;
}

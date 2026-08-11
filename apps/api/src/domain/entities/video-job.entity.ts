export type VideoJobStatus = "PENDING" | "RENDERING" | "DONE" | "FAILED";

/** Fully-resolved inputs for a render -- captured once at job creation so the render step never
 *  needs to re-look-up catalog state that might have changed since. */
export interface VideoJobSpec {
  productName: string;
  priceLabel: string;
  imageUrls: string[];
  scriptText: string;
}

export interface VideoJob {
  id: string;
  status: VideoJobStatus;
  /** Raw JSON string of VideoJobSpec -- parsed at the application layer, same convention as
   *  Design.canvasJson. */
  specJson: string;
  videoUrl: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

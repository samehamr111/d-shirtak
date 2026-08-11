import { z } from "zod";

export const productCommercialSchema = z.object({
  productName: z.string(),
  priceLabel: z.string(),
  imageUrls: z.array(z.string()),
  audioUrl: z.string(),
  audioDurationInSeconds: z.number(),
  ctaText: z.string(),
});

export type ProductCommercialProps = z.infer<typeof productCommercialSchema>;

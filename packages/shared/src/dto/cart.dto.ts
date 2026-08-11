import { z } from "zod";

export const addCartItemSchema = z.object({
  productVariantId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  frontDesignId: z.string().min(1).optional(),
  backDesignId: z.string().min(1).optional(),
});
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(20),
});
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export interface CartItemDto {
  id: string;
  productVariantId: string;
  productName: string;
  colorName: string;
  sizeName: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  stockQuantity: number;
  frontDesignPreviewUrl: string | null;
  backDesignPreviewUrl: string | null;
}

export interface CartDto {
  items: CartItemDto[];
  subtotal: number;
}

export interface CartItem {
  id: string;
  userId: string;
  productVariantId: string;
  quantity: number;
  frontDesignId: string | null;
  backDesignId: string | null;
  createdAt: Date;
}

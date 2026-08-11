export type DesignSide = "FRONT" | "BACK";

/**
 * One side of one customer's customization of one product variant. Immutable once created —
 * editing a saved design must create a new Design row so anything referencing a designId
 * (cart items, order items) keeps pointing at exactly what the customer approved.
 */
export interface Design {
  id: string;
  ownerUserId: string;
  productVariantId: string;
  side: DesignSide;
  canvasJson: string;
  previewImageUrl: string;
  createdAt: Date;
}

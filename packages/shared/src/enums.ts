export const Role = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const FontLanguage = {
  EN: "EN",
  AR: "AR",
} as const;
export type FontLanguage = (typeof FontLanguage)[keyof typeof FontLanguage];

export const DesignSide = {
  FRONT: "FRONT",
  BACK: "BACK",
} as const;
export type DesignSide = (typeof DesignSide)[keyof typeof DesignSide];

export const OrderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentMethod = {
  COD: "COD",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

/** The garment silhouette a product uses — drives which torso-frame guide (see canvas-frame.ts)
 *  applies when centering print areas or aligning a mockup photo. Extend as new shapes are added
 *  (e.g. TANK, LONGSLEEVE), each paired with its own TORSO_FRAME entry. */
export const GarmentType = {
  TEE: "TEE",
  HOODIE: "HOODIE",
} as const;
export type GarmentType = (typeof GarmentType)[keyof typeof GarmentType];

/** Whether a product is a blank canvas the customer designs themselves, or already has a
 *  fixed design printed on it (sold as-is, no designer step). */
export const ProductType = {
  CUSTOMIZABLE: "CUSTOMIZABLE",
  READY_PRINTED: "READY_PRINTED",
} as const;
export type ProductType = (typeof ProductType)[keyof typeof ProductType];

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

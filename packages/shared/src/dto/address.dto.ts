import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(1).max(40).default("Home"),
  fullName: z.string().min(2).max(80),
  phone: z.string().min(6).max(20),
  line1: z.string().min(2).max(120),
  line2: z.string().max(120).optional(),
  city: z.string().min(1).max(60),
  governorate: z.string().min(1).max(60),
  postalCode: z.string().max(20).optional(),
  country: z.string().min(2).max(60).default("Egypt"),
  isDefault: z.boolean().optional().default(false),
});
export type AddressInput = z.infer<typeof addressSchema>;

export interface AddressDto extends AddressInput {
  id: string;
}

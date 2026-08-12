import type { Role } from "@d-shirtak/shared";

export interface User {
  id: string;
  username: string;
  email: string;
  /// Egyptian mobile, e.g. "+201012345678". Nullable: mandatory for new signups, but null for
  /// accounts created before this field existed.
  phone: string | null;
  passwordHash: string;
  role: Role;
  isBlocked: boolean;
  blockedReason: string | null;
  blockedAt: Date | null;
  createdAt: Date;
}

/** A customer with how many orders they've placed -- the admin Users list view. */
export interface UserWithOrderCount extends User {
  orderCount: number;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  governorate: string;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
}

export interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

import path from "node:path";
import { env } from "./config/env.js";
import { prisma } from "./prisma/client.js";
import { PrismaUserRepository } from "./prisma/repositories/user.repository.prisma.js";
import { PrismaAddressRepository } from "./prisma/repositories/address.repository.prisma.js";
import { PrismaRefreshTokenRepository } from "./prisma/repositories/refresh-token.repository.prisma.js";
import {
  PrismaCategoryRepository,
  PrismaColorRepository,
  PrismaSizeRepository,
} from "./prisma/repositories/lookup.repository.prisma.js";
import {
  PrismaProductColorRepository,
  PrismaProductRepository,
  PrismaProductSizeRepository,
  PrismaProductVariantRepository,
} from "./prisma/repositories/product.repository.prisma.js";
import { PrismaFontRepository } from "./prisma/repositories/font.repository.prisma.js";
import {
  PrismaDesignAssetRepository,
  PrismaDesignCategoryRepository,
} from "./prisma/repositories/design-library.repository.prisma.js";
import { PrismaDesignRepository } from "./prisma/repositories/design.repository.prisma.js";
import { PrismaCartRepository } from "./prisma/repositories/cart.repository.prisma.js";
import { PrismaOrderRepository } from "./prisma/repositories/order.repository.prisma.js";
import { PrismaUserUploadRepository } from "./prisma/repositories/user-upload.repository.prisma.js";
import { PrismaStoreSettingsRepository } from "./prisma/repositories/store-settings.repository.prisma.js";
import { PrismaPendingSignupRepository } from "./prisma/repositories/pending-signup.repository.prisma.js";
import { LocalDiskFileStorage } from "./storage/local-disk-file-storage.js";
import { R2FileStorage } from "./storage/r2-file-storage.js";
import { BcryptPasswordHasher } from "./auth/bcrypt-password-hasher.js";
import { JwtTokenService } from "./auth/jwt-token-service.js";
import { ConsoleEmailSender } from "./email/console-email-sender.js";
import { ResendEmailSender } from "./email/resend-email-sender.js";
import type { IFileStorage } from "../domain/ports/file-storage.port.js";
import type { IEmailSender } from "../domain/ports/email.port.js";

export const repositories = {
  user: new PrismaUserRepository(prisma),
  address: new PrismaAddressRepository(prisma),
  refreshToken: new PrismaRefreshTokenRepository(prisma),
  category: new PrismaCategoryRepository(prisma),
  color: new PrismaColorRepository(prisma),
  size: new PrismaSizeRepository(prisma),
  product: new PrismaProductRepository(prisma),
  productColor: new PrismaProductColorRepository(prisma),
  productSize: new PrismaProductSizeRepository(prisma),
  productVariant: new PrismaProductVariantRepository(prisma),
  font: new PrismaFontRepository(prisma),
  designCategory: new PrismaDesignCategoryRepository(prisma),
  designAsset: new PrismaDesignAssetRepository(prisma),
  design: new PrismaDesignRepository(prisma),
  cart: new PrismaCartRepository(prisma),
  order: new PrismaOrderRepository(prisma),
  userUpload: new PrismaUserUploadRepository(prisma),
  storeSettings: new PrismaStoreSettingsRepository(prisma),
  pendingSignup: new PrismaPendingSignupRepository(prisma),
};

// R2 kicks in the moment all four credentials are set; otherwise local disk (dev default).
// Same IFileStorage contract either way -- nothing else in the app needs to know which one is live.
//
// The public URL R2FileStorage hands back always points at this API's own domain
// (PUBLIC_UPLOADS_BASE_URL), not R2's public bucket URL -- app.ts proxies /uploads through to R2
// server-to-server when this backend is active, which sidesteps browser CORS entirely instead of
// depending on R2's public-bucket CORS behavior (unreliable for some clients/edges in practice).
function createFileStorage(): IFileStorage {
  if (env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET_NAME) {
    return new R2FileStorage(
      env.R2_ACCOUNT_ID,
      env.R2_BUCKET_NAME,
      env.PUBLIC_UPLOADS_BASE_URL,
      env.R2_ACCESS_KEY_ID,
      env.R2_SECRET_ACCESS_KEY,
    );
  }
  return new LocalDiskFileStorage(path.resolve(env.UPLOADS_DIR), env.PUBLIC_UPLOADS_BASE_URL);
}

// Resend kicks in once both RESEND_API_KEY and EMAIL_FROM_ADDRESS are set; otherwise OTP codes
// are logged to the server console (dev fallback) so signup still works end-to-end locally
// without needing a real provider configured.
function createEmailSender(): IEmailSender {
  if (env.RESEND_API_KEY && env.EMAIL_FROM_ADDRESS) {
    return new ResendEmailSender(env.RESEND_API_KEY, env.EMAIL_FROM_ADDRESS);
  }
  return new ConsoleEmailSender();
}

export const services = {
  fileStorage: createFileStorage(),
  passwordHasher: new BcryptPasswordHasher(),
  tokenService: new JwtTokenService(env.JWT_ACCESS_SECRET, env.JWT_ACCESS_TTL, env.JWT_REFRESH_TTL_DAYS),
  emailSender: createEmailSender(),
};

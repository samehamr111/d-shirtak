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
import { PrismaVideoJobRepository } from "./prisma/repositories/video-job.repository.prisma.js";
import { LocalDiskFileStorage } from "./storage/local-disk-file-storage.js";
import { BcryptPasswordHasher } from "./auth/bcrypt-password-hasher.js";
import { JwtTokenService } from "./auth/jwt-token-service.js";

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
  videoJob: new PrismaVideoJobRepository(prisma),
};

export const services = {
  fileStorage: new LocalDiskFileStorage(path.resolve(env.UPLOADS_DIR), env.PUBLIC_UPLOADS_BASE_URL),
  passwordHasher: new BcryptPasswordHasher(),
  tokenService: new JwtTokenService(env.JWT_ACCESS_SECRET, env.JWT_ACCESS_TTL, env.JWT_REFRESH_TTL_DAYS),
};

import { repositories, services } from "../infrastructure/container.js";
import { AuthService } from "./auth/auth.service.js";
import { AddressService } from "./address/address.service.js";
import { CatalogService } from "./catalog/catalog.service.js";
import { DesignService } from "./design/design.service.js";
import { CartService } from "./cart/cart.service.js";
import { OrderService } from "./order/order.service.js";
import { AdminCatalogService } from "./admin/admin-catalog.service.js";
import { AdminDesignLibraryService } from "./admin/admin-design-library.service.js";
import { AdminOrderService } from "./admin/admin-order.service.js";
import { UserUploadService } from "./uploads/user-upload.service.js";

export const appServices = {
  auth: new AuthService(
    repositories.user,
    repositories.refreshToken,
    services.passwordHasher,
    services.tokenService,
    repositories.pendingSignup,
    services.emailSender,
  ),
  address: new AddressService(repositories.address),
  catalog: new CatalogService(
    repositories.category,
    repositories.color,
    repositories.size,
    repositories.product,
    repositories.font,
    repositories.designCategory,
    repositories.designAsset,
    repositories.storeSettings,
  ),
  design: new DesignService(repositories.design, repositories.productVariant, services.fileStorage),
  cart: new CartService(
    repositories.cart,
    repositories.productVariant,
    repositories.product,
    repositories.design,
    repositories.storeSettings,
  ),
  order: new OrderService(
    repositories.order,
    repositories.cart,
    repositories.productVariant,
    repositories.product,
    repositories.address,
    repositories.design,
    repositories.storeSettings,
  ),
  adminCatalog: new AdminCatalogService(
    repositories.category,
    repositories.color,
    repositories.size,
    repositories.product,
    repositories.productColor,
    repositories.productSize,
    repositories.productVariant,
    repositories.storeSettings,
    services.fileStorage,
  ),
  adminDesignLibrary: new AdminDesignLibraryService(
    repositories.font,
    repositories.designCategory,
    repositories.designAsset,
    repositories.userUpload,
    repositories.user,
    services.fileStorage,
  ),
  adminOrder: new AdminOrderService(
    repositories.order,
    repositories.design,
    repositories.productVariant,
    repositories.product,
    repositories.designAsset,
    services.fileStorage,
  ),
  userUpload: new UserUploadService(repositories.userUpload, repositories.user, services.fileStorage),
};

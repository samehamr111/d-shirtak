import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";

// Split out of the main bundle -- RootLayout wraps the whole route tree in one Suspense
// boundary, so every one of these just needs to exist as its own chunk; only HomePage (the
// first-visit landing page) and NotFoundPage (trivial size) stay in the main bundle.
const ShopPage = lazy(() => import("./pages/ShopPage").then((m) => ({ default: m.ShopPage })));
const ProductPage = lazy(() => import("./pages/ProductPage").then((m) => ({ default: m.ProductPage })));
const DesignPickerPage = lazy(() => import("./pages/DesignPickerPage").then((m) => ({ default: m.DesignPickerPage })));
// Fabric.js is heavy — keep it out of the main bundle and only fetch it when someone
// actually opens the designer.
const DesignerPage = lazy(() => import("./pages/DesignerPage").then((m) => ({ default: m.DesignerPage })));
const CartPage = lazy(() => import("./pages/CartPage").then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import("./pages/SignupPage").then((m) => ({ default: m.SignupPage })));
const AccountOrdersPage = lazy(() => import("./pages/AccountOrdersPage").then((m) => ({ default: m.AccountOrdersPage })));
const AccountOrderDetailPage = lazy(() =>
  import("./pages/AccountOrderDetailPage").then((m) => ({ default: m.AccountOrderDetailPage })),
);
const AccountAddressesPage = lazy(() =>
  import("./pages/AccountAddressesPage").then((m) => ({ default: m.AccountAddressesPage })),
);

export function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="shop/:slug" element={<ProductPage />} />
        <Route path="design" element={<DesignPickerPage />} />
        <Route path="design/:slug" element={<DesignerPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="account/orders" element={<AccountOrdersPage />} />
          <Route path="account/orders/:orderId" element={<AccountOrderDetailPage />} />
          <Route path="account/addresses" element={<AccountAddressesPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

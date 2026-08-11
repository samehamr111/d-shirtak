import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { ProductPage } from "./pages/ProductPage";
import { DesignPickerPage } from "./pages/DesignPickerPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AccountOrdersPage } from "./pages/AccountOrdersPage";
import { AccountOrderDetailPage } from "./pages/AccountOrderDetailPage";
import { AccountAddressesPage } from "./pages/AccountAddressesPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PageSpinner } from "./components/ui/Spinner";

// Fabric.js is heavy — keep it out of the main bundle and only fetch it when someone
// actually opens the designer.
const DesignerPage = lazy(() => import("./pages/DesignerPage").then((m) => ({ default: m.DesignerPage })));

export function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="shop/:slug" element={<ProductPage />} />
        <Route path="design" element={<DesignPickerPage />} />
        <Route
          path="design/:slug"
          element={
            <Suspense fallback={<PageSpinner />}>
              <DesignerPage />
            </Suspense>
          }
        />
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

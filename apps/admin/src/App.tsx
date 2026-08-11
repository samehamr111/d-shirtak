import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./features/auth/LoginPage";
import { ProtectedLayout } from "./features/layout/ProtectedLayout";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { ProductsListPage } from "./features/products/ProductsListPage";
import { InventoryPage } from "./features/inventory/InventoryPage";
import { ProductEditorPage } from "./features/products/ProductEditorPage";
import { CatalogSettingsPage } from "./features/catalog/CatalogSettingsPage";
import { FontsPage } from "./features/fonts/FontsPage";
import { DesignLibraryPage } from "./features/design-library/DesignLibraryPage";
import { OrdersListPage } from "./features/orders/OrdersListPage";
import { OrderDetailPage } from "./features/orders/OrderDetailPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsListPage />} />
        <Route path="/products/new" element={<ProductEditorPage />} />
        <Route path="/products/:id" element={<ProductEditorPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/catalog" element={<CatalogSettingsPage />} />
        <Route path="/fonts" element={<FontsPage />} />
        <Route path="/design-library" element={<DesignLibraryPage />} />
        <Route path="/orders" element={<OrdersListPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

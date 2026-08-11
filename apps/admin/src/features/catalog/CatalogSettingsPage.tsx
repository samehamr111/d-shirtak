import { PageHeader } from "../../components/PageHeader";
import { CategoriesPanel } from "./CategoriesPanel";
import { ColorsPanel } from "./ColorsPanel";
import { SizesPanel } from "./SizesPanel";
import { PricingSettingsPanel } from "./PricingSettingsPanel";

export function CatalogSettingsPage() {
  return (
    <div>
      <PageHeader
        title="Catalog Settings"
        description="Manage the global categories, colors, and sizes that products are built from."
      />
      <div className="space-y-6">
        <PricingSettingsPanel />
        <CategoriesPanel />
        <ColorsPanel />
        <SizesPanel />
      </div>
    </div>
  );
}

import { PageHeader } from "../../components/PageHeader";
import { DesignCategoriesPanel } from "./DesignCategoriesPanel";
import { DesignAssetsPanel } from "./DesignAssetsPanel";
import { UserUploadsPanel } from "./UserUploadsPanel";

export function DesignLibraryPage() {
  return (
    <div>
      <PageHeader title="Design Library" description="Curated design assets and categories customers can drop into their designs." />
      <div className="space-y-6">
        <DesignCategoriesPanel />
        <DesignAssetsPanel />
        <UserUploadsPanel />
      </div>
    </div>
  );
}

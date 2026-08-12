/** Pathname-segment -> human label, for deriving breadcrumbs from the current route. Dynamic
 *  segments (an id) fall back to "Detail" since we don't have the entity's name at this layer. */
export const ROUTE_LABELS: Record<string, string> = {
  "": "Dashboard",
  products: "Products",
  new: "New product",
  inventory: "Inventory",
  catalog: "Catalog Settings",
  fonts: "Fonts",
  "design-library": "Design Library",
  orders: "Orders",
  users: "Users",
};

export interface Crumb {
  label: string;
  to: string;
}

export function buildBreadcrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [{ label: "Dashboard", to: "/" }];

  const crumbs: Crumb[] = [];
  let to = "";
  for (const segment of segments) {
    to += `/${segment}`;
    const isId = !ROUTE_LABELS[segment];
    crumbs.push({ label: isId ? "Detail" : ROUTE_LABELS[segment]!, to });
  }
  return crumbs;
}

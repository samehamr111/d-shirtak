import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { buildBreadcrumbs } from "../features/layout/route-labels";

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const crumbs = buildBreadcrumbs(pathname);

  return (
    <nav className="flex items-center gap-1.5 text-sm text-ink/50">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.to} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={13} className="text-ink/30" />}
            {isLast ? (
              <span className="font-medium text-ink">{crumb.label}</span>
            ) : (
              <Link to={crumb.to} className="hover:text-ink">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

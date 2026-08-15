import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { PageSpinner } from "../ui/Spinner";
import { trackPageView } from "../../lib/analytics";

export function RootLayout() {
  const location = useLocation();
  // GA's default pageview (fired once when gtag.js loads) only ever sees the very first page in
  // a client-routed SPA -- this fires one manually on every route change instead. RootLayout
  // wraps every route (see App.tsx), so this is the one place that needs to know about navigation.
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

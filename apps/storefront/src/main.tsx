import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/bebas-neue/400.css";
import "@fontsource/ibm-plex-mono/400.css";
import "./index.css";
import { queryClient } from "./lib/query-client";
import { AuthProvider } from "./features/auth/auth-context";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";

// A lazy-loaded chunk (e.g. DesignerPage) can 404 into the SPA fallback HTML after a new deploy
// replaces it with a differently-hashed file -- Vite fires this event instead of letting the
// import() reject silently. Reload once to pick up the current build; if it still fails after
// that (a real outage, not a stale chunk), don't loop -- let the ErrorBoundary below handle it.
window.addEventListener("vite:preloadError", () => {
  const key = "dshirtak:reloaded-for-stale-chunk";
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);

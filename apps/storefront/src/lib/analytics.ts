// GA4 Measurement ID (e.g. "G-XXXXXXXXXX") -- not a secret (it's visible in any GA-instrumented
// page's source), so it's a plain constant here rather than routed through an env var / a
// Cloudflare dashboard config step. Tracking is a silent no-op everywhere below until this is
// set, so it's safe to leave blank in the meantime.
const GA_MEASUREMENT_ID = "G-KSWL5SBNLW";

const CURRENCY = "EGP";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

/** Injects gtag.js and configures it for manual page-view tracking -- this is a client-routed
 *  SPA, so GA's default "track on script load" would only ever see the very first page. Call
 *  once at app startup; every route change after that goes through trackPageView. */
export function initAnalytics(): void {
  if (!GA_MEASUREMENT_ID || initialized) return;
  initialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
}

function track(event: string, params?: Record<string, unknown>): void {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
  window.gtag("event", event, params);
}

export function trackPageView(path: string): void {
  track("page_view", { page_path: path, page_location: window.location.href, page_title: document.title });
}

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}

/** GA4's recommended ecommerce event names/params (add_to_cart, begin_checkout, purchase) --
 *  using the standard schema instead of ad-hoc event names is what unlocks GA4's built-in
 *  ecommerce/funnel reports rather than needing custom exploration reports for everything. */
export function trackAddToCart(item: AnalyticsItem): void {
  track("add_to_cart", { currency: CURRENCY, value: item.price * item.quantity, items: [item] });
}

export function trackBeginCheckout(items: AnalyticsItem[], value: number): void {
  track("begin_checkout", { currency: CURRENCY, value, items });
}

export function trackPurchase(order: { transactionId: string; value: number; items: AnalyticsItem[] }): void {
  track("purchase", {
    transaction_id: order.transactionId,
    currency: CURRENCY,
    value: order.value,
    items: order.items,
  });
}

export function trackSignUp(method = "email"): void {
  track("sign_up", { method });
}

export function trackLogin(method = "email"): void {
  track("login", { method });
}

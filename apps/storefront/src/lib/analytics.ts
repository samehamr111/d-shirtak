// GA4 Measurement ID (e.g. "G-XXXXXXXXXX") and Meta Pixel ID -- neither is a secret (both are
// visible in any instrumented page's source), so they're plain constants here rather than routed
// through an env var / a Cloudflare dashboard config step. Tracking is a silent no-op everywhere
// below until these are set, so it's safe to leave either blank.
const GA_MEASUREMENT_ID = "G-KSWL5SBNLW";
const META_PIXEL_ID = "1380498593515612";

const CURRENCY = "EGP";

interface FbqFn {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: FbqFn;
  loaded: boolean;
  version: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

let initialized = false;

/** Injects both gtag.js and the Meta Pixel, and configures GA for manual page-view tracking --
 *  this is a client-routed SPA, so either library's default "track on script load" would only
 *  ever see the very first page. Call once at app startup; every route change after that goes
 *  through trackPageView, which fires both. */
export function initAnalytics(): void {
  if (initialized) return;
  initialized = true;

  if (GA_MEASUREMENT_ID) {
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

  if (META_PIXEL_ID) {
    initMetaPixel();
    // The pixel's own PageView on load only sees this first render, same reasoning as GA above
    // -- trackPageView (fired by RootLayout on every route change, including this first one)
    // covers all of them uniformly instead.
    window.fbq!("init", META_PIXEL_ID);
  }
}

/** Straight port of Meta's standard pixel-base snippet (the part before `fbq('init', ...)`),
 *  just typed and without the IIFE's single-letter params. */
function initMetaPixel(): void {
  if (window.fbq) return;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as FbqFn;
  fbq.queue = [];
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
}

function track(event: string, params?: Record<string, unknown>): void {
  if (GA_MEASUREMENT_ID && typeof window.gtag === "function") window.gtag("event", event, params);
}

function trackMeta(event: string, params?: Record<string, unknown>): void {
  if (META_PIXEL_ID && typeof window.fbq === "function") window.fbq("track", event, params);
}

export function trackPageView(path: string): void {
  track("page_view", { page_path: path, page_location: window.location.href, page_title: document.title });
  trackMeta("PageView");
}

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}

/** GA4's recommended ecommerce event names/params (add_to_cart, begin_checkout, purchase) --
 *  using the standard schema instead of ad-hoc event names is what unlocks GA4's built-in
 *  ecommerce/funnel reports rather than needing custom exploration reports for everything. Meta's
 *  standard events (AddToCart, InitiateCheckout, Purchase, CompleteRegistration) get the same
 *  treatment, for the same reason on that side. */
export function trackAddToCart(item: AnalyticsItem): void {
  const value = item.price * item.quantity;
  track("add_to_cart", { currency: CURRENCY, value, items: [item] });
  trackMeta("AddToCart", { currency: CURRENCY, value, content_ids: [item.item_id], content_type: "product" });
}

export function trackBeginCheckout(items: AnalyticsItem[], value: number): void {
  track("begin_checkout", { currency: CURRENCY, value, items });
  trackMeta("InitiateCheckout", {
    currency: CURRENCY,
    value,
    content_ids: items.map((i) => i.item_id),
    content_type: "product",
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
  });
}

export function trackPurchase(order: { transactionId: string; value: number; items: AnalyticsItem[] }): void {
  track("purchase", {
    transaction_id: order.transactionId,
    currency: CURRENCY,
    value: order.value,
    items: order.items,
  });
  trackMeta("Purchase", {
    currency: CURRENCY,
    value: order.value,
    content_ids: order.items.map((i) => i.item_id),
    content_type: "product",
  });
}

export function trackSignUp(method = "email"): void {
  track("sign_up", { method });
  trackMeta("CompleteRegistration", { registration_method: method });
}

export function trackLogin(method = "email"): void {
  track("login", { method });
  // Meta has no standard "Login" event -- CompleteRegistration is reserved for actual signups,
  // so a login just isn't tracked on this side. Nothing to send.
}

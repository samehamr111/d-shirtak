import type { CartDto, DesignDto } from "@d-shirtak/shared";
import { api } from "../../lib/api-client";
import { queryClient } from "../../lib/query-client";
import { localCart } from "./local-cart";

const CART_KEY = ["cart"];

/** Called right after a guest logs in or signs up. Carts and designs are tied to a real user row
 *  server-side, so anything added while browsing as a guest only ever lived in localStorage --
 *  this recreates it for real now that there's an account to attach it to. Each item is removed
 *  from local storage as soon as it's confirmed on the server, so a failure partway through
 *  (e.g. one variant going out of stock) leaves only the un-migrated items for a later retry
 *  instead of risking duplicates. Each item is handled independently -- one item failing (a design
 *  the server rejects, a variant that just sold out) must not take the rest of the cart down with
 *  it, since once authenticated the UI only ever shows the server cart and anything left behind
 *  here becomes invisible to the shopper. */
export async function flushLocalCartToServer(): Promise<void> {
  const items = localCart.getAll();
  if (items.length === 0) return;

  for (const item of items) {
    try {
      let frontDesignId: string | undefined;
      let backDesignId: string | undefined;

      if (item.frontDesignJson) {
        const design = await api.post<DesignDto>("/designs", {
          productVariantId: item.productVariantId,
          side: "FRONT",
          canvasJson: item.frontDesignJson,
          previewImageDataUrl: item.frontDesignPreviewUrl,
        });
        frontDesignId = design.id;
      }
      if (item.backDesignJson) {
        const design = await api.post<DesignDto>("/designs", {
          productVariantId: item.productVariantId,
          side: "BACK",
          canvasJson: item.backDesignJson,
          previewImageDataUrl: item.backDesignPreviewUrl,
        });
        backDesignId = design.id;
      }

      await api.post<CartDto>("/cart/items", {
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        frontDesignId,
        backDesignId,
      });
      localCart.remove(item.id);
    } catch (err) {
      // Left in localStorage for the next flush attempt (next login, or the safety-net retry in
      // AuthProvider) instead of being silently dropped.
      console.error("Failed to migrate a guest cart item to the server:", err);
    }
  }

  await queryClient.invalidateQueries({ queryKey: CART_KEY });
}

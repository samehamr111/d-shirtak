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
 *  instead of risking duplicates. */
export async function flushLocalCartToServer(): Promise<void> {
  const items = localCart.getAll();
  if (items.length === 0) return;

  for (const item of items) {
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
  }

  await queryClient.invalidateQueries({ queryKey: CART_KEY });
}

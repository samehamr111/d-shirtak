import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CartDto } from "@d-shirtak/shared";
import { api } from "../../lib/api-client";
import { useAuth } from "../auth/auth-context";
import { localCart, toCartDto, useLocalCart } from "./local-cart";

const CART_KEY = ["cart"];

/** A guest's cart lives entirely in localStorage (see local-cart.ts) -- there's no server row to
 *  point at until they log in, which only happens at checkout. Every hook below picks the local
 *  or server-backed implementation based on auth status so every consumer (CartPage, checkout's
 *  summary, the header's item count) can stay oblivious to which one is active. */

export function useCart(): { data: CartDto | undefined; isLoading: boolean } {
  const { status } = useAuth();
  const localItems = useLocalCart();
  // Memoized so guests get a stable `data` reference across renders when the cart hasn't actually
  // changed -- anything that ever keys an effect off `cart.data` (a future SiteHeader animation,
  // say) shouldn't be able to spin into a re-render loop the way the raw useSyncExternalStore
  // snapshot instability once did.
  const localCartDto = useMemo(() => toCartDto(localItems), [localItems]);
  const serverQuery = useQuery({
    queryKey: CART_KEY,
    queryFn: () => api.get<CartDto>("/cart"),
    enabled: status === "authenticated",
  });

  if (status === "authenticated") {
    return { data: serverQuery.data, isLoading: serverQuery.isLoading };
  }
  return { data: localCartDto, isLoading: false };
}

export interface AddToCartInput {
  productVariantId: string;
  quantity: number;
  frontDesignId?: string;
  backDesignId?: string;
  /** Required when adding as a guest -- everything needed to render the cart row locally and,
   *  once they log in, to recreate the real Design/CartItem rows on the server. */
  guestSnapshot?: {
    productName: string;
    colorName: string;
    sizeName: string;
    imageUrl: string;
    unitPrice: number;
    stockQuantity: number;
    frontDesignPreviewUrl: string | null;
    backDesignPreviewUrl: string | null;
    frontDesignJson: Record<string, unknown> | null;
    backDesignJson: Record<string, unknown> | null;
  };
}

export function useAddToCart() {
  const { status } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddToCartInput): Promise<CartDto> => {
      if (status === "authenticated") {
        return api.post<CartDto>("/cart/items", {
          productVariantId: input.productVariantId,
          quantity: input.quantity,
          frontDesignId: input.frontDesignId,
          backDesignId: input.backDesignId,
        });
      }
      const snap = input.guestSnapshot;
      if (!snap) throw new Error("Missing guest cart snapshot");
      localCart.add({
        productVariantId: input.productVariantId,
        quantity: input.quantity,
        productName: snap.productName,
        colorName: snap.colorName,
        sizeName: snap.sizeName,
        imageUrl: snap.imageUrl,
        unitPrice: snap.unitPrice,
        stockQuantity: snap.stockQuantity,
        frontDesignPreviewUrl: snap.frontDesignPreviewUrl,
        backDesignPreviewUrl: snap.backDesignPreviewUrl,
        frontDesignJson: snap.frontDesignJson,
        backDesignJson: snap.backDesignJson,
      });
      return toCartDto(localCart.getAll());
    },
    onSuccess: (data) => {
      if (status === "authenticated") queryClient.setQueryData(CART_KEY, data);
    },
  });
}

export function useUpdateCartItem() {
  const { status } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }): Promise<CartDto> => {
      if (status === "authenticated") return api.patch<CartDto>(`/cart/items/${itemId}`, { quantity });
      localCart.updateQuantity(itemId, quantity);
      return toCartDto(localCart.getAll());
    },
    onSuccess: (data) => {
      if (status === "authenticated") queryClient.setQueryData(CART_KEY, data);
    },
  });
}

export function useRemoveCartItem() {
  const { status } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string): Promise<CartDto> => {
      if (status === "authenticated") return api.delete<CartDto>(`/cart/items/${itemId}`);
      localCart.remove(itemId);
      return toCartDto(localCart.getAll());
    },
    onSuccess: (data) => {
      if (status === "authenticated") queryClient.setQueryData(CART_KEY, data);
    },
  });
}

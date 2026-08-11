import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AddCartItemInput, CartDto } from "@d-shirtak/shared";
import { api } from "../../lib/api-client";
import { useAuth } from "../auth/auth-context";

const CART_KEY = ["cart"];

export function useCart() {
  const { status } = useAuth();
  return useQuery({
    queryKey: CART_KEY,
    queryFn: () => api.get<CartDto>("/cart"),
    enabled: status === "authenticated",
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddCartItemInput) => api.post<CartDto>("/cart/items", input),
    onSuccess: (data) => queryClient.setQueryData(CART_KEY, data),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      api.patch<CartDto>(`/cart/items/${itemId}`, { quantity }),
    onSuccess: (data) => queryClient.setQueryData(CART_KEY, data),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.delete<CartDto>(`/cart/items/${itemId}`),
    onSuccess: (data) => queryClient.setQueryData(CART_KEY, data),
  });
}

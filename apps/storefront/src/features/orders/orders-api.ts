import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrderDto, PlaceOrderInput } from "@d-shirtak/shared";
import { api } from "../../lib/api-client";

export function useMyOrders() {
  return useQuery({ queryKey: ["my-orders"], queryFn: () => api.get<OrderDto[]>("/orders") });
}

export function useMyOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["my-orders", orderId],
    queryFn: () => api.get<OrderDto>(`/orders/${orderId}`),
    enabled: Boolean(orderId),
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PlaceOrderInput) => api.post<OrderDto>("/orders", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
}

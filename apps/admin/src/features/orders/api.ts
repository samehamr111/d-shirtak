import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DashboardStatsDto, OrderDto, OrderStatus, OrderSummaryDto } from "@d-shirtak/shared";
import { api } from "../../lib/api-client";

const BASE = "/admin/orders";

export function useOrders(status?: OrderStatus) {
  return useQuery({
    queryKey: ["orders", status ?? "ALL"],
    queryFn: () => api.get<OrderSummaryDto[]>(status ? `${BASE}?status=${status}` : BASE),
  });
}

export function useDashboardStats() {
  return useQuery({ queryKey: ["orders", "stats"], queryFn: () => api.get<DashboardStatsDto>(`${BASE}/stats`) });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["orders", "detail", id],
    queryFn: () => api.get<OrderDto>(`${BASE}/${id}`),
    enabled: Boolean(id),
  });
}

export function useUpdateOrderStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: OrderStatus) => api.patch<OrderDto>(`${BASE}/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminUserDto, AdminUserStatsDto } from "@d-shirtak/shared";
import { api } from "../../lib/api-client";

const BASE = "/admin/users";

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: () => api.get<AdminUserDto[]>(BASE) });
}

export function useUserStats() {
  return useQuery({ queryKey: ["users", "stats"], queryFn: () => api.get<AdminUserStatsDto>(`${BASE}/stats`) });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch<AdminUserDto>(`${BASE}/${id}/block`, { reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<AdminUserDto>(`${BASE}/${id}/unblock`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

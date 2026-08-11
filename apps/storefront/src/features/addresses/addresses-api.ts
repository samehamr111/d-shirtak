import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AddressDto, AddressInput } from "@d-shirtak/shared";
import { api } from "../../lib/api-client";

const KEY = ["addresses"];

export function useAddresses() {
  return useQuery({ queryKey: KEY, queryFn: () => api.get<AddressDto[]>("/addresses") });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddressInput) => api.post<AddressDto>("/addresses", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AddressInput> }) =>
      api.patch<AddressDto>(`/addresses/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/addresses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

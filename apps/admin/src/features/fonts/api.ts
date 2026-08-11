import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FontDto } from "@d-shirtak/shared";
import { api } from "../../lib/api-client";

const BASE = "/admin/design-library/fonts";

export function useFonts() {
  return useQuery({ queryKey: ["fonts"], queryFn: () => api.get<FontDto[]>(BASE) });
}

export function useUploadFont() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) => api.postForm<FontDto>(BASE, form),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fonts"] }),
  });
}

export function useDeleteFont() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`${BASE}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fonts"] }),
  });
}

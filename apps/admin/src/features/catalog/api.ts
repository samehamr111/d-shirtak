import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CategoryDto,
  ColorDto,
  CreateCategoryInput,
  CreateColorInput,
  CreateSizeInput,
  SizeDto,
  StoreSettingsDto,
  UpdateStoreSettingsInput,
} from "@d-shirtak/shared";
import { api } from "../../lib/api-client";

const BASE = "/admin/catalog";

export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: () => api.get<CategoryDto[]>(`${BASE}/categories`) });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => api.post<CategoryDto>(`${BASE}/categories`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`${BASE}/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useColors() {
  return useQuery({ queryKey: ["colors"], queryFn: () => api.get<ColorDto[]>(`${BASE}/colors`) });
}

export function useCreateColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateColorInput) => api.post<ColorDto>(`${BASE}/colors`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["colors"] }),
  });
}

export function useDeleteColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`${BASE}/colors/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["colors"] }),
  });
}

export function useSizes() {
  return useQuery({ queryKey: ["sizes"], queryFn: () => api.get<SizeDto[]>(`${BASE}/sizes`) });
}

export function useCreateSize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSizeInput) => api.post<SizeDto>(`${BASE}/sizes`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sizes"] }),
  });
}

export function useDeleteSize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`${BASE}/sizes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sizes"] }),
  });
}

export function useStoreSettings() {
  return useQuery({ queryKey: ["store-settings"], queryFn: () => api.get<StoreSettingsDto>(`${BASE}/settings`) });
}

export function useUpdateStoreSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateStoreSettingsInput) => api.patch<StoreSettingsDto>(`${BASE}/settings`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["store-settings"] }),
  });
}

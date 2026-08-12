import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DesignAssetDto,
  DesignCategoryDto,
  DesignCategoryInput,
  PromoteUserUploadInput,
  UserUploadDto,
} from "@d-shirtak/shared";
import { api } from "../../lib/api-client";

const BASE = "/admin/design-library";

export function useDesignCategories() {
  return useQuery({
    queryKey: ["design-categories"],
    queryFn: () => api.get<DesignCategoryDto[]>(`${BASE}/design-categories`),
  });
}

export function useCreateDesignCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DesignCategoryInput) => api.post<DesignCategoryDto>(`${BASE}/design-categories`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["design-categories"] }),
  });
}

export function useDeleteDesignCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`${BASE}/design-categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["design-categories"] }),
  });
}

export function useDesignAssets() {
  return useQuery({ queryKey: ["design-assets"], queryFn: () => api.get<DesignAssetDto[]>(`${BASE}/design-assets`) });
}

export function useUploadDesignAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) => api.postForm<DesignAssetDto>(`${BASE}/design-assets`, form),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["design-assets"] }),
  });
}

export function useAddDesignAssetModelShot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: FormData }) =>
      api.postForm<DesignAssetDto>(`${BASE}/design-assets/${id}/model-shots`, form),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["design-assets"] }),
  });
}

export function useDeleteDesignAssetModelShot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, shotId }: { id: string; shotId: string }) =>
      api.delete<DesignAssetDto>(`${BASE}/design-assets/${id}/model-shots/${shotId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["design-assets"] }),
  });
}

export function useDeleteDesignAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`${BASE}/design-assets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["design-assets"] }),
  });
}

export function useUserUploads() {
  return useQuery({ queryKey: ["user-uploads"], queryFn: () => api.get<UserUploadDto[]>(`${BASE}/user-uploads`) });
}

export function usePromoteUserUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PromoteUserUploadInput }) =>
      api.post<DesignAssetDto>(`${BASE}/user-uploads/${id}/promote`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-uploads"] });
      queryClient.invalidateQueries({ queryKey: ["design-assets"] });
    },
  });
}

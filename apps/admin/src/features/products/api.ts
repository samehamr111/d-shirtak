import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminProductDetailDto, ProductInput, ProductSizeInput, VariantStockInput } from "@d-shirtak/shared";
import { api } from "../../lib/api-client";

const BASE = "/admin/catalog/products";

export function useProducts() {
  return useQuery({ queryKey: ["products"], queryFn: () => api.get<AdminProductDetailDto[]>(BASE) });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => api.get<AdminProductDetailDto>(`${BASE}/${id}`),
    enabled: Boolean(id),
  });
}

// Invalidating ["products"] alone already matches every query keyed under it by prefix --
// including ["products", id] -- so a second, separate call for the id would just invalidate
// (and refetch) the same detail query a second time.
function invalidateProduct(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["products"] });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => api.post<AdminProductDetailDto>(BASE, input),
    onSuccess: () => invalidateProduct(queryClient),
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ProductInput>) => api.patch<AdminProductDetailDto>(`${BASE}/${id}`, input),
    onSuccess: () => invalidateProduct(queryClient),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`${BASE}/${id}`),
    onSuccess: () => invalidateProduct(queryClient),
  });
}

export function useAddProductColor(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) => api.postForm<AdminProductDetailDto>(`${BASE}/${productId}/colors`, form),
    onSuccess: () => invalidateProduct(queryClient),
  });
}

export function useRemoveProductColor(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productColorId: string) => api.delete<AdminProductDetailDto>(`${BASE}/${productId}/colors/${productColorId}`),
    onSuccess: () => invalidateProduct(queryClient),
  });
}

export function useUpdateProductColorModelImages(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productColorId, form }: { productColorId: string; form: FormData }) =>
      api.patchForm<AdminProductDetailDto>(`${BASE}/${productId}/colors/${productColorId}/model-images`, form),
    onSuccess: () => invalidateProduct(queryClient),
  });
}

export function useAddProductSize(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductSizeInput) => api.post<AdminProductDetailDto>(`${BASE}/${productId}/sizes`, input),
    onSuccess: () => invalidateProduct(queryClient),
  });
}

export function useUpdateProductSize(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productSizeId, input }: { productSizeId: string; input: Partial<ProductSizeInput> }) =>
      api.patch<AdminProductDetailDto>(`${BASE}/${productId}/sizes/${productSizeId}`, input),
    onSuccess: () => invalidateProduct(queryClient),
  });
}

export function useRemoveProductSize(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productSizeId: string) => api.delete<AdminProductDetailDto>(`${BASE}/${productId}/sizes/${productSizeId}`),
    onSuccess: () => invalidateProduct(queryClient),
  });
}

export function useAddVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VariantStockInput) => api.post<AdminProductDetailDto>(`${BASE}/${productId}/variants`, input),
    onSuccess: () => invalidateProduct(queryClient),
  });
}

export function useUpdateVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, input }: { variantId: string; input: Partial<VariantStockInput> }) =>
      api.patch<AdminProductDetailDto>(`${BASE}/${productId}/variants/${variantId}`, input),
    onSuccess: () => invalidateProduct(queryClient),
  });
}

export function useRemoveVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variantId: string) => api.delete<AdminProductDetailDto>(`${BASE}/${productId}/variants/${variantId}`),
    onSuccess: () => invalidateProduct(queryClient),
  });
}

/** Same endpoint as useUpdateVariant, but takes productId per-call instead of at hook-creation
 *  time -- needed for a cross-product table (Inventory) where hooks can't be created in a loop. */
export function useUpdateAnyVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      input,
    }: {
      productId: string;
      variantId: string;
      input: Partial<VariantStockInput>;
    }) => api.patch<AdminProductDetailDto>(`${BASE}/${productId}/variants/${variantId}`, input),
    onSuccess: () => invalidateProduct(queryClient),
  });
}

import { useQuery } from "@tanstack/react-query";
import type {
  CategoryDto,
  ColorDto,
  DesignAssetDto,
  DesignCategoryDto,
  FontDto,
  ProductDetailDto,
  ProductSummaryDto,
  SizeDto,
  StoreSettingsDto,
} from "@d-shirtak/shared";
import { api } from "../../lib/api-client";

export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: () => api.get<CategoryDto[]>("/catalog/categories") });
}

export function useProducts(params: { category?: string; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => api.get<ProductSummaryDto[]>(`/catalog/products${qs ? `?${qs}` : ""}`),
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => api.get<ProductDetailDto>(`/catalog/products/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useColors() {
  return useQuery({ queryKey: ["colors"], queryFn: () => api.get<ColorDto[]>("/catalog/colors") });
}

export function useSizes() {
  return useQuery({ queryKey: ["sizes"], queryFn: () => api.get<SizeDto[]>("/catalog/sizes") });
}

export function useFonts() {
  return useQuery({ queryKey: ["fonts"], queryFn: () => api.get<FontDto[]>("/catalog/fonts") });
}

export function useDesignCategories() {
  return useQuery({
    queryKey: ["design-categories"],
    queryFn: () => api.get<DesignCategoryDto[]>("/catalog/design-categories"),
  });
}

export function useStoreSettings() {
  return useQuery({ queryKey: ["store-settings"], queryFn: () => api.get<StoreSettingsDto>("/catalog/settings") });
}

export function useDesignAssets(designCategoryId?: string) {
  return useQuery({
    queryKey: ["design-assets", designCategoryId],
    queryFn: () =>
      api.get<DesignAssetDto[]>(`/catalog/design-assets${designCategoryId ? `?categoryId=${designCategoryId}` : ""}`),
  });
}

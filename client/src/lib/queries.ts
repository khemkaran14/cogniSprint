import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./api";
import type { CurriculumModule, FaqItem, BlogArticle, Product } from "@/types/content";

export function useProducts() {
  return useQuery({ queryKey: ["products"], queryFn: () => apiGet<Product[]>("/products") });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["products", slug],
    queryFn: () => apiGet<Product>(`/products/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useCurriculum() {
  return useQuery({ queryKey: ["curriculum"], queryFn: () => apiGet<CurriculumModule[]>("/curriculum") });
}

export function useFaq(category?: string) {
  return useQuery({
    queryKey: ["faq", category],
    queryFn: () => apiGet<FaqItem[]>(category ? `/faq?category=${category}` : "/faq"),
  });
}

export function useBlogList() {
  return useQuery({ queryKey: ["blog"], queryFn: () => apiGet<BlogArticle[]>("/blog") });
}

export function useBlogArticle(slug: string) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: () => apiGet<BlogArticle>(`/blog/${slug}`),
    enabled: Boolean(slug),
  });
}

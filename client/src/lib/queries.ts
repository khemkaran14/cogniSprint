import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./api";
import type { CurriculumModule, FaqItem, BlogArticle, Product } from "@/types/content";

export type ContentAvailability = { published: { lessons: number; exercises: number; assessments: number; assessmentQuestions: number; workbooks: number; worksheets: number }; targets: { lessons: number; assessments: number; workbooks: number }; launchContentComplete: boolean; enrollmentOpen: boolean };

export function useContentAvailability() {
  return useQuery({ queryKey: ["content-availability"], queryFn: () => apiGet<ContentAvailability>("/content-availability"), staleTime: 60_000 });
}

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

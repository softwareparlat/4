import { useQuery } from "@tanstack/react-query";
import type { Project, Portfolio } from "@shared/schema";

export function useProjects() {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["/api/projects"],
  });

  return {
    projects: projects as Project[] | undefined,
    isLoading,
    error,
  };
}

export function usePortfolio() {
  const { data: portfolio, isLoading, error } = useQuery({
    queryKey: ["/api/portfolio"],
    retry: false,
  });

  return {
    portfolio: portfolio as Portfolio[] | undefined,
    isLoading,
    error,
  };
}

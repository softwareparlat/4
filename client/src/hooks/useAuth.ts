import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { User, LoginInput, RegisterInput } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: user as User | undefined,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      const data = await response.json();

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate auth queries to refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: RegisterInput) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const data = await response.json();

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate auth queries to refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Clear token from localStorage
      localStorage.removeItem("auth_token");
      return { message: "Logged out successfully" };
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
    },
  });
}
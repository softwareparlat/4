import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import type { User } from "@shared/schema";
import type { DashboardStats } from "@/types";

export function useAdmin() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: user?.role === "admin",
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: user?.role === "admin",
  });

  return {
    stats: stats as DashboardStats | undefined,
    users: users as User[] | undefined,
    isLoading: statsLoading || usersLoading,
  };
}

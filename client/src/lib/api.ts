import { queryClient } from "./queryClient";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const token = localStorage.getItem("auth_token");
  
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  // Handle auth errors
  if (response.status === 401) {
    localStorage.removeItem("auth_token");
    queryClient.clear();
    window.location.reload();
  }

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`${response.status}: ${errorData}`);
  }

  return response;
}

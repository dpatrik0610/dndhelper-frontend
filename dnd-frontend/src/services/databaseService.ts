import { apiClient } from "@api/apiClient";

const baseUrl = "/database";

export async function listCollections(token: string): Promise<string[]> {
  if (!token) throw new Error("Token is required to list collections.");
  const res = await apiClient<string[] | Record<string, unknown>>(`${baseUrl}/collections`, {
    method: "GET",
    token,
  });
  if (Array.isArray(res)) return res;
  if (Array.isArray((res as any)?.items)) return (res as any).items;
  return [];
}

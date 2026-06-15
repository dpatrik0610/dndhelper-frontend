import { apiClient } from "@api/apiClient";

const baseUrl = "/database";

export async function listCollections(): Promise<string[]> {
  
  const res = await apiClient<string[] | Record<string, unknown>>(`${baseUrl}/collections`, {
    method: "GET",

  });
  if (Array.isArray(res)) return res;
  if (Array.isArray((res as any)?.items)) return (res as any).items;
  return [];
}

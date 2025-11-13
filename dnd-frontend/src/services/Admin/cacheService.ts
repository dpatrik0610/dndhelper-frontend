import { apiClient } from "../../api/apiClient";
import type { CacheInfoResponse } from "../../types/Cache";
import type { CacheClearResponse } from "../../types/Cache";
const baseUrl = "/cache";

export async function getCacheInfo(token: string): Promise<CacheInfoResponse> {
  return apiClient<CacheInfoResponse>(`${baseUrl}/info`, {
    method: "GET",
    token,
  });
}

export async function clearCache(token: string): Promise<CacheClearResponse> {
  return apiClient<CacheClearResponse>(`${baseUrl}`, {
    method: "DELETE",
    token,
  });
}

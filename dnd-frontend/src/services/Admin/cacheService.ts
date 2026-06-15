import { apiClient } from "../../api/apiClient";
import type { CacheInfoResponse } from "../../types/Cache";
import type { CacheClearResponse } from "../../types/Cache";
const baseUrl = "/cache";

export async function getCacheInfo(): Promise<CacheInfoResponse> {
  return apiClient<CacheInfoResponse>(`${baseUrl}/info`, {
    method: "GET",

  });
}

export async function clearCache(): Promise<CacheClearResponse> {
  return apiClient<CacheClearResponse>(`${baseUrl}`, {
    method: "DELETE",

  });
}

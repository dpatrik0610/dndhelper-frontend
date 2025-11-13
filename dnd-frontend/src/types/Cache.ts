export interface CacheInfoResponse {
  collections: Record<string, string[]>; // key: collectionName, value: list of keys
  total: number;
}

export interface CacheClearResponse {
  removed: string[];
  count: number;
}
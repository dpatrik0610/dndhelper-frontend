import { apiClient } from "../../api/apiClient";
import type { Monster } from "../../types/Monster";

const BASE = "/monster";

export const monsterService = {
  getAll: async (): Promise<Monster[]> => {
    return apiClient<Monster[]>(BASE, {});
  },

  getById: async (id: string): Promise<Monster> => {
    return apiClient<Monster>(`${BASE}/${id}`, {});
  },

  getByName: async (name: string): Promise<Monster[]> => {
    return apiClient<Monster[]>(`${BASE}/name/${encodeURIComponent(name)}`, {});
  },

  getPaged: async (page = 1, pageSize = 10) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    return apiClient<Monster[]>(`${BASE}/paged?${params.toString()}`, {});
  },

  getCount: async (): Promise<{ Count: number }> => {
    return apiClient<{ Count: number }>(`${BASE}/count`, {});
  },

  search: async (
    criteria: {
      name?: string;
      type?: string;
      minCR?: number;
      maxCR?: number;
      tags?: string[];
      sortBy?: string;
      desc?: boolean;
      page?: number;
      pageSize?: number;
    }
  ) => {
    const params = new URLSearchParams();
    if (criteria.name) params.set("name", criteria.name);
    if (criteria.type) params.set("type", criteria.type);
    if (criteria.minCR !== undefined) params.set("minCR", String(criteria.minCR));
    if (criteria.maxCR !== undefined) params.set("maxCR", String(criteria.maxCR));
    if (criteria.tags?.length) criteria.tags.forEach((t) => params.append("tags", t));
    if (criteria.sortBy) params.set("sortBy", criteria.sortBy);
    if (criteria.desc) params.set("desc", "true");
    params.set("page", String(criteria.page ?? 1));
    params.set("pageSize", String(criteria.pageSize ?? 10));

    return apiClient<{ Found: number; monsters: Monster[] }>(
      `${BASE}/search?${params.toString()}`,
      {}
    );
  },

  create: async (monster: Monster): Promise<Monster> => {
    return apiClient<Monster>(BASE, { method: "POST", body: monster });
  },

  update: async (id: string, monster: Monster): Promise<Monster> => {
    return apiClient<Monster>(`${BASE}/${id}`, { method: "PUT", body: monster });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`${BASE}/${id}`, { method: "DELETE" });
  },

  softDelete: async (id: string): Promise<void> => {
    await apiClient<void>(`${BASE}/soft-delete/${id}`, { method: "PATCH" });
  },

  deleteOwn: async (id: string): Promise<void> => {
    await apiClient<void>(`${BASE}/delete-own/${id}`, { method: "DELETE" });
  },

  switchOwner: async (monsterId: string, newOwnerId: string): Promise<void> => {
    await apiClient<void>(`${BASE}/${monsterId}/switch-owner/${newOwnerId}`, { method: "POST" });
  },

  addOwner: async (monsterId: string, newOwnerId: string): Promise<void> => {
    await apiClient<void>(`${BASE}/${monsterId}/addOwner/${newOwnerId}`, { method: "GET" });
  },
};

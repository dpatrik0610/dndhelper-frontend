import { apiClient } from "../../api/apiClient";
import type { Monster } from "../../types/Monster";

const BASE = "/monster";

export const monsterService = {
  getAll: async (token?: string): Promise<Monster[]> => {
    return apiClient<Monster[]>(BASE, { token });
  },

  getById: async (id: string, token?: string): Promise<Monster> => {
    return apiClient<Monster>(`${BASE}/${id}`, { token });
  },

  getByName: async (name: string, token?: string): Promise<Monster[]> => {
    return apiClient<Monster[]>(`${BASE}/name/${encodeURIComponent(name)}`, { token });
  },

  getPaged: async (page = 1, pageSize = 10, token?: string) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    return apiClient<Monster[]>(`${BASE}/paged?${params.toString()}`, { token });
  },

  getCount: async (token?: string): Promise<{ Count: number }> => {
    return apiClient<{ Count: number }>(`${BASE}/count`, { token });
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
    },
    token?: string
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
      { token }
    );
  },

  create: async (monster: Monster, token?: string): Promise<Monster> => {
    return apiClient<Monster>(BASE, { method: "POST", body: monster, token });
  },

  update: async (id: string, monster: Monster, token?: string): Promise<Monster> => {
    return apiClient<Monster>(`${BASE}/${id}`, { method: "PUT", body: monster, token });
  },

  delete: async (id: string, token?: string): Promise<void> => {
    await apiClient<void>(`${BASE}/${id}`, { method: "DELETE", token });
  },

  softDelete: async (id: string, token?: string): Promise<void> => {
    await apiClient<void>(`${BASE}/soft-delete/${id}`, { method: "PATCH", token });
  },

  deleteOwn: async (id: string, token?: string): Promise<void> => {
    await apiClient<void>(`${BASE}/delete-own/${id}`, { method: "DELETE", token });
  },

  switchOwner: async (monsterId: string, newOwnerId: string, token?: string): Promise<void> => {
    await apiClient<void>(`${BASE}/${monsterId}/switch-owner/${newOwnerId}`, { method: "POST", token });
  },

  addOwner: async (monsterId: string, newOwnerId: string, token?: string): Promise<void> => {
    await apiClient<void>(`${BASE}/${monsterId}/addOwner/${newOwnerId}`, { method: "GET", token });
  },
};

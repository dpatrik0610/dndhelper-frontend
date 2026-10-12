import { apiClient } from "@api/apiClient";
import type {
  Monster,
  MonsterMigrationReport,
  MonsterSearch,
  SrdImportResult,
  SrdMonsterEntry,
  SrdRuleset,
} from "@appTypes/Monster";

const BASE = "/monster";

export const monsterService = {
  search: (criteria: MonsterSearch) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(criteria))
      if (value !== undefined && value !== "") params.set(key, String(value));
    return apiClient<{ items: Monster[]; total: number }>(`${BASE}?${params}`);
  },

  types: () => apiClient<string[]>(`${BASE}/types`),

  getById: (id: string) => apiClient<Monster>(`${BASE}/${id}`),

  create: (monster: Monster) => apiClient<Monster>(BASE, { method: "POST", body: monster }),

  update: (monster: Monster) => apiClient<Monster>(`${BASE}/${monster.id}`, { method: "PUT", body: monster }),

  delete: (id: string) => apiClient<void>(`${BASE}/${id}`, { method: "DELETE" }),

  /** Art for the monster and its tabletop token (R2, max 10 MB). Returns the saved monster. */
  uploadImage: (id: string, file: File) => {
    const body = new FormData();
    body.append("file", file);
    return apiClient<Monster>(`${BASE}/${id}/image`, { method: "POST", body });
  },

  // Superadmin: SRD import into core content.
  srdCatalog: (ruleset: SrdRuleset) => apiClient<SrdMonsterEntry[]>(`${BASE}/srd/${ruleset}`),

  srdImport: (ruleset: SrdRuleset, keys: string[]) =>
    apiClient<SrdImportResult>(`${BASE}/srd/${ruleset}/import`, { method: "POST", body: { keys } }),

  /** Superadmin: converts monsters still in the old 5etools shape. Dry run by default. */
  migrateLegacy: (dryRun: boolean) =>
    apiClient<MonsterMigrationReport>(`/database/migrate/monsters?dryRun=${dryRun}`, { method: "POST" }),
};

/** Most the server accepts per import call. */
export const SRD_IMPORT_BATCH = 20;

import { create } from "zustand";
import { monsterService } from "@services/Admin/monsterService";
import { useAuthStore } from "@store/useAuthStore";
import type { Monster } from "@appTypes/Monster";

type NpcFilter = "all" | "npc" | "creature";

export interface MonsterFilters {
  name?: string;
  type?: string;
  minCR?: number;
  maxCR?: number;
}

interface AdminMonsterStore {
  monsters: Monster[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;

  filters: MonsterFilters;
  appliedFilters: MonsterFilters;
  npcFilter: NpcFilter;

  setFilters: (partial: Partial<MonsterFilters>) => void;
  setNpcFilter: (filter: NpcFilter) => void;
  applyFilters: () => Promise<void>;
  resetFilters: () => Promise<void>;

  loadMonsters: (opts?: { page?: number; pageSize?: number }) => Promise<void>;
  createMonster: (monster: Monster) => Promise<void>;
  updateMonster: (id: string, monster: Monster) => Promise<void>;
  deleteMonster: (id: string) => Promise<void>;
  clearStorage: () => void;
}

const hasAppliedFilters = (filters: MonsterFilters) =>
  !!filters.name ||
  !!filters.type ||
  filters.minCR !== undefined ||
  filters.maxCR !== undefined;

export const useAdminMonsterStore = create<AdminMonsterStore>((set, get) => ({
  monsters: [],
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  filters: { name: "", type: "", minCR: undefined, maxCR: undefined },
  appliedFilters: {},
  npcFilter: "all",

  setFilters: (partial) =>
    set((state) => ({
      filters: { ...state.filters, ...partial },
    })),

  setNpcFilter: (filter) => set({ npcFilter: filter }),

  loadMonsters: async (opts) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    const targetPage = opts?.page ?? get().page;
    const targetPageSize = opts?.pageSize ?? get().pageSize;
    const applied = get().appliedFilters;
    const npcFilter = get().npcFilter;
    const useFilters = hasAppliedFilters(applied);

    set({ loading: true });
    try {
      let list: Monster[] = [];
      let totalCount = 0;

      if (useFilters) {
        const res = await monsterService.search(
          {
            page: targetPage,
            pageSize: targetPageSize,
            name: applied.name,
            type: applied.type,
            minCR: applied.minCR,
            maxCR: applied.maxCR,
          },
          token
        );
        list = res.monsters;
        const foundCount = (res as any).Found ?? (res as any).found;
        totalCount = foundCount ?? res.monsters.length;
      } else {
        const [paged, countRes] = await Promise.all([
          monsterService.getPaged(targetPage, targetPageSize, token),
          monsterService.getCount(token),
        ]);
        list = paged;
        const apiCount = (countRes as any).Count ?? (countRes as any).count;
        totalCount = apiCount ?? paged.length;
      }

      const filteredByNpc =
        npcFilter === "all"
          ? list
          : list.filter((m) => (npcFilter === "npc" ? m.isNpc : !m.isNpc));

      set({
        monsters: filteredByNpc,
        total: npcFilter === "all" ? totalCount : filteredByNpc.length,
        page: targetPage,
        pageSize: targetPageSize,
      });
    } finally {
      set({ loading: false });
    }
  },

  applyFilters: async () => {
    set((state) => ({
      appliedFilters: {
        name: state.filters.name || undefined,
        type: state.filters.type || undefined,
        minCR: state.filters.minCR,
        maxCR: state.filters.maxCR,
      },
      page: 1,
    }));
    await get().loadMonsters({ page: 1 });
  },

  resetFilters: async () => {
    set({
      filters: { name: "", type: "", minCR: undefined, maxCR: undefined },
      appliedFilters: {},
      npcFilter: "all",
      page: 1,
    });
    await get().loadMonsters({ page: 1 });
  },

  createMonster: async (monster) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    const created = await monsterService.create(monster, token);
    set((state) => ({
      monsters: [created, ...state.monsters],
      total: state.total + 1,
    }));
  },

  updateMonster: async (id, monster) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    const updated = await monsterService.update(id, monster, token);
    set((state) => ({
      monsters: state.monsters.map((m) => (m.id === updated.id ? updated : m)),
    }));
  },

  deleteMonster: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    await monsterService.delete(id, token);
    set((state) => ({
      monsters: state.monsters.filter((m) => m.id !== id),
      total: Math.max(0, state.total - 1),
    }));
  },

  clearStorage: () =>
    set({
      monsters: [],
      total: 0,
      page: 1,
      pageSize: 10,
      loading: false,
      filters: { name: "", type: "", minCR: undefined, maxCR: undefined },
      appliedFilters: {},
      npcFilter: "all",
    }),
}));

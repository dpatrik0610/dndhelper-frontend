import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character } from "@appTypes/Character/Character";

export type InitiativeEntryType = "character" | "enemy" | "ally" | "environment";

export interface ConditionEntry {
  id: string;
  label: string;
  remaining: number | null; // null = indefinite
}

export interface InitiativeEntry {
  id: string;
  characterId?: string;
  name: string;
  type: InitiativeEntryType;
  initiative: number;
  hp?: number | null;
  tempHp?: number | null;
  ac?: number | null;
  color?: string;
  conditions: ConditionEntry[];
}

interface InitiativeTrackerState {
  rows: InitiativeEntry[];
  activeIndex: number;
  cycleCount: number;
  addEntry: (entry: InitiativeEntry) => void;
  addCharacter: (
    character: Pick<Character, "id" | "name"> &
      Partial<
        Pick<Character, "hitPoints" | "temporaryHitPoints" | "maxHitPoints" | "armorClass" | "conditions">
      >
  ) => void;
  updateEntry: (id: string, partial: Partial<InitiativeEntry>) => void;
  removeEntry: (id: string) => void;
  addCondition: (id: string, label: string, remaining: number | null) => void;
  removeCondition: (id: string, conditionId: string) => void;
  nextTurn: () => void;
  setCycleCount: (count: number) => void;
  resetCycles: () => void;
  reset: () => void;
}

const generateId = () => Math.random().toString(36).slice(2, 9);
const defaultColorByType: Record<InitiativeEntryType, string> = {
  character: "#60a5fa",
  enemy: "#f87171",
  ally: "#34d399",
  environment: "#fbbf24",
};

export const useInitiativeTrackerStore = create<InitiativeTrackerState>()(
  persist(
    (set) => ({
      rows: [],
      activeIndex: 0,
      cycleCount: 0,

      addEntry: (entry) =>
        set((state) => ({
          rows: [
            ...state.rows,
            {
              ...entry,
              id: entry.id || generateId(),
              color: entry.color || defaultColorByType[entry.type],
              conditions: entry.conditions || [],
              characterId: entry.characterId,
            },
          ],
        })),

      addCharacter: (character) =>
        set((state) => ({
          rows: [
            ...state.rows,
            {
              id: generateId(),
              characterId: character.id,
              name: character.name || "Unnamed",
              type: "character",
              initiative: 0,
              hp: (character.hitPoints as number | undefined) ?? (character.maxHitPoints as number | undefined) ?? null,
              tempHp: (character.temporaryHitPoints as number | undefined) ?? null,
              ac: (character.armorClass as number | undefined) ?? null,
              color: defaultColorByType.character,
              conditions: (character.conditions ?? []).map((label) => ({
                id: `${character.id}-${label}`,
                label,
                remaining: null,
              })),
            },
          ],
        })),

      updateEntry: (id, partial) =>
        set((state) => ({
          rows: state.rows.map((row) => (row.id === id ? { ...row, ...partial } : row)),
        })),

      removeEntry: (id) =>
        set((state) => {
          const rows = state.rows.filter((row) => row.id !== id);
          const activeIndex = Math.min(state.activeIndex, Math.max(rows.length - 1, 0));
          return { rows, activeIndex };
        }),

      addCondition: (id, label, remaining) =>
        set((state) => ({
          rows: state.rows.map((row) =>
            row.id === id
              ? {
                  ...row,
                  conditions: [...(row.conditions || []), { id: generateId(), label, remaining }],
                }
              : row
          ),
        })),

      removeCondition: (id, conditionId) =>
        set((state) => ({
          rows: state.rows.map((row) =>
            row.id === id
              ? { ...row, conditions: (row.conditions || []).filter((c) => c.id !== conditionId) }
              : row
          ),
        })),

      nextTurn: () =>
        set((state) => {
          if (state.rows.length === 0) return state;
          const currentIndex = state.activeIndex;
          const updatedRows = state.rows.map((row, idx) => {
            if (idx !== currentIndex) return row;
            const updatedConds = (row.conditions || []).map((c) =>
              c.remaining === null ? c : { ...c, remaining: Math.max(0, c.remaining - 1) }
            );
            return {
              ...row,
              conditions: updatedConds.filter((c) => c.remaining !== 0),
            };
          });

          const nextIndex = currentIndex + 1;
          if (nextIndex >= updatedRows.length) {
            return { rows: updatedRows, activeIndex: 0, cycleCount: state.cycleCount + 1 };
          }
          return { rows: updatedRows, activeIndex: nextIndex };
        }),

      setCycleCount: (count) => set({ cycleCount: Math.max(0, count) }),
      resetCycles: () =>
        set((state) => ({
          cycleCount: 0,
          activeIndex: Math.min(state.activeIndex, Math.max(state.rows.length - 1, 0)),
        })),

      reset: () => set({ rows: [], activeIndex: 0, cycleCount: 0 }),
    }),
    {
      name: "initiative-tracker",
      partialize: (state) => ({
        rows: state.rows,
        activeIndex: state.activeIndex,
        cycleCount: state.cycleCount,
      }),
    }
  )
);

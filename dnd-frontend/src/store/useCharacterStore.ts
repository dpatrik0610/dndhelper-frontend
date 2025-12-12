import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character } from "@appTypes/Character/Character";
import { updateCharacter as updateCharacterApi } from "@services/characterService";
import { useAuthStore } from "@store/useAuthStore";

interface CharacterState {
  character: Character | null;
  characters: Character[];

  setCharacter: (character: Character | null) => void;
  setCharacters: (characters: Character[]) => void;

  updateCharacter: (updated: Partial<Character>) => void;
  persistCharacter: () => Promise<Character | null>;

  removeCondition: (condition: string) => void;
  addCondition: (condition: string) => void;
  removeCurrency: (currencyType: string, amount: number) => void;

  clearStore: () => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => {
      const normalizeSpells = (spells?: Character["spells"]) =>
        (spells ?? []).map((spell: any) =>
          typeof spell === "string" ? { spellId: spell, isPrepared: false } : spell
        );

      const normalizeCharacter = (next: Character | null) =>
        next ? { ...next, spells: normalizeSpells(next.spells) } : null;

      const upsertLocalCharacter = (next: Character) => {
        const normalized = normalizeCharacter(next);
        if (!normalized) return;
        set({ character: normalized });
        set((state) => ({
          characters: state.characters.map((c) => (c.id === normalized.id ? normalized : c)),
        }));
      };

      const persistToApi = async (character: Character) => {
        if (!character?.id) return null;
        const token = useAuthStore.getState().token;
        if (!token) return null;

        try {
          const saved = await updateCharacterApi(character, token);
          if (saved) upsertLocalCharacter(saved);
          return saved ?? null;
        } catch (err) {
          console.error("Failed to persist character", err);
          return null;
        }
      };

      const applyAndPersist = (updater: (current: Character) => Character | null) => {
        const current = get().character;
        if (!current) return;
        const updated = updater(current);
        const normalized = normalizeCharacter(updated);
        if (!normalized) return;
        upsertLocalCharacter(normalized);
        void persistToApi(normalized);
      };

      return {
        character: null,
        characters: [],

        setCharacter: (character) => set({ character: normalizeCharacter(character) }),
        setCharacters: (characters) => set({ characters: characters.map((c) => normalizeCharacter(c)!).filter(Boolean) as Character[] }),

        updateCharacter: (updated: Partial<Character>) => applyAndPersist((current) => ({ ...current, ...updated })),

        persistCharacter: async () => {
          const current = get().character;
          if (!current) return null;
          return await persistToApi(current);
        },

        removeCondition: (condition: string) =>
          applyAndPersist((current) => ({
            ...current,
            conditions: current.conditions.filter((c) => c !== condition),
          })),

        addCondition: (condition: string) =>
          applyAndPersist((current) => {
            if (current.conditions.includes(condition)) return null;
            return { ...current, conditions: [...current.conditions, condition] };
          }),

        removeCurrency: (currencyType: string, amount: number) =>
          applyAndPersist((current) => {
            const existing = current.currencies?.find((c) => c.type === currencyType);
            if (!existing) return null;

            const newAmount = existing.amount - amount;
            const updatedCurrencies =
              newAmount > 0
                ? current.currencies.map((c) => (c.type === currencyType ? { ...c, amount: newAmount } : c))
                : current.currencies.filter((c) => c.type !== currencyType);

            return { ...current, currencies: updatedCurrencies };
          }),

        clearStore: () => set({ character: null, characters: [] }),
      };
    },
    {
      name: "character-storage",
      partialize: (state) => ({
        character: state.character,
        characters: state.characters,
      }),
    }
  )
);

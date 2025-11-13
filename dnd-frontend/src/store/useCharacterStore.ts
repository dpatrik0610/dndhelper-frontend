import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character } from "../types/Character/Character";

interface CharacterState {
  character: Character | null;
  characters: Character[];

  setCharacter: (character: Character) => void;
  setCharacters: (characters: Character[]) => void;

  updateCharacter: (updated: Partial<Character>) => void;

  removeCondition: (condition: string) => void;
  addCondition: (condition: string) => void;

  removeCurrency: (currencyType: string, amount: number) => void;

  clearStore: () => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      character: null,
      characters: [],

      setCharacter: (character) => set({ character }),
      setCharacters: (characters) => set({ characters }),

      updateCharacter: (updated: Partial<Character>) => {
        const current = get().character;
        if (!current) return;

        const newCharacter = { ...current, ...updated };
        set({ character: newCharacter });

        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === newCharacter.id ? newCharacter : c
          ),
        }));
      },

      removeCondition: (condition: string) => {
        const current = get().character;
        if (!current) return;

        const updated = {
          ...current,
          conditions: current.conditions.filter((c) => c !== condition),
        };

        set({ character: updated });

        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === updated.id ? updated : c
          ),
        }));
      },

      addCondition: (condition: string) => {
        const current = get().character;
        if (!current) return;
        if (current.conditions.includes(condition)) return;

        const updated = {
          ...current,
          conditions: [...current.conditions, condition],
        };

        set({ character: updated });

        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === updated.id ? updated : c
          ),
        }));
      },

      removeCurrency: (currencyType: string, amount: number) => {
        const current = get().character;
        if (!current) return;

        const existing = current.currencies?.find((c) => c.type === currencyType);
        if (!existing) return;

        const newAmount = existing.amount - amount;

        const updatedCurrencies =
          newAmount > 0
            ? current.currencies.map((c) =>
                c.type === currencyType ? { ...c, amount: newAmount } : c
              )
            : current.currencies.filter((c) => c.type !== currencyType);

        const updated = {
          ...current,
          currencies: updatedCurrencies,
        };

        set({ character: updated });

        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === updated.id ? updated : c
          ),
        }));
      },

      clearStore: () => set({ character: null, characters: [] }),

    }),
    {
      name: "character-storage",
      partialize: (state) => ({
        character: state.character,
        characters: state.characters,
      }),
    }
  )
);

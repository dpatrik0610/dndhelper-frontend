import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character } from "../types/Character/Character";

interface CharacterState {
  character: Character | null;
  characters: Character[];

  // actions
  setCharacter: (character: Character) => void;
  setCharacters: (characters: Character[]) => void;
  updateCharacter: (updated: Partial<Character>) => void;
  clearCharacter: () => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      character: null,
      characters: [],

      setCharacter: (character) => set({ character }),
      setCharacters: (characters) => set({ characters }),

      updateCharacter: (updated) => {
        const current = get().character;
        if (!current) return;
        set({ character: { ...current, ...updated } });
      },

      clearCharacter: () => set({ character: null, characters: [] }),
    }),
    {
      name: "character-storage", // localStorage key
      partialize: (state) => ({
        character: state.character,
        characters: state.characters,
      }),
    }
  )
);

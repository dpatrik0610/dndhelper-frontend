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
  clearStore: () => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      characterForm: null,
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
      
      clearStore: () => set({ character: null, characters: []}),
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

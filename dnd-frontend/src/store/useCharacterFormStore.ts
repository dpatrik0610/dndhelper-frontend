import { create } from "zustand";
import type { Character } from "../types/Character/Character";
import { defaultCharacter } from "../types/Character/DefaultCharacter";

interface CharacterFormStore {
  characterForm: Character;

  /** Set one or more top-level fields */
  setCharacterForm: (data: Partial<Character>) => void;

  /** Set deeply nested fields safely */
  setField: <K extends keyof Character>(key: K, value: Character[K]) => void;

  /** Replace entire character */
  replaceCharacterForm: (data: Character) => void;

  /** Reset everything to default */
  resetCharacterForm: () => void;
}

export const useCharacterFormStore = create<CharacterFormStore>((set) => ({
  characterForm: { ...defaultCharacter },

  setCharacterForm: (data) =>
    set((state) => ({
      characterForm: { ...state.characterForm, ...data },
    })),

  setField: (key, value) =>
    set((state) => ({
      characterForm: { ...state.characterForm, [key]: value },
    })),

  replaceCharacterForm: (data) =>
    set({ characterForm: { ...data } }),

  resetCharacterForm: () =>
    set({ characterForm: { ...defaultCharacter } }),
  
}));

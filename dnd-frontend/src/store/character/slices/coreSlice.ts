import type { StateCreator } from "zustand";
import type { CharacterStoreState, CoreSliceState, CoreSliceActions } from "../storeTypes";
import type { Character } from "@appTypes/Character/Character";

const normalizeSpells = (spells?: Character["spells"]) =>
  (spells ?? []).map((spell: any) =>
    typeof spell === "string" ? { spellId: spell, isPrepared: false } : spell
  );

export const normalizeCharacter = (next: Character | null): Character | null =>
  next ? { ...next, spells: normalizeSpells(next.spells) } : null;

export const createCoreSlice: StateCreator<
  CharacterStoreState,
  [["zustand/immer", never]],
  [],
  CoreSliceState & CoreSliceActions
> = (set, get) => ({
  character: null,
  characters: [],

  setCharacter: (character) => {
    const normalized = normalizeCharacter(character);
    set((state) => {
      state.character = normalized as any; // Cast for Draft compatibility
    });
  },

  setCharacters: (characters) => {
    const normalized = characters.map((c) => normalizeCharacter(c)!).filter(Boolean) as Character[];
    set((state) => {
      state.characters = normalized as any;
    });
  },

  updateCharacter: (updated) => {
    get().applyAndPersist((current) => ({ ...current, ...updated }));
  },

  clearStore: () => {
    set((state) => {
      state.character = null;
      state.characters = [];
    });
  },
});

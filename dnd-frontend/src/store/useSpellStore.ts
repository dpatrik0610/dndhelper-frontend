import { persist } from "zustand/middleware";
import type { SpellNameResponse } from "../services/spellService";
import type { Spell } from "../types/Spell";
import { create } from "zustand";

interface SpellStore {
  spellNames: SpellNameResponse[];
  currentSpell: Spell | null;
  setSpellNames: (spells: SpellNameResponse[]) => void;
  setCurrentSpell: (spell: Spell | null) => void;
  clearCurrentSpell: () => void;
}

export const useSpellStore = create<SpellStore>()(
  persist(
    (set) => ({
      spellNames: [],
      currentSpell: null,

      setSpellNames: (spells) => set({ spellNames: spells }),
      setCurrentSpell: (spell) => set({ currentSpell: spell }),
      clearCurrentSpell: () => set({ currentSpell: null }),
    }),
    {
      name: "spell-storage",
      partialize: (state) => ({
        spellNames: state.spellNames,
        currentSpell: state.currentSpell,
      }),
    }
  )
);
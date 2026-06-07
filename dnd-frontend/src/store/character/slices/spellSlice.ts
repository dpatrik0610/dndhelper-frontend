import type { StateCreator } from "zustand";
import type { CharacterStoreState, SpellSliceActions } from "../storeTypes";

export const createSpellSlice: StateCreator<
  CharacterStoreState,
  [["zustand/immer", never]],
  [],
  SpellSliceActions
> = (_set, get) => ({
  useSpellSlot: (level) => {
    get().applyAndPersist((current) => {
      const slotIndex = current.spellSlots.findIndex((s) => s.level === level);
      if (slotIndex === -1) return current;

      const newSlots = [...current.spellSlots];
      const slot = newSlots[slotIndex]!;
      if (slot.current > 0) {
        newSlots[slotIndex] = { ...slot, current: slot.current - 1 };
        return { ...current, spellSlots: newSlots };
      }
      return current;
    });
  },

  restoreSpellSlot: (level) => {
    get().applyAndPersist((current) => {
      const slotIndex = current.spellSlots.findIndex((s) => s.level === level);
      if (slotIndex === -1) return current;

      const newSlots = [...current.spellSlots];
      const slot = newSlots[slotIndex]!;
      if (slot.current < slot.max) {
        newSlots[slotIndex] = { ...slot, current: slot.current + 1 };
        return { ...current, spellSlots: newSlots };
      }
      return current;
    });
  },

  restoreAllSpellSlots: () => {
    get().applyAndPersist((current) => {
      const newSlots = current.spellSlots.map((s) => ({ ...s, current: s.max }));
      return { ...current, spellSlots: newSlots };
    });
  },

  prepareSpell: (spellId) => {
    get().applyAndPersist((current) => {
      const newSpells = current.spells.map((s) =>
        s.spellId === spellId ? { ...s, isPrepared: true } : s
      );
      return { ...current, spells: newSpells };
    });
  },

  unprepareSpell: (spellId) => {
    get().applyAndPersist((current) => {
      const newSpells = current.spells.map((s) =>
        s.spellId === spellId ? { ...s, isPrepared: false } : s
      );
      return { ...current, spells: newSpells };
    });
  },
});

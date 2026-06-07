import { useSpellStore } from "./spellStore";
import { useShallow } from "zustand/react/shallow";

// Data Selectors
export const useSpellNamesList = () => useSpellStore((s) => s.spellNames);
export const useCurrentSpell = () => useSpellStore((s) => s.currentSpell);

// Action Selectors
export const useSpellActions = () => useSpellStore(useShallow((s) => ({
  setSpellNames: s.setSpellNames,
  setCurrentSpell: s.setCurrentSpell,
  clearCurrentSpell: s.clearCurrentSpell,
})));

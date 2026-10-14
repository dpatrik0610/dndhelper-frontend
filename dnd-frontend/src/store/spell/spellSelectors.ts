import { useSpellStore } from "./spellStore";
import { useShallow } from "zustand/react/shallow";

export const useSpellNamesList = () => useSpellStore((s) => s.spellNames);
export const useCurrentSpell = () => useSpellStore((s) => s.currentSpell);

export const useSpellActions = () => useSpellStore(useShallow((s) => ({
  setSpellNames: s.setSpellNames,
  setCurrentSpell: s.setCurrentSpell,
  clearCurrentSpell: s.clearCurrentSpell,
})));

import { useCharacterStore } from "./characterStore";
import { useShallow } from "zustand/react/shallow";

// --- Data Selectors ---
export const useCurrentCharacter = () => useCharacterStore((s) => s.character);
export const useCharacterList = () => useCharacterStore((s) => s.characters);
export const useCharacterName = () => useCharacterStore((s) => s.character?.name ?? "");
export const useCharacterHp = () => useCharacterStore(useShallow((s) => s.character ? {
  current: s.character.hitPoints,
  max: s.character.maxHitPoints,
  temp: s.character.temporaryHitPoints
} : null));

// --- Action Selectors ---
// We use a selector to return the actions so components can destructure without re-rendering on every state change

export const useCharacterCoreActions = () => useCharacterStore(useShallow((s) => ({
  setCharacter: s.setCharacter,
  setCharacters: s.setCharacters,
  updateCharacter: s.updateCharacter,
  clearStore: s.clearStore,
})));

export const useCharacterCombatActions = () => useCharacterStore(useShallow((s) => ({
  takeDamage: s.takeDamage,
  heal: s.heal,
  addTemporaryHp: s.addTemporaryHp,
  addCondition: s.addCondition,
  removeCondition: s.removeCondition,
  setArmorClass: s.setArmorClass,
  recordDeathSave: s.recordDeathSave,
  resetDeathSaves: s.resetDeathSaves,
})));

export const useCharacterSpellActions = () => useCharacterStore(useShallow((s) => ({
  useSpellSlot: s.useSpellSlot,
  restoreSpellSlot: s.restoreSpellSlot,
  restoreAllSpellSlots: s.restoreAllSpellSlots,
  prepareSpell: s.prepareSpell,
  unprepareSpell: s.unprepareSpell,
})));

export const useCharacterCurrencyActions = () => useCharacterStore(useShallow((s) => ({
  addCurrency: s.addCurrency,
  removeCurrency: s.removeCurrency,
  setCurrencies: s.setCurrencies,
})));

export const useCharacterPersistActions = () => useCharacterStore(useShallow((s) => ({
  persistCharacter: s.persistCharacter,
})));

import type { Character } from "@appTypes/Character/Character";
import type { Currency } from "@appTypes/Currency";

export interface CoreSliceState {
  character: Character | null;
  characters: Character[];
}

export interface CoreSliceActions {
  setCharacter: (character: Character | null) => void;
  setCharacters: (characters: Character[]) => void;
  updateCharacter: (updated: Partial<Character>) => void; // Keep for generic updates not covered by specific slices
  clearStore: () => void;
}

export interface CombatSliceActions {
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  addTemporaryHp: (amount: number) => void;
  addCondition: (condition: string) => void;
  removeCondition: (condition: string) => void;
  setArmorClass: (ac: number) => void;
  recordDeathSave: (success: boolean) => void;
  resetDeathSaves: () => void;
}

export interface SpellSliceActions {
  useSpellSlot: (level: number) => void;
  restoreSpellSlot: (level: number) => void;
  restoreAllSpellSlots: () => void;
  prepareSpell: (spellId: string) => void;
  unprepareSpell: (spellId: string) => void;
}

export interface CurrencySliceActions {
  addCurrency: (type: string, amount: number) => void;
  removeCurrency: (type: string, amount: number) => void;
  setCurrencies: (currencies: Currency[]) => void;
}

export interface PersistSliceActions {
  persistCharacter: () => Promise<Character | null>;
  applyAndPersist: (updater: (current: Character) => Character | null) => void;
}

export type CharacterState = CoreSliceState;
export type CharacterActions = CoreSliceActions & CombatSliceActions & SpellSliceActions & CurrencySliceActions & PersistSliceActions;

export type CharacterStoreState = CharacterState & CharacterActions;

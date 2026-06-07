import type { StateCreator } from "zustand";
import type { CharacterStoreState, CombatSliceActions } from "../storeTypes";

export const createCombatSlice: StateCreator<
  CharacterStoreState,
  [["zustand/immer", never]],
  [],
  CombatSliceActions
> = (_set, get) => ({
  takeDamage: (amount) => {
    get().applyAndPersist((current) => {
      let remainingDamage = amount;
      let tempHp = current.temporaryHitPoints ?? 0;
      let hp = current.hitPoints ?? 0;

      if (tempHp > 0) {
        if (tempHp >= remainingDamage) {
          tempHp -= remainingDamage;
          remainingDamage = 0;
        } else {
          remainingDamage -= tempHp;
          tempHp = 0;
        }
      }

      hp = Math.max(0, hp - remainingDamage);

      return { ...current, temporaryHitPoints: tempHp, hitPoints: hp };
    });
  },

  heal: (amount) => {
    get().applyAndPersist((current) => {
      const max = current.maxHitPoints ?? 0;
      const hp = Math.min(max, (current.hitPoints ?? 0) + amount);
      return { ...current, hitPoints: hp };
    });
  },

  addTemporaryHp: (amount) => {
    get().applyAndPersist((current) => {
      const tempHp = Math.max(current.temporaryHitPoints ?? 0, amount);
      return { ...current, temporaryHitPoints: tempHp };
    });
  },

  addCondition: (condition) => {
    get().applyAndPersist((current) => {
      if (current.conditions.includes(condition)) return current;
      return { ...current, conditions: [...current.conditions, condition] };
    });
  },

  removeCondition: (condition) => {
    get().applyAndPersist((current) => ({
      ...current,
      conditions: current.conditions.filter((c) => c !== condition),
    }));
  },

  setArmorClass: (ac) => {
    get().applyAndPersist((current) => ({ ...current, armorClass: ac }));
  },

  recordDeathSave: (success) => {
    get().applyAndPersist((current) => {
      if (success) {
        return { ...current, deathSavesSuccesses: Math.min(3, (current.deathSavesSuccesses ?? 0) + 1) };
      } else {
        return { ...current, deathSavesFailures: Math.min(3, (current.deathSavesFailures ?? 0) + 1) };
      }
    });
  },

  resetDeathSaves: () => {
    get().applyAndPersist((current) => ({
      ...current,
      deathSavesSuccesses: 0,
      deathSavesFailures: 0,
    }));
  },
});

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { CharacterStoreState } from "./storeTypes";

import { createCoreSlice } from "./slices/coreSlice";
import { createCombatSlice } from "./slices/combatSlice";
import { createSpellSlice } from "./slices/spellSlice";
import { createCurrencySlice } from "./slices/currencySlice";
import { createPersistSlice } from "./slices/persistSlice";

export const useCharacterStore = create<CharacterStoreState>()(
  persist(
    immer((...args) => ({
      ...createCoreSlice(...args),
      ...createCombatSlice(...args),
      ...createSpellSlice(...args),
      ...createCurrencySlice(...args),
      ...createPersistSlice(...args),
    })),
    {
      name: "character-storage",
      partialize: (state) => ({
        character: state.character,
        characters: state.characters,
      }),
    }
  )
);

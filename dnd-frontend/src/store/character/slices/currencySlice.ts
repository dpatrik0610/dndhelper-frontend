import type { StateCreator } from "zustand";
import { adjustCurrency } from "@utils/currency";
import type { CharacterStoreState, CurrencySliceActions } from "@store/character/storeTypes";

export const createCurrencySlice: StateCreator<
  CharacterStoreState,
  [["zustand/immer", never]],
  [],
  CurrencySliceActions
> = (_set, get) => ({
  addCurrency: (currencyType, amount) => {
    get().applyAndPersist((current) => ({
      ...current,
      currencies: adjustCurrency(current.currencies ?? [], currencyType, amount),
    }));
  },

  removeCurrency: (currencyType, amount) => {
    get().applyAndPersist((current) => ({
      ...current,
      currencies: adjustCurrency(current.currencies ?? [], currencyType, -amount),
    }));
  },

  setCurrencies: (currencies) => {
    get().applyAndPersist((current) => ({ ...current, currencies }));
  },
});

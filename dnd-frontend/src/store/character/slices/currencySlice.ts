import type { StateCreator } from "zustand";
import type { CharacterStoreState, CurrencySliceActions } from "../storeTypes";

export const createCurrencySlice: StateCreator<
  CharacterStoreState,
  [["zustand/immer", never]],
  [],
  CurrencySliceActions
> = (_set, get) => ({
  addCurrency: (currencyType, amount) => {
    get().applyAndPersist((current) => {
      const existing = current.currencies?.find((c) => c.type === currencyType);
      
      const newCurrencies = current.currencies ? [...current.currencies] : [];
      if (existing) {
        const idx = newCurrencies.findIndex(c => c.type === currencyType);
        newCurrencies[idx] = { ...existing, amount: existing.amount + amount };
      } else {
        newCurrencies.push({ type: currencyType, amount, currencyCode: currencyType });
      }

      return { ...current, currencies: newCurrencies };
    });
  },

  removeCurrency: (currencyType, amount) => {
    get().applyAndPersist((current) => {
      const existing = current.currencies?.find((c) => c.type === currencyType);
      if (!existing) return current;

      const newAmount = existing.amount - amount;
      const updatedCurrencies =
        newAmount > 0
          ? current.currencies.map((c) => (c.type === currencyType ? { ...c, amount: newAmount } : c))
          : current.currencies.filter((c) => c.type !== currencyType);

      return { ...current, currencies: updatedCurrencies };
    });
  },

  setCurrencies: (currencies) => {
    get().applyAndPersist((current) => ({ ...current, currencies }));
  },
});


import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency } from "@appTypes/Currency";
import {
  getCharacterCurrencies,
  removeCurrencies,
  transferCurrenciesToCharacter,
  transferCurrenciesToInventory
} from "@services/currencyService";
import type { Character } from "@appTypes/Character/Character";
import type { Inventory } from "@appTypes/Inventory/Inventory";

import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { getInventory } from "@services/inventoryService";

interface AdminCurrencyStore {
  selectedCharacter: Character | null;
  selectedInventory: Inventory | null;
  currencies: Currency[];
  loading: boolean;

  loadCharacterById: (characterId: string) => Promise<void>;
  loadInventoryById: (inventoryId: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearStorage: () => void;

  // For SignalR sync
  setSelectedInventory: (inv: Inventory | null) => void;
  setCurrencies: (currencies: Currency[]) => void;
  applyInventoryUpdate: (inv: Inventory) => void;

  remove: (characterId: string, currencies: Currency[]) => Promise<void>;
  transfer: (targetId: string, currencies: Currency[]) => Promise<void>;
  addToCharacter: (currencies: Currency[], characterId?: string) => Promise<void>;
  removeFromCharacter: (currencies: Currency[], characterId?: string) => Promise<void>;
  addToInventory: (currencies: Currency[], inventoryId?: string) => Promise<void>;
  removeFromInventory: (currencies: Currency[], inventoryId?: string) => Promise<void>;
}

export const useAdminCurrencyStore = create<AdminCurrencyStore>()(
  persist(
    (set, get) => ({
      selectedCharacter: null,
      selectedInventory: null,
      currencies: [],
      loading: false,

      setSelectedInventory: (inv) => set({ selectedInventory: inv }),
      setCurrencies: (currencies) => set({ currencies }),
      
      applyInventoryUpdate: (inv) =>
        set((state) => ({
          selectedInventory:
            state.selectedInventory?.id === inv.id
              ? inv
              : state.selectedInventory,
        })),

      loadCharacterById: async (characterId) => {

        set({ loading: true });
        try {
          const currencies = await getCharacterCurrencies(characterId);
          set({
            selectedCharacter: { id: characterId } as Character,
            currencies,
          });
        } catch (err) {
          showNotification({
            title: "Error loading character",
            message: String(err),
            color: SectionColor.Red,
          });
        } finally {
          set({ loading: false });
        }
      },

      loadInventoryById: async (inventoryId) => {

        set({ loading: true });
        try {
          const inv = await getInventory(inventoryId);
          set({ selectedInventory: inv });
        } catch (err) {
          showNotification({
            title: "Error loading inventory",
            message: String(err),
            color: SectionColor.Red,
          });
        } finally {
          set({ loading: false });
        }
      },

      refresh: async () => {

        const { selectedCharacter, selectedInventory } = get();
        try {
          if (selectedCharacter?.id) {
            const currencies = await getCharacterCurrencies(selectedCharacter.id);
            set({ currencies });
          }
          if (selectedInventory?.id) {
            const inv = await getInventory(selectedInventory.id);
            set({ selectedInventory: inv });
          }
        } catch (err) {
          showNotification({
            title: "Error refreshing data",
            message: String(err),
            color: SectionColor.Red,
          });
        }
      },

      remove: async (characterId, currencies) => {

        await removeCurrencies(characterId, currencies);
        await get().refresh();
      },

      transfer: async (targetId, currencies) => {

        await transferCurrenciesToCharacter(targetId, currencies);
        await get().refresh();
      },

      addToCharacter: async (currencies, characterId) => {

        const id = characterId ?? get().selectedCharacter?.id;
        if (!id) return;
        await transferCurrenciesToCharacter(id, currencies);
        await get().refresh();
      },

      removeFromCharacter: async (currencies, characterId) => {

        const id = characterId ?? get().selectedCharacter?.id;
        if (!id) return;
        await removeCurrencies(id, currencies);
        await get().refresh();
      },

      addToInventory: async (currencies, inventoryId) => {

        const id = inventoryId ?? get().selectedInventory?.id;
        if (!id) return;

        try {
          await transferCurrenciesToInventory(id, currencies);
          await get().refresh();
          showNotification({
            title: "Currencies Added",
            message: "Currencies added to inventory.",
            color: SectionColor.Green,
          });
        } catch (err) {
          showNotification({
            title: "Error adding currencies",
            message: String(err),
            color: SectionColor.Red,
          });
        }
      },

      removeFromInventory: async (currencies, inventoryId) => {

        const id = inventoryId ?? get().selectedInventory?.id;
        if (!id) return;

        try {
          for (const c of currencies) {
            await transferCurrenciesToInventory(id, [{ ...c, amount: -Math.abs(c.amount) }]);
          }
          await get().refresh();
          showNotification({
            title: "Currencies Removed",
            message: "Currencies removed from inventory.",
            color: SectionColor.Red,
          });
        } catch (err) {
          showNotification({
            title: "Error removing currencies",
            message: String(err),
            color: SectionColor.Red,
          });
        }
      },

      clearStorage: () => set({
        selectedCharacter: null,
        selectedInventory: null,
        currencies: [],
        loading: false,
      }),
    }),
    {
      name: "admin-currency-storage",
      partialize: (s) => ({
        selectedCharacter: s.selectedCharacter,
        selectedInventory: s.selectedInventory,
        currencies: s.currencies,
      }),
    }
  )
);

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
import { useAuthStore } from "@store/useAuthStore";
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
        const token = useAuthStore.getState().token!;
        set({ loading: true });
        try {
          const currencies = await getCharacterCurrencies(characterId, token);
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
        const token = useAuthStore.getState().token!;
        set({ loading: true });
        try {
          const inv = await getInventory(inventoryId, token);
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
        const token = useAuthStore.getState().token!;
        const { selectedCharacter, selectedInventory } = get();
        try {
          if (selectedCharacter?.id) {
            const currencies = await getCharacterCurrencies(selectedCharacter.id, token);
            set({ currencies });
          }
          if (selectedInventory?.id) {
            const inv = await getInventory(selectedInventory.id, token);
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
        const token = useAuthStore.getState().token!;
        await removeCurrencies(characterId, currencies, token);
        await get().refresh();
      },

      transfer: async (targetId, currencies) => {
        const token = useAuthStore.getState().token!;
        await transferCurrenciesToCharacter(targetId, currencies, token);
        await get().refresh();
      },

      addToCharacter: async (currencies, characterId) => {
        const token = useAuthStore.getState().token!;
        const id = characterId ?? get().selectedCharacter?.id;
        if (!id) return;
        await transferCurrenciesToCharacter(id, currencies, token);
        await get().refresh();
      },

      removeFromCharacter: async (currencies, characterId) => {
        const token = useAuthStore.getState().token!;
        const id = characterId ?? get().selectedCharacter?.id;
        if (!id) return;
        await removeCurrencies(id, currencies, token);
        await get().refresh();
      },

      addToInventory: async (currencies, inventoryId) => {
        const token = useAuthStore.getState().token!;
        const id = inventoryId ?? get().selectedInventory?.id;
        if (!id) return;

        try {
          await transferCurrenciesToInventory(id, currencies, token);
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
        const token = useAuthStore.getState().token!;
        const id = inventoryId ?? get().selectedInventory?.id;
        if (!id) return;

        try {
          for (const c of currencies) {
            await transferCurrenciesToInventory(id, [{ ...c, amount: -Math.abs(c.amount) }], token);
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

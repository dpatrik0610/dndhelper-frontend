import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Inventory } from "@appTypes/Inventory/Inventory";
import type { InventoryItem } from "@appTypes/Inventory/InventoryItem";
import type { Currency } from "@appTypes/Currency";
import { useAuthStore } from "@store/useAuthStore";

interface InventoryState {
  inventories: Inventory[];
  selectedInventory: Inventory | null;

  // inventory actions
  setInventories: (inventories: Inventory[]) => void;
  addInventory: (inventory: Inventory) => void;
  updateInventory: (updated: Partial<Inventory> & { id: string }) => void;
  removeInventory: (id: string) => void;
  selectInventory: (inventory: Inventory | null) => void;
  moveItem: (sourceInventoryId: string, targetInventoryId: string, equipmentId: string, amount: number) => void;

  updateInventoryCurrencies: (id: string, newCurrencies: Currency[]) => void;
  claimCurrencies: (inventoryId: string, currenciesToClaim: Currency[]) => void;
  
  // item actions
  addItem: (inventoryId: string, item: InventoryItem) => void;
  updateItem: (inventoryId: string, equipmentId: string, updated: Partial<InventoryItem>) => void;
  removeItem: (inventoryId: string, equipmentId: string) => void;
  incrementItemQuantity: (inventoryId: string, equipmentId: string, amount?: number) => void;
  decrementItemQuantity: (inventoryId: string, equipmentId: string, amount?: number) => void;
  clearInventories: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      inventories: [],
      selectedInventory: null,

      // --- Inventory management ---
      setInventories: (inventories) => set({ inventories }),
      addInventory: (inventory) =>
        set((state) => ({ inventories: [...state.inventories, inventory] })),
      updateInventory: ({ id, ...updated }) =>
        set((state) => ({
          inventories: state.inventories.map((inv) =>
            inv.id === id ? { ...inv, ...updated } : inv
          ),
        })),
      removeInventory: (id) =>
        set((state) => ({
          inventories: state.inventories.filter((inv) => inv.id !== id),
        })),
      selectInventory: (inventory) => set({ selectedInventory: inventory }),
      clearInventories: () => set({ inventories: [], selectedInventory: null }),

      moveItem: (sourceInventoryId: string, targetInventoryId: string, equipmentId: string, amount: number) =>
        set((state) => {
          const source = state.inventories.find((inv) => inv.id === sourceInventoryId);
          const target = state.inventories.find((inv) => inv.id === targetInventoryId);
          if (!source || !target || !source.items) return state;

          const itemIndex = source.items.findIndex((i) => i.equipmentId === equipmentId);
          if (itemIndex === -1) return state;

          const item = { ...source.items[itemIndex] };

          // Reduce quantity from source
          if ((item.quantity || 0) > amount) {
            source.items[itemIndex].quantity = (item.quantity || 0) - amount;
          } else {
            // remove if fully moved
            source.items.splice(itemIndex, 1);
          }

          // Add to target
          if (!target.items) target.items = [];
          const targetItemIndex = target.items.findIndex((i) => i.equipmentId === equipmentId);

          if (targetItemIndex !== -1) {
            target.items[targetItemIndex].quantity! += amount;
          } else {
            target.items.push({ ...item, quantity: amount });
          }

          return { inventories: [...state.inventories] };
        }),

      // --- Item management ---
      addItem: (inventoryId, item) =>
        set((state) => ({
          inventories: state.inventories.map((inv) =>
            inv.id === inventoryId
              ? { ...inv, items: [...(inv.items || []), item] }
              : inv
          ),
        })),

      updateItem: (inventoryId, equipmentId, updated) =>
        set((state) => ({
          inventories: state.inventories.map((inv) =>
            inv.id === inventoryId
              ? {
                  ...inv,
                  items: inv.items?.map((i) =>
                    i.equipmentId === equipmentId ? { ...i, ...updated } : i
                  ),
                }
              : inv
          ),
        })),

      removeItem: (inventoryId, equipmentId) =>
        set((state) => ({
          inventories: state.inventories.map((inv) =>
            inv.id === inventoryId
              ? { ...inv, items: inv.items?.filter((i) => i.equipmentId !== equipmentId) }
              : inv
          ),
        })),

      incrementItemQuantity: (inventoryId, equipmentId, amount = 1) =>
        set((state) => ({
          inventories: state.inventories.map((inv) =>
            inv.id === inventoryId
              ? {
                  ...inv,
                  items: inv.items?.map((i) =>
                    i.equipmentId === equipmentId
                      ? { ...i, quantity: (i.quantity || 0) + amount }
                      : i
                  ),
                }
              : inv
          ),
        })),

      decrementItemQuantity: (inventoryId, equipmentId, amount = 1) =>
        set((state) => ({
          inventories: state.inventories.map((inv) =>
            inv.id === inventoryId
              ? {
                  ...inv,
                  items: inv.items?.map((i) =>
                    i.equipmentId === equipmentId
                      ? { ...i, quantity: Math.max(0, (i.quantity || 0) - amount) }
                      : i
                  ),
                }
              : inv
          ),
        })),

      updateInventoryCurrencies: (id: string, newCurrencies: Currency[]) =>
        set((state) => {
          return {
            inventories: state.inventories.map((inv) =>
              inv.id === id ? { ...inv, currencies: newCurrencies } : inv
            ),
          };
        }),

        claimCurrencies: (inventoryId: string, currenciesToClaim: Currency[]) =>
          set((state) => ({
            inventories: state.inventories.map((inv) => {
              if (inv.id !== inventoryId) return inv;

              const existing = inv.currencies || [];

              // reduce inventory currencies
              const updated = existing
                .map((c) => {
                  const claim = currenciesToClaim.find((x) => x.currencyCode === c.currencyCode);
                  if (!claim) return c;

                  const newAmount = c.amount - claim.amount;
                  return { ...c, amount: Math.max(0, newAmount) };
                })
                .filter((c) => c.amount > 0);

              return { ...inv, currencies: updated };
            }),
          })),

    }),
    {
      name: "inventory-storage",
      partialize: (state) => ({
        inventories: state.inventories,
        selectedInventory: state.selectedInventory,
      }),
    }
  )
);

import { useInventoryStore } from "./inventoryStore";

// Data Selectors
export const useInventoryList = () => useInventoryStore((s) => s.inventories);
export const useSelectedInventory = () => useInventoryStore((s) => s.selectedInventory);

// Action Selectors
export const useInventoryActions = () => useInventoryStore((s) => ({
  setInventories: s.setInventories,
  addInventory: s.addInventory,
  updateInventory: s.updateInventory,
  removeInventory: s.removeInventory,
  selectInventory: s.selectInventory,
  updateInventoryCurrencies: s.updateInventoryCurrencies,
  claimCurrencies: s.claimCurrencies,
  addItem: s.addItem,
  updateItem: s.updateItem,
  removeItem: s.removeItem,
  incrementItemQuantity: s.incrementItemQuantity,
  decrementItemQuantity: s.decrementItemQuantity,
  clearInventories: s.clearInventories,
}));

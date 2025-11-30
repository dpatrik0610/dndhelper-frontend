import { create } from "zustand";
import type { Inventory } from "../../types/Inventory/Inventory";
import type { InventoryItem } from "../../types/Inventory/InventoryItem";
import {
  getInventoriesByCharacter,
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  addNewItem,
  deleteItem as deleteItemService,
  updateItem as updateItemService,
  moveItem as moveItemService,
  addOrIncrementExisting,
  type MoveItemRequest,
  type ModifyEquipmentAmount,
} from "../../services/inventoryService";
import { useAuthStore } from "../../store/useAuthStore";
import { showNotification } from "../../components/Notification/Notification";
import { SectionColor } from "../../types/SectionColor";
import type { Equipment } from "../../types/Equipment/Equipment";
import { updateEquipmentById } from "../../services/equipmentService";

interface AdminInventoryStore {
  inventories: Inventory[];
  selected: Inventory | null;
  loading: boolean;

  // 🔹 SignalR / local helpers
  setInventories: (inventories: Inventory[]) => void;
  setSelected: (inventory: Inventory | null) => void;
  applyInventoryUpdate: (inventory: Inventory) => void;
  applyInventoryDelete: (id: string) => void;

  loadByCharacter: (characterId: string) => Promise<void>;
  refreshInventories: (characterId?: string) => Promise<void>;
  refreshSelected: () => Promise<void>;
  select: (id: string | null) => void;

  create: (characterIds: string[] | null, name: string) => Promise<void>;
  rename: (id: string, name: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  addItem: (equipment: Equipment) => Promise<void>;
  addExisting: (equipmentId: string, amount: number) => Promise<void>;
  updateItem: (item: InventoryItem) => Promise<void>;
  deleteItem: (item: InventoryItem) => Promise<void>;
  moveItem: (equipmentId: string, targetInventoryId: string, amount: number) => Promise<void>;
  incrementItemQuantity: (equipmentId: string) => Promise<void>;
  decrementItemQuantity: (equipmentId: string) => Promise<void>;

  updateEquipment: (equipment: Equipment) => Promise<Equipment>;
  clearStorage: () => void;
}

export const useAdminInventoryStore = create<AdminInventoryStore>((set, get) => {
  const getToken = () => useAuthStore.getState().token!;

  return {
    inventories: [],
    selected: null,
    loading: false,

    // --- SignalR / local helpers ---
    setInventories: (inventories) => set({ inventories }),
    setSelected: (inventory) => set({ selected: inventory }),

    applyInventoryUpdate: (inventory) =>
      set((state) => {
        const exists = state.inventories.some((i) => i.id === inventory.id);
        const inventories = exists
          ? state.inventories.map((i) => (i.id === inventory.id ? inventory : i))
          : [...state.inventories, inventory];

        const selected =
          state.selected && state.selected.id === inventory.id
            ? inventory
            : state.selected;

        return { inventories, selected };
      }),

    applyInventoryDelete: (id) =>
      set((state) => {
        const inventories = state.inventories.filter((i) => i.id !== id);
        const selected =
          state.selected && state.selected.id === id
            ? inventories[0] ?? null
            : state.selected;

        return { inventories, selected };
      }),

    // === LOAD ALL INVENTORIES FOR ONE CHARACTER ===
    loadByCharacter: async (characterId) => {
      if (!characterId) return;
      set({ loading: true });
      try {
        const data = await getInventoriesByCharacter(characterId, getToken());
        const owned = data.filter((i) => i.characterIds?.includes(characterId));
        set({ inventories: owned, selected: owned[0] ?? null });
      } catch (err) {
        showNotification({
          title: "Error loading inventories",
          message: String(err),
          color: SectionColor.Red,
        });
      } finally {
        set({ loading: false });
      }
    },

    // === MANUALLY SELECT AN INVENTORY ===
    select: (id) => {
      const { inventories } = get();
      set({ selected: inventories.find((i) => i.id === id) ?? null });
    },

    // === REFRESH INVENTORY LIST ===
    refreshInventories: async (characterId?: string) => {
      const charId =
        characterId ||
        get().selected?.characterIds?.[0] ||
        get().inventories[0]?.characterIds?.[0];

      if (!charId) return;
      try {
        const refreshed = await getInventoriesByCharacter(charId, getToken());
        const owned = refreshed.filter((i) => i.characterIds?.includes(charId));
        const sel = get().selected;
        set({
          inventories: owned,
          selected: sel ? owned.find((i) => i.id === sel.id) ?? sel : null,
        });
      } catch (err) {
        showNotification({
          title: "Error refreshing inventories",
          message: String(err),
          color: SectionColor.Red,
        });
      }
    },

    // === REFRESH THE CURRENTLY SELECTED INVENTORY ===
    refreshSelected: async () => {
      const sel = get().selected;
      if (!sel?.id) return;
      try {
        const updated = await getInventory(sel.id, getToken());
        set({ selected: updated });
      } catch (err) {
        showNotification({
          title: "Error refreshing inventory",
          message: String(err),
          color: SectionColor.Red,
        });
      }
    },

    // === CREATE NEW INVENTORY ===
    create: async (characterIds, name) => {
      characterIds = characterIds ?? [];
      if (characterIds.length === 0) return;

      await createInventory(
        { name, characterIds, ownerIds: [], currencies: [] },
        getToken()
      );

      await get().refreshInventories(characterIds[0]);
      showNotification({
        title: "Inventory created",
        message: `${name} added successfully.`,
        color: SectionColor.Green,
      });
    },

    rename: async (id, name) => {
      const { inventories } = get();
      const current = inventories.find((i) => i.id === id);
      if (!current) return;

      await updateInventory(id, { ...current, name }, getToken());
      await get().refreshInventories();

      showNotification({
        title: "Renamed",
        message: `Inventory renamed to ${name}.`,
        color: SectionColor.Green,
      });
    },

    remove: async (id) => {
      await deleteInventory(id, getToken());
      await get().refreshInventories();
      showNotification({
        title: "Inventory deleted",
        message: "Inventory removed successfully.",
        color: SectionColor.Red,
      });
    },

    // === ITEM OPERATIONS ===
    addItem: async (equipment) => {
      const sel = get().selected;
      if (!sel?.id) return;
      await addNewItem(sel.id, equipment, getToken());
      await get().refreshInventories();
      showNotification({
        title: "Item added",
        message: `${equipment.name} added to ${sel.name}.`,
        color: SectionColor.Green,
      });
    },

    addExisting: async (equipmentId, amount) => {
      const sel = get().selected;
      if (!sel?.id) return;
      const token = getToken();
      const request: ModifyEquipmentAmount = { equipmentId, amount };

      try {
        await addOrIncrementExisting(sel.id, request, token);
        await get().refreshInventories();
        showNotification({
          title: "Item added",
          message: `Added ${amount}× item to ${sel.name}.`,
          color: SectionColor.Green,
        });
      } catch (err) {
        showNotification({
          title: "Error adding item",
          message: String(err),
          color: SectionColor.Red,
        });
      }
    },

    updateItem: async (item) => {
      const sel = get().selected;
      if (!sel?.id || !item.equipmentId) return;
      await updateItemService(sel.id, item.equipmentId, item, getToken());
      await get().refreshInventories();
      showNotification({
        title: "Item updated",
        message: `${item.equipmentName} updated successfully.`,
        color: SectionColor.Green,
      });
    },

    deleteItem: async (item) => {
      const sel = get().selected;
      if (!sel?.id || !item.equipmentId) return;
      await deleteItemService(sel.id, item.equipmentId, getToken());
      await get().refreshInventories();
      showNotification({
        title: "Item removed",
        message: `${item.equipmentName} deleted.`,
        color: SectionColor.Red,
      });
    },

    moveItem: async (equipmentId, targetInventoryId, amount) => {
      const sel = get().selected;
      if (!sel?.id) return;
      const token = getToken();
      const request: MoveItemRequest = { targetInventoryId, amount };
      await moveItemService(sel.id, equipmentId, request, token);
      await get().refreshInventories();
      showNotification({
        title: "Item moved",
        message: `Moved ${amount}× item from ${sel.name} to target inventory.`,
        color: SectionColor.Blue,
      });
    },

    updateEquipment: async (equipment) => {
      const updated = await updateEquipmentById(equipment.id!, equipment, getToken());
      await get().refreshInventories();
      return updated;
    },

    incrementItemQuantity: async (equipmentId) => {
      const sel = get().selected;
      if (!sel?.id) return;
      const item = sel.items?.find((i) => i.equipmentId === equipmentId);
      if (!item) return;
      const updated = { ...item, quantity: (item.quantity ?? 0) + 1 };
      await updateItemService(sel.id, equipmentId, updated, getToken());
      await get().refreshInventories();
    },

    decrementItemQuantity: async (equipmentId) => {
      const sel = get().selected;
      if (!sel?.id) return;
      const item = sel.items?.find((i) => i.equipmentId === equipmentId);
      if (!item || item.quantity! <= 1) return;
      const updated = { ...item, quantity: item.quantity! - 1 };
      await updateItemService(sel.id, equipmentId, updated, getToken());
      await get().refreshInventories();
    },

    clearStorage: () => set({ inventories: [], selected: null, loading: false }),
  };
});

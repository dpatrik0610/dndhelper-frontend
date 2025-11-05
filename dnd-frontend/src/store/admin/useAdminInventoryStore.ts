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
  deleteItem,
  updateItem,
} from "../../services/inventoryService";
import { useAuthStore } from "../../store/useAuthStore";
import { showNotification } from "../../components/Notification/Notification";
import { SectionColor } from "../../types/SectionColor";
import type { Equipment } from "../../types/Equipment/Equipment";

interface AdminInventoryStore {
  inventories: Inventory[];
  selected: Inventory | null;
  loading: boolean;
  loadByCharacter: (characterId: string) => Promise<void>;
  select: (id: string | null) => void;
  refreshSelected: () => Promise<void>;
  create: (characterId: string, name: string) => Promise<void>;
  rename: (id: string, name: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  addItem: (equipment: Equipment) => Promise<void>;
  updateItem: (item: InventoryItem) => Promise<void>;
  deleteItem: (item: InventoryItem) => Promise<void>;
  clearStorage: () => void;
}

export const useAdminInventoryStore = create<AdminInventoryStore>((set, get) => ({
  inventories: [],
  selected: null,
  loading: false,

  loadByCharacter: async (characterId) => {
    const token = useAuthStore.getState().token!;
    set({ loading: true });
    try {
      const data = await getInventoriesByCharacter(characterId, token);
      set({
        inventories: data.map((i) => ({
          id: i.id,
          name: i.name,
          characterId: i.characterId,
          currencies: i.currencies,
          ownerIds: i.ownerIds,
        })),
        selected: data[0] ?? null,
      });
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

  select: (id) => {
    const { inventories } = get();
    set({ selected: inventories.find((i) => i.id === id) ?? null });
  },

  refreshSelected: async () => {
    const token = useAuthStore.getState().token!;
    const sel = get().selected;
    if (!sel?.id) return;
    try {
      const updated = await getInventory(sel.id, token);
      set({ selected: updated });
    } catch (err) {
      showNotification({
        title: "Error refreshing inventory",
        message: String(err),
        color: SectionColor.Red,
      });
    }
  },

  create: async (characterId, name) => {
    const token = useAuthStore.getState().token!;
    const inv = await createInventory({ name, characterId, ownerIds: [], currencies: [] }, token);
    set((s) => ({ inventories: [...s.inventories, inv], selected: inv }));
    showNotification({
      title: "Inventory created",
      message: `${name} added successfully.`,
      color: SectionColor.Green,
    });
  },

  rename: async (id, name) => {
    const token = useAuthStore.getState().token!;
    const { selected } = get();
    const updated = await updateInventory(id, { ...selected, name } as Inventory, token);
    set((s) => ({
      inventories: s.inventories.map((i) => (i.id === id ? updated : i)),
      selected: updated,
    }));
    showNotification({
      title: "Renamed",
      message: `Inventory renamed to ${name}.`,
      color: SectionColor.Green,
    });
  },

  remove: async (id) => {
    const token = useAuthStore.getState().token!;
    await deleteInventory(id, token);
    set((s) => ({
      inventories: s.inventories.filter((i) => i.id !== id),
      selected: s.inventories.find((i) => i.id !== id) ?? null,
    }));
    showNotification({
      title: "Inventory deleted",
      message: "Inventory removed successfully.",
      color: SectionColor.Red,
    });
  },

  addItem: async (equipment) => {
    const token = useAuthStore.getState().token!;
    const sel = get().selected;
    if (!sel?.id) return;
    await addNewItem(sel.id, equipment, token);
    await get().refreshSelected();
    showNotification({
      title: "Item added",
      message: `${equipment.name} added to ${sel.name}.`,
      color: SectionColor.Green,
    });
  },

  updateItem: async (item) => {
    const token = useAuthStore.getState().token!;
    const sel = get().selected;
    if (!sel?.id || !item.equipmentId) return;
    await updateItem(sel.id, item.equipmentId, item, token);
    await get().refreshSelected();
    showNotification({
      title: "Item updated",
      message: `${item.equipmentName} updated successfully.`,
      color: SectionColor.Green,
    });
  },

  deleteItem: async (item) => {
    const token = useAuthStore.getState().token!;
    const sel = get().selected;
    if (!sel?.id || !item.equipmentId) return;
    await deleteItem(sel.id, item.equipmentId, token);
    await get().refreshSelected();
    showNotification({
      title: "Item removed",
      message: `${item.equipmentName} deleted.`,
      color: SectionColor.Red,
    });
  },

  clearStorage: () => set({ inventories: [], selected: null, loading: false }),
}));

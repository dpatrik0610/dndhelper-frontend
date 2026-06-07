import { showNotification } from "@components/Notification/Notification";
import { useAdminCharacterStore } from "@store/admin/adminCharacterStore";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { useInventoryStore } from "@store/inventory/inventoryStore";
import { useAdminCurrencyStore } from "@store/admin/adminCurrencyStore";
import type { Inventory } from "@appTypes/Inventory/Inventory";
import type { EntityChangeEvent } from "./entitySyncTypes";

export function handleInventoryChange(event: EntityChangeEvent) {
  const inventoryStore = useInventoryStore.getState();
  const currentSelected = inventoryStore.selectedInventory;

  const adminStore = useAdminInventoryStore.getState();
  const adminSelectedCharId = useAdminCharacterStore.getState().selectedId;

  const adminCurrencyStore = useAdminCurrencyStore.getState();

  switch (event.action) {
    case "created": {
      const newInventory = event.data as Inventory;

      // --- Player store ---
      const playerExists = inventoryStore.inventories.some((i) => i.id === newInventory.id);
      inventoryStore.setInventories(
        playerExists
          ? inventoryStore.inventories.map((i) => (i.id === newInventory.id ? newInventory : i))
          : [...inventoryStore.inventories, newInventory]
      );
      if (!currentSelected) {
        inventoryStore.selectInventory(newInventory);
      }

      // --- Admin inventory store ---
      const isNewUnowned = !newInventory.characterIds || newInventory.characterIds.length === 0;
      const touchesNewSelectedAdminChar =
        adminSelectedCharId &&
        newInventory.characterIds?.includes(adminSelectedCharId);

      if (touchesNewSelectedAdminChar || isNewUnowned || !adminSelectedCharId) {
        adminStore.applyInventoryUpdate(newInventory);
      }

      // --- Admin currency store (if this inventory is currently open there) ---
      if (adminCurrencyStore.selectedInventory?.id === newInventory.id) {
        adminCurrencyStore.applyInventoryUpdate(newInventory);
      }

      showNotification({
        title: "Inventory Created",
        message: `${newInventory.name} was created by ${event.changedBy}`,
        color: "green",
        autoClose: 3000,
      });
      break;
    }

    case "updated": {
      const updatedInventory = event.data as Inventory;
      if (!updatedInventory.id) {
        console.warn("Inventory updated event without id", event);
        return;
      }

      // --- Player store ---
      inventoryStore.updateInventory({
        ...updatedInventory,
        id: updatedInventory.id!,
      });
      if (currentSelected?.id === updatedInventory.id) {
        inventoryStore.selectInventory(updatedInventory);
      }

      // --- Admin inventory list (tiles/items) ---
      const existsInAdmin = adminStore.inventories.some((i) => i.id === updatedInventory.id);
      const isUpdatedUnowned = !updatedInventory.characterIds || updatedInventory.characterIds.length === 0;
      const touchesSelectedAdminChar =
        adminSelectedCharId &&
        updatedInventory.characterIds?.includes(adminSelectedCharId);

      if (existsInAdmin || touchesSelectedAdminChar || isUpdatedUnowned || !adminSelectedCharId) {
        adminStore.applyInventoryUpdate(updatedInventory);
      }

      // --- Admin currency panel (the one you mentioned) ---
      if (adminCurrencyStore.selectedInventory?.id === updatedInventory.id) {
        adminCurrencyStore.applyInventoryUpdate(updatedInventory);
      }

      showNotification({
        title: "Inventory Updated",
        message: `${updatedInventory.name} was updated by ${event.changedBy}`,
        color: "blue",
        autoClose: 3000,
      });
      break;
    }

    case "deleted": {
      const id = event.entityId;
      if (!id) {
        console.warn("Inventory deleted event without entityId", event);
        return;
      }

      // --- Player store ---
      inventoryStore.removeInventory(id);
      if (currentSelected?.id === id) {
        inventoryStore.selectInventory(null);
        showNotification({
          title: "Inventory Deleted",
          message: `Your inventory was deleted by ${event.changedBy}`,
          color: "red",
          autoClose: 5000,
        });
      } else {
        showNotification({
          title: "Inventory Deleted",
          message: `Inventory was deleted by ${event.changedBy}`,
          color: "red",
          autoClose: 3000,
        });
      }

      // --- Admin inventory store ---
      const existsInAdmin = adminStore.inventories.some((i) => i.id === id);
      if (existsInAdmin) {
        adminStore.applyInventoryDelete(id);
      }

      // --- Admin currency store: clear if it was looking at this inventory ---
      if (adminCurrencyStore.selectedInventory?.id === id) {
        adminCurrencyStore.setSelectedInventory(null);
      }

      break;
    }
  }
}

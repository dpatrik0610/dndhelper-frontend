import { showNotification } from "@components/Notification/Notification";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { useInventoryStore } from "@store/inventory/inventoryStore";
import { useAdminCurrencyStore } from "@store/admin/adminCurrencyStore";
import { useAuthStore } from "@store/auth/authStore";
import type { Inventory } from "@appTypes/Inventory/Inventory";
import type { EntityChangeEvent } from "./entitySyncTypes";

export function handleInventoryChange(event: EntityChangeEvent) {
  const inventoryStore = useInventoryStore.getState();
  const currentSelected = inventoryStore.selectedInventory;

  const adminStore = useAdminInventoryStore.getState();

  const adminCurrencyStore = useAdminCurrencyStore.getState();

  const currentUser = useAuthStore.getState();
  const isCurrentUser =
    event.changedBy &&
    (event.changedBy === currentUser.username || event.changedBy === currentUser.id);

  switch (event.action) {
    case "created": {
      const newInventory = event.data as Inventory;

      const playerExists = inventoryStore.inventories.some((i) => i.id === newInventory.id);
      inventoryStore.setInventories(
        playerExists
          ? inventoryStore.inventories.map((i) => (i.id === newInventory.id ? newInventory : i))
          : [...inventoryStore.inventories, newInventory]
      );
      if (!currentSelected) {
        inventoryStore.selectInventory(newInventory);
      }

      adminStore.applyInventoryUpdate(newInventory);

      if (adminCurrencyStore.selectedInventory?.id === newInventory.id) {
        adminCurrencyStore.applyInventoryUpdate(newInventory);
      }

      if (!isCurrentUser) {
        showNotification({
          title: "Inventory Created",
          message: `${newInventory.name} was created by ${event.changedBy}`,
          color: "green",
          autoClose: 3000,
        });
      }
      break;
    }

    case "updated": {
      const updatedInventory = event.data as Inventory;
      if (!updatedInventory.id) {
        console.warn("Inventory updated event without id", event);
        return;
      }

      inventoryStore.updateInventory({
        ...updatedInventory,
        id: updatedInventory.id!,
      });
      if (currentSelected?.id === updatedInventory.id) {
        inventoryStore.selectInventory(updatedInventory);
      }

      adminStore.applyInventoryUpdate(updatedInventory);

      if (adminCurrencyStore.selectedInventory?.id === updatedInventory.id) {
        adminCurrencyStore.applyInventoryUpdate(updatedInventory);
      }

      if (!isCurrentUser) {
        showNotification({
          title: "Inventory Updated",
          message: `${updatedInventory.name} was updated by ${event.changedBy}`,
          color: "blue",
          autoClose: 3000,
        });
      }
      break;
    }

    case "deleted": {
      const id = event.entityId;
      if (!id) {
        console.warn("Inventory deleted event without entityId", event);
        return;
      }

      inventoryStore.removeInventory(id);
      if (currentSelected?.id === id) {
        inventoryStore.selectInventory(null);
        if (!isCurrentUser) {
          showNotification({
            title: "Inventory Deleted",
            message: `Your inventory was deleted by ${event.changedBy}`,
            color: "red",
            autoClose: 5000,
          });
        }
      } else {
        if (!isCurrentUser) {
          showNotification({
            title: "Inventory Deleted",
            message: `Inventory was deleted by ${event.changedBy}`,
            color: "red",
            autoClose: 3000,
          });
        }
      }

      const existsInAdmin = adminStore.inventories.some((i) => i.id === id);
      if (existsInAdmin) {
        adminStore.applyInventoryDelete(id);
      }

      if (adminCurrencyStore.selectedInventory?.id === id) {
        adminCurrencyStore.setSelectedInventory(null);
      }

      break;
    }
  }
}

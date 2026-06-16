import { showNotification } from "@components/Notification/Notification";
import { useShopStore } from "@store/shop/shopStore";
import { useAdminShopStore } from "@store/admin/adminShopStore";
import type { Shop } from "@appTypes/Shop/Shop";
import type { EntityChangeEvent } from "./entitySyncTypes";

export function handleShopChange(event: EntityChangeEvent) {
  console.log("Shop change event received:", event);

  const shopStore = useShopStore.getState();
  const adminShopStore = useAdminShopStore.getState();

  // If action is deleted, or action is updated but data is null/undefined, treat as a deletion
  const isDeletion = event.action === "deleted" || (event.action === "updated" && !event.data);

  if (isDeletion) {
    const id = event.entityId;
    if (!id) return;

    // Update player shop store (removes shop)
    shopStore.syncShopDeleted(id);

    // Update admin shop store
    adminShopStore.syncShopDeleted(id);

    showNotification({
      title: "Shop Deleted",
      message: `A shop was deleted by ${event.changedBy}`,
      color: "red",
      autoClose: 3000,
    });
    return;
  }

  switch (event.action) {
    case "created":
    case "updated": {
      const updatedShop = event.data as Shop;
      if (!updatedShop || !updatedShop.id) return;

      // Update player shop store
      shopStore.syncShopUpdated(updatedShop);

      // Update admin shop store
      adminShopStore.syncShopUpdated(updatedShop);

      showNotification({
        title: event.action === "created" ? "Shop Created" : "Shop Updated",
        message: `${updatedShop.name} was ${event.action} by ${event.changedBy}`,
        color: "blue",
        autoClose: 3000,
      });
      break;
    }
  }
}

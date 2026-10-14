import { showNotification } from "@components/Notification/Notification";
import { useShopStore } from "@store/shop/shopStore";
import { useAdminShopStore } from "@store/admin/adminShopStore";
import { useAuthStore } from "@store/auth/authStore";
import type { Shop } from "@appTypes/Shop/Shop";
import type { EntityChangeEvent } from "./entitySyncTypes";

export function handleShopChange(event: EntityChangeEvent) {
  const shopStore = useShopStore.getState();
  const adminShopStore = useAdminShopStore.getState();

  const currentUser = useAuthStore.getState();
  const isCurrentUser =
    event.changedBy &&
    (event.changedBy === currentUser.username || event.changedBy === currentUser.id);

  const isDeletion = event.action === "deleted" || (event.action === "updated" && !event.data);

  if (isDeletion) {
    const id = event.entityId;
    if (!id) return;

    shopStore.syncShopDeleted(id);

    adminShopStore.syncShopDeleted(id);

    if (!isCurrentUser) {
      showNotification({
        title: "Shop Deleted",
        message: `A shop was deleted by ${event.changedBy}`,
        color: "red",
        autoClose: 3000,
      });
    }
    return;
  }

  switch (event.action) {
    case "created":
    case "updated": {
      const updatedShop = event.data as Shop;
      if (!updatedShop || !updatedShop.id) return;

      shopStore.syncShopUpdated(updatedShop);

      adminShopStore.syncShopUpdated(updatedShop);

      if (!isCurrentUser) {
        showNotification({
          title: event.action === "created" ? "Shop Created" : "Shop Updated",
          message: `${updatedShop.name} was ${event.action} by ${event.changedBy}`,
          color: "blue",
          autoClose: 3000,
        });
      }
      break;
    }
  }
}

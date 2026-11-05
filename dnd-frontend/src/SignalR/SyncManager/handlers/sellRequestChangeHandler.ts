import { showNotification } from "@components/Notification/Notification";
import { useAdminShopStore } from "@store/admin/adminShopStore";
import { useAuthStore } from "@store/auth/authStore";
import { useShopStore } from "@store/shop/shopStore";
import { useCharacterStore } from "@store/character/characterStore";
import type { SellRequest } from "@appTypes/Shop/Shop";
import type { EntityChangeEvent } from "./entitySyncTypes";

export function handleSellRequestChange(event: EntityChangeEvent) {
  const adminShopStore = useAdminShopStore.getState();

  const currentUser = useAuthStore.getState();
  const isCurrentUser =
    event.changedBy &&
    (event.changedBy === currentUser.username || event.changedBy === currentUser.id);

  switch (event.action) {
    case "created":
    case "updated": {
      const updatedRequest = event.data as SellRequest;
      if (!updatedRequest.id) return;

      adminShopStore.syncSellRequestUpdated(updatedRequest);
      if (updatedRequest.characterId === useCharacterStore.getState().character?.id) {
        useShopStore.getState().syncMyRequest(updatedRequest);
      }

      const kind = updatedRequest.isHaggle ? "Haggle Offer" : updatedRequest.isSteal ? "Steal Attempt" : "Sell Request";
      let notificationTitle = `${kind} Updated`;
      let notificationColor = "blue";

      if (event.action === "created") {
        notificationTitle = `New ${kind}`;
        notificationColor = "green";
      } else if (updatedRequest.status === "Approved" || updatedRequest.status === 1) {
        notificationTitle = `${kind} Approved`;
        notificationColor = "green";
      } else if (updatedRequest.status === "Rejected" || updatedRequest.status === 2) {
        notificationTitle = `${kind} Rejected`;
        notificationColor = "red";
      } else if (updatedRequest.status === "Countered" || updatedRequest.status === 3) {
        notificationTitle = `${kind} Countered`;
        notificationColor = "orange";
      }

      if (!isCurrentUser) {
        showNotification({
          title: notificationTitle,
          message: `${kind} was updated by ${event.changedBy}`,
          color: notificationColor,
          autoClose: 3000,
        });
      }
      break;
    }
  }
}

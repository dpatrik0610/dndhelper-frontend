import { showNotification } from "@components/Notification/Notification";
import { useAdminShopStore } from "@store/admin/adminShopStore";
import type { SellRequest } from "@appTypes/Shop/Shop";
import type { EntityChangeEvent } from "./entitySyncTypes";

export function handleSellRequestChange(event: EntityChangeEvent) {
  console.log("SellRequest change event received:", event);

  const adminShopStore = useAdminShopStore.getState();

  switch (event.action) {
    case "created":
    case "updated": {
      const updatedRequest = event.data as SellRequest;
      if (!updatedRequest.id) return;

      // Update admin shop store
      adminShopStore.syncSellRequestUpdated(updatedRequest);

      // Show a descriptive notification based on status
      let notificationTitle = "Sell Request Updated";
      let notificationColor = "blue";
      
      if (event.action === "created") {
        notificationTitle = "New Sell Request";
        notificationColor = "green";
      } else if (updatedRequest.status === "Approved" || updatedRequest.status === 1) {
        notificationTitle = "Sell Request Approved";
        notificationColor = "green";
      } else if (updatedRequest.status === "Rejected" || updatedRequest.status === 2) {
        notificationTitle = "Sell Request Rejected";
        notificationColor = "red";
      }

      showNotification({
        title: notificationTitle,
        message: `Sell request was updated by ${event.changedBy}`,
        color: notificationColor,
        autoClose: 3000,
      });
      break;
    }
  }
}

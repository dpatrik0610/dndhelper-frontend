import { showNotification } from "../../../components/Notification/Notification";
import type { EntityChangeEvent } from "./EntitySyncTypes";

export function handleCampaignChange(event: EntityChangeEvent) {
  console.log("🗺️ Campaign change:", event);

  showNotification({
    title: "Campaign Updated",
    message: `Campaign ${event.action} by ${event.changedBy}`,
    color: "blue",
    autoClose: 3000,
  });
}

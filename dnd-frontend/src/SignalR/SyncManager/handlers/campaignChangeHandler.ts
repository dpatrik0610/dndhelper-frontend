import { showNotification } from "@components/Notification/Notification";
import { useEncounterStore } from "@store/encounter/encounterStore";
import { useAuthStore } from "@store/auth/authStore";
import type { EntityChangeEvent } from "./entitySyncTypes";

export function handleCampaignChange(event: EntityChangeEvent) {
  // console.log("Campaign change:", event);

  if (event.action === "activeEncounterChanged") {
    const payload = event.data as { campaignId?: string; activeEncounterId?: string | null };

    if (payload.campaignId) {
      useEncounterStore
        .getState()
        .applyCampaignActiveEncounterChange(payload.campaignId, payload.activeEncounterId ?? null);
    }
  }

  const currentUser = useAuthStore.getState();
  const isCurrentUser =
    event.changedBy &&
    (event.changedBy === currentUser.username || event.changedBy === currentUser.id);

  if (!isCurrentUser) {
    showNotification({
      title: "Campaign Updated",
      message: `Campaign ${event.action} by ${event.changedBy}`,
      color: "blue",
      autoClose: 3000,
    });
  }
}

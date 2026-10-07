import { showNotification } from "@components/Notification/Notification";
import { useAuthStore } from "@store/auth/authStore";
import { useCampaignStore } from "@store/campaign/campaignStore";
import { usePollStore } from "@store/poll/pollStore";
import { getPoll } from "@services/pollService";
import type { EntityChangeEvent } from "./entitySyncTypes";

/** Poll events carry ids only: each member's view differs (hidden results, anonymity), so we refetch ours. */
export function handlePollChange(event: EntityChangeEvent) {
  const id = event.entityId ?? event.data?.id;
  if (!id) return;

  const campaignId: string | undefined = event.data?.campaignId;
  const isCurrentCampaign = !campaignId || campaignId === useCampaignStore.getState().selectedId;
  const isCurrentUser = event.changedBy === useAuthStore.getState().username;
  const store = usePollStore.getState();

  switch (event.action) {
    case "created":
      if (!isCurrentCampaign) return;
      void getPoll(id)
        .then((poll) => {
          store.upsert(poll);
          if (!isCurrentUser)
            showNotification({
              title: "New poll",
              message: `${event.changedBy} asks: ${poll.title}`,
              color: "violet",
              autoClose: 6000,
            });
        })
        .catch(() => {});
      break;

    case "updated":
      if (isCurrentCampaign && store.polls.some((p) => p.id === id)) void store.refresh(id);
      break;

    case "deleted":
      store.removeLocal(id);
      break;

    // Results are for every member, whichever campaign they are looking at right now.
    case "announced":
      showNotification({
        title: `Poll result · ${event.data?.title ?? "Poll"}`,
        message: event.data?.summary ?? "The poll has closed.",
        color: "violet",
        autoClose: 12000,
      });
      break;
  }
}

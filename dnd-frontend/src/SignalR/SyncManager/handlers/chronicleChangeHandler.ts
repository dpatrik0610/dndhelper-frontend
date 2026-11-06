import { showNotification } from "@components/Notification/Notification";
import { useAuthStore } from "@store/auth/authStore";
import { useCampaignStore } from "@store/campaign/campaignStore";
import { useChronicleStore } from "@store/chronicle/chronicleStore";
import { getCampaignFolders, getEntry } from "@services/chronicleService";
import type { EntityChangeEvent } from "./entitySyncTypes";

const notify = (title: string, message: string) =>
  showNotification({ title, message, color: "violet", autoClose: 6000 });

/**
 * Chronicle events carry ids only: a player's copy is stripped server-side, so every client refetches its own.
 * "shared" goes only to players who just gained access, so they are told even when the Chronicle isn't open.
 */
export function handleChronicleChange(event: EntityChangeEvent) {
  const data = event.data ?? {};
  const id: string | undefined = data.id ?? event.entityId;
  const campaignId: string | undefined = data.campaignId;
  if (
    !id ||
    !campaignId ||
    campaignId !== useCampaignStore.getState().selectedId
  )
    return;

  const store = useChronicleStore.getState();
  const loaded = store.campaignId === campaignId;
  const byMe = event.changedBy === useAuthStore.getState().username;

  switch (data.kind) {
    case "entry":
      if (event.action === "deleted") store.removeLocal(id);
      else if (event.action === "shared")
        void (loaded ? store.refresh(id) : getEntry(id).catch(() => null)).then(
          (entry) => {
            if (entry)
              notify(
                `${event.changedBy} shared a Chronicle entry`,
                entry.title,
              );
          },
        );
      else if (loaded) void store.refresh(id);
      return;

    case "folder":
      if (event.action === "shared")
        void (
          loaded
            ? store
                .load(campaignId)
                .then(() => useChronicleStore.getState().folders)
            : getCampaignFolders(campaignId)
        )
          .then((folders) => folders.find((f) => f.id === id))
          .catch(() => undefined)
          .then((folder) =>
            notify(
              `${event.changedBy} shared a Chronicle folder`,
              folder?.name ?? "Open the Chronicle to read it.",
            ),
          );
      else if (loaded) void store.load(campaignId);
      return;

    case "comment": {
      const entryId: string | undefined = data.entryId;
      if (!entryId) return;
      store.bumpComments(entryId);
      if (event.action !== "commented" || byMe) return;
      const known = store.entries.find((e) => e.id === entryId);
      void (
        known ? Promise.resolve(known) : getEntry(entryId).catch(() => null)
      ).then((entry) => {
        if (entry) notify(`${event.changedBy} commented`, entry.title);
      });
      return;
    }
  }
}

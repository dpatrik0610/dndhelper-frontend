import { showNotification } from "@components/Notification/Notification";
import { useAuthStore } from "@store/auth/authStore";
import { useQuestStore } from "@store/quest/questStore";
import type { Quest } from "@appTypes/Quest";
import type { EntityChangeEvent } from "./entitySyncTypes";

export function handleQuestChange(event: EntityChangeEvent) {
  const questStore = useQuestStore.getState();
  const currentUser = useAuthStore.getState();
  const isCurrentUser =
    event.changedBy &&
    (event.changedBy === currentUser.username || event.changedBy === currentUser.id);

  switch (event.action) {
    case "created": {
      const newQuest = event.data as Quest;
      questStore.applyQuestCreated(newQuest);

      if (!isCurrentUser) {
        showNotification({
          title: "Quest Created",
          message: `Quest "${newQuest.title}" was created by ${event.changedBy}`,
          color: "green",
          autoClose: 3000,
        });
      }
      break;
    }

    case "updated": {
      const updatedQuest = event.data as Quest;
      questStore.applyQuestUpdated(updatedQuest);

      if (!isCurrentUser) {
        showNotification({
          title: "Quest Updated",
          message: `Quest "${updatedQuest.title}" was updated by ${event.changedBy}`,
          color: "blue",
          autoClose: 3000,
        });
      }
      break;
    }

    case "deleted": {
      const id = event.entityId;
      if (!id) {
        console.warn("Quest deleted event without entityId", event);
        return;
      }

      const questToDelete = questStore.quests.find((q) => q.id === id);
      const title = questToDelete?.title || "A quest";

      questStore.applyQuestDeleted(id);

      if (!isCurrentUser) {
        showNotification({
          title: "Quest Deleted",
          message: `Quest "${title}" was deleted by ${event.changedBy}`,
          color: "red",
          autoClose: 3000,
        });
      }
      break;
    }

    default:
      console.warn(`Unknown quest action: ${event.action}`, event);
  }
}

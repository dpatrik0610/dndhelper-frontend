import { useQuestStore } from "./questStore";
import { useShallow } from "zustand/react/shallow";

export const useQuestList = () => useQuestStore((s) => s.quests);
export const useQuestLoading = () => useQuestStore((s) => s.loading);

export const useQuestActions = () =>
  useQuestStore(
    useShallow((s) => ({
      loadCampaignQuests: s.loadCampaignQuests,
      create: s.create,
      update: s.update,
      remove: s.remove,
      addObjective: s.addObjective,
      updateObjective: s.updateObjective,
      deleteObjective: s.deleteObjective,
      applyQuestCreated: s.applyQuestCreated,
      applyQuestUpdated: s.applyQuestUpdated,
      applyQuestDeleted: s.applyQuestDeleted,
      clearStore: s.clearStore,
    }))
  );

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Quest, QuestObjective } from "@appTypes/Quest";
import {
  getCampaignQuests,
  createQuest,
  updateQuest,
  deleteQuest,
  addObjective,
  updateObjective,
  deleteObjective,
} from "@services/questService";

export interface QuestState {
  quests: Quest[];
  loading: boolean;
}

export interface QuestActions {
  loadCampaignQuests: (campaignId: string) => Promise<Quest[]>;
  create: (quest: Partial<Quest>) => Promise<Quest>;
  update: (id: string, quest: Partial<Quest>) => Promise<Quest>;
  remove: (id: string) => Promise<void>;

  addObjective: (
    questId: string,
    objective: { description?: string; currentProgress: number; completionThreshold: number }
  ) => Promise<Quest>;
  updateObjective: (questId: string, objective: QuestObjective) => Promise<Quest>;
  deleteObjective: (questId: string, objectiveId: string) => Promise<Quest>;

  applyQuestCreated: (quest: Quest) => void;
  applyQuestUpdated: (quest: Quest) => void;
  applyQuestDeleted: (questId: string) => void;

  clearStore: () => void;
}

export const useQuestStore = create<QuestState & QuestActions>()(
  persist(
    (set, get) => ({
      quests: [],
      loading: false,

      loadCampaignQuests: async (campaignId: string) => {
        set({ loading: true });
        try {
          const fetched = await getCampaignQuests(campaignId);
          set({ quests: fetched });
          return fetched;
        } finally {
          set({ loading: false });
        }
      },

      // Client relies solely on SignalR synchronization events to mutate state.
      // REST actions just send requests to the database source of truth.
      create: async (quest: Partial<Quest>) => {
        set({ loading: true });
        try {
          return await createQuest(quest);
        } finally {
          set({ loading: false });
        }
      },

      update: async (id: string, patch: Partial<Quest>) => {
        set({ loading: true });
        try {
          const current = get().quests.find((q) => q.id === id);
          if (!current) {
            throw new Error(`Quest with id ${id} not found in store`);
          }
          const toSend: Quest = {
            ...current,
            ...patch,
          } as Quest;
          return await updateQuest(id, toSend);
        } finally {
          set({ loading: false });
        }
      },

      remove: async (id: string) => {
        set({ loading: true });
        try {
          await deleteQuest(id);
        } finally {
          set({ loading: false });
        }
      },

      addObjective: async (questId: string, obj) => {
        set({ loading: true });
        try {
          return await addObjective(questId, obj);
        } finally {
          set({ loading: false });
        }
      },

      updateObjective: async (questId, obj) => {
        set({ loading: true });
        try {
          return await updateObjective(questId, obj);
        } finally {
          set({ loading: false });
        }
      },

      deleteObjective: async (questId, objId) => {
        set({ loading: true });
        try {
          return await deleteObjective(questId, objId);
        } finally {
          set({ loading: false });
        }
      },

      applyQuestCreated: (quest: Quest) => {
        set((state) => {
          if (state.quests.some((q) => q.id === quest.id)) return state;
          return { quests: [...state.quests, quest] };
        });
      },

      applyQuestUpdated: (quest: Quest) => {
        set((state) => ({
          quests: state.quests.map((q) => (q.id === quest.id ? quest : q)),
        }));
      },

      applyQuestDeleted: (questId: string) => {
        set((state) => ({
          quests: state.quests.filter((q) => q.id !== questId),
        }));
      },

      clearStore: () => {
        set({ quests: [], loading: false });
      },
    }),
    {
      name: "quest-storage",
      partialize: (state) => ({
        quests: state.quests,
      }),
    }
  )
);

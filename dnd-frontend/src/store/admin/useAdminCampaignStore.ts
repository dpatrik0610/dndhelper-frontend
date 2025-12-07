import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Campaign } from "@appTypes/Campaign";
import type { Character } from "@appTypes/Character/Character";
import { useAuthStore } from "@store/useAuthStore";
import { apiClient } from "@api/apiClient";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { getCharacters } from "@services/characterService";

export interface AdminCampaignStore {
  campaigns: Campaign[];
  selectedId: string | null;
  characters: Character[];
  allCharacters: Pick<Character, "id" | "name">[];
  loading: boolean;

  reload: () => Promise<void>;
  select: (id: string | null) => void;
  reset: () => void;
  selectedCampaign: () => Campaign | null;

  create: (campaign: Campaign) => Promise<void>;
  update: (id: string, campaign: Campaign) => Promise<void>;
  remove: (id: string) => Promise<void>;

  loadCharacters: (campaignId: string) => Promise<void>;
  addCharacter: (campaignId: string, charId: string) => Promise<void>;
  removeCharacter: (campaignId: string, charId: string) => Promise<void>;

  loadAllCharacters: () => Promise<void>;
}

type PersistedAdminCampaignStore = Pick<AdminCampaignStore, "campaigns" | "selectedId">;

export const useAdminCampaignStore = create<AdminCampaignStore>()(
  persist<AdminCampaignStore, [], [], PersistedAdminCampaignStore>(
    (set, get) => ({
      campaigns: [],
      selectedId: null,
      characters: [],
      allCharacters: [],
      loading: false,

      reload: async () => {
        const token = useAuthStore.getState().token!;
        set({ loading: true });
        try {
          const data = await apiClient<Campaign[]>("/campaign", { method: "GET", token });
          set({ campaigns: data });
        } catch (err) {
          showNotification({
            title: "Error loading campaigns",
            message: String(err),
            color: SectionColor.Red,
          });
        } finally {
          set({ loading: false });
        }
      },

      select: (id) => set({ selectedId: id }),

      reset: () => set({ selectedId: null, characters: [] }),

      selectedCampaign: () => {
        const { campaigns, selectedId } = get();
        return campaigns.find((c) => c.id === selectedId) ?? null;
      },

      create: async (campaign) => {
        const token = useAuthStore.getState().token!;
        try {
          const created = await apiClient<Campaign>("/campaign/create", {
            method: "POST",
            body: campaign,
            token,
          });
          set((s) => ({ campaigns: [...s.campaigns, created] }));
          showNotification({
            title: "Campaign created",
            message: `${created.name} added.`,
            color: SectionColor.Green,
          });
        } catch (err) {
          showNotification({
            title: "Error creating campaign",
            message: String(err),
            color: SectionColor.Red,
          });
        }
      },

      update: async (id, campaign) => {
        const token = useAuthStore.getState().token!;
        try {
          const updated = await apiClient<Campaign>(`/campaign/${id}`, {
            method: "PUT",
            body: campaign,
            token,
          });
          set((s) => ({
            campaigns: s.campaigns.map((c) => (c.id === id ? updated : c)),
          }));
          showNotification({
            title: "Campaign updated",
            message: `${updated.name} saved.`,
            color: SectionColor.Green,
          });
        } catch (err) {
          showNotification({
            title: "Error updating campaign",
            message: String(err),
            color: SectionColor.Red,
          });
        }
      },

      remove: async (id) => {
        const token = useAuthStore.getState().token!;
        try {
          await apiClient(`/campaign/${id}`, { method: "DELETE", token });
          set((s) => ({
            campaigns: s.campaigns.filter((c) => c.id !== id),
            selectedId: s.selectedId === id ? null : s.selectedId,
          }));
          showNotification({
            title: "Campaign deleted",
            message: "Removed successfully.",
            color: SectionColor.Red,
          });
        } catch (err) {
          showNotification({
            title: "Error deleting campaign",
            message: String(err),
            color: SectionColor.Red,
          });
        }
      },

      loadCharacters: async (campaignId) => {
        const token = useAuthStore.getState().token!;
        try {
          const chars = await apiClient<Character[]>(`/campaign/${campaignId}/characters`, { token });
          set({ characters: chars });
        } catch (err) {
          showNotification({
            title: "Error loading characters",
            message: String(err),
            color: SectionColor.Red,
          });
        }
      },

      addCharacter: async (campaignId, charId) => {
        const token = useAuthStore.getState().token!;
        await apiClient(`/campaign/${campaignId}/characters/${charId}`, { method: "POST", token });
        await get().loadCharacters(campaignId);
      },

      removeCharacter: async (campaignId, charId) => {
        const token = useAuthStore.getState().token!;
        await apiClient(`/campaign/${campaignId}/characters/${charId}`, { method: "DELETE", token });
        await get().loadCharacters(campaignId);
      },

      loadAllCharacters: async () => {
        const token = useAuthStore.getState().token!;
        try {
          const chars = await getCharacters(token);
          set(
            {allCharacters: chars.map((c) => ({
                id: c.id,
                name: c.name
              }))
            }
          )
        } catch (err) {
          showNotification({
            title: "Error loading all characters",
            message: String(err),
            color: SectionColor.Red,
          });
        }
      },
    }),
    {
      name: "admin-campaign-store",
      partialize: (state) => ({
        campaigns: state.campaigns,
        selectedId: state.selectedId,
      }),
    }
  )
);

import { getAuthTokenSafe } from "@store/auth/authUtils";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Campaign } from "@appTypes/Campaign";
import type { Character } from "@appTypes/Character/Character";

import { apiClient } from "@api/apiClient";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { getCharacters } from "@services/characterService";
import { getCampaignById, joinCampaign } from "@services/campaignService";
import { setCurrentCampaignId } from "@api/campaignContext";

export interface CampaignStore {
  /** Campaigns I'm a member of (the superadmin included). */
  campaigns: Campaign[];
  selectedId: string | null;
  /** Superadmin only: a campaign opened from the dashboard's all-campaigns list without being a member. */
  visiting: Campaign | null;
  characters: Character[];
  allCharacters: Pick<Character, "id" | "name">[];
  loading: boolean;

  /** Loads the campaigns I'm in and keeps a valid selection. */
  reload: () => Promise<void>;
  /** The current campaign: every API call is scoped to it. */
  select: (id: string | null) => void;
  /** Superadmin: make any campaign current without joining it. */
  visit: (id: string) => Promise<void>;
  join: (code: string) => Promise<Campaign | null>;
  /** Replace one campaign in the list with a fresh copy from the server. */
  patch: (campaign: Campaign) => void;
  reset: () => void;
  selectedCampaign: () => Campaign | null;

  /** The server makes the creator its DM and fills members, invite code and ids. */
  create: (campaign: Partial<Campaign> & { name: string }) => Promise<void>;
  update: (id: string, campaign: Campaign) => Promise<void>;
  remove: (id: string) => Promise<void>;

  loadCharacters: (campaignId: string) => Promise<void>;
  addCharacter: (campaignId: string, charId: string) => Promise<void>;
  removeCharacter: (campaignId: string, charId: string) => Promise<void>;

  loadAllCharacters: () => Promise<void>;
}

type PersistedCampaignStore = Pick<CampaignStore, "campaigns" | "selectedId" | "visiting">;

export const useCampaignStore = create<CampaignStore>()(
  persist<CampaignStore, [], [], PersistedCampaignStore>(
    (set, get) => ({
      campaigns: [],
      selectedId: null,
      visiting: null,
      characters: [],
      allCharacters: [],
      loading: false,

      reload: async () => {
        const token = getAuthTokenSafe()!;
        set({ loading: true });
        try {
          const data = await apiClient<Campaign[]>("/campaign", { method: "GET", token });
          const { selectedId, visiting } = get();
          const stillValid = data.some((c) => c.id === selectedId) || visiting?.id === selectedId;
          set({ campaigns: data, selectedId: stillValid ? selectedId : data[0]?.id ?? null });
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

      // Leaving a visited campaign drops it from the switcher.
      select: (id) => set((s) => ({ selectedId: id, visiting: s.visiting?.id === id ? s.visiting : null })),

      visit: async (id) => {
        if (get().campaigns.some((c) => c.id === id)) return get().select(id);
        try {
          const campaign = await getCampaignById(id);
          set({ visiting: campaign, selectedId: campaign.id });
        } catch (err) {
          showNotification({ title: "Couldn't open campaign", message: (err as Error).message, color: SectionColor.Red });
        }
      },

      join: async (code) => {
        try {
          const joined = await joinCampaign(code.trim());
          set((s) => ({
            campaigns: s.campaigns.some((c) => c.id === joined.id) ? s.campaigns : [...s.campaigns, joined],
            selectedId: joined.id,
          }));
          showNotification({ title: "Joined campaign", message: joined.name, color: SectionColor.Green });
          return joined;
        } catch (err) {
          showNotification({ title: "Couldn't join", message: (err as Error).message, color: SectionColor.Red });
          return null;
        }
      },

      patch: (campaign) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id === campaign.id ? campaign : c)),
          visiting: s.visiting?.id === campaign.id ? campaign : s.visiting,
        })),

      reset: () => set({ selectedId: null, characters: [] }),

      selectedCampaign: () => {
        const { campaigns, selectedId, visiting } = get();
        return campaigns.find((c) => c.id === selectedId) ?? (visiting?.id === selectedId ? visiting : null);
      },

      create: async (campaign) => {
        const token = getAuthTokenSafe()!;
        try {
          const created = await apiClient<Campaign>("/campaign/create", {
            method: "POST",
            body: campaign,
            token,
          });
          set((s) => ({ campaigns: [...s.campaigns, created], selectedId: created.id }));
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
        const token = getAuthTokenSafe()!;
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
        const token = getAuthTokenSafe()!;
        try {
          await apiClient(`/campaign/${id}`, { method: "DELETE", token });
          set((s) => {
            const campaigns = s.campaigns.filter((c) => c.id !== id);
            return { campaigns, selectedId: s.selectedId === id ? campaigns[0]?.id ?? null : s.selectedId };
          });
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
        const token = getAuthTokenSafe()!;
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
        const token = getAuthTokenSafe()!;
        await apiClient(`/campaign/${campaignId}/characters/${charId}`, { method: "POST", token });
        await get().loadCharacters(campaignId);
      },

      removeCharacter: async (campaignId, charId) => {
        const token = getAuthTokenSafe()!;
        await apiClient(`/campaign/${campaignId}/characters/${charId}`, { method: "DELETE", token });
        await get().loadCharacters(campaignId);
      },

      loadAllCharacters: async () => {

        try {
          const chars = await getCharacters();
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
      name: "campaign-store",
      partialize: (state) => ({
        campaigns: state.campaigns,
        selectedId: state.selectedId,
        visiting: state.visiting,
      }),
    }
  )
);

// Every request carries the current campaign. Persisted state is hydrated synchronously, so seed it now.
setCurrentCampaignId(useCampaignStore.getState().selectedId);
useCampaignStore.subscribe((s) => setCurrentCampaignId(s.selectedId));

import { getIsAdmin } from "@store/auth/authUtils";
import { create } from "zustand";
import type { Campaign } from "@appTypes/Campaign";
import type { Encounter } from "@appTypes/Encounter";
import type { Session } from "@appTypes/Session";
import { SectionColor } from "@appTypes/SectionColor";
import { showNotification } from "@components/Notification/Notification";
import {
  clearActiveEncounterForCampaign,
  getCampaignById,
  setActiveEncounterForCampaign,
} from "@services/campaignService";
import {
  createEncounter,
  deleteEncounter,
  getEncountersByCampaign,
  updateEncounter,
} from "@services/encounterService";
import { getSessionsByCampaign } from "@services/sessionService";


export interface EncounterState {
  campaign: Campaign | null;
  encounters: Encounter[];
  sessions: Session[];
  selectedEncounterId: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export interface EncounterActions {
  loadCampaignContext: (campaignId: string) => Promise<void>;
  selectEncounter: (encounterId: string | null) => void;
  createEncounter: (encounter: Encounter) => Promise<Encounter | null>;
  updateEncounter: (encounter: Encounter) => Promise<Encounter | null>;
  removeEncounter: (encounterId: string) => Promise<boolean>;
  setActiveEncounter: (encounterId: string) => Promise<boolean>;
  clearActiveEncounter: () => Promise<boolean>;
  applyCampaignActiveEncounterChange: (campaignId: string, activeEncounterId: string | null) => void;
  clear: () => void;
}









const resolveSelectedEncounterId = (
  encounters: Encounter[],
  activeEncounterId: string | null,
  fallbackSelectedEncounterId: string | null = null,
) => {
  if (fallbackSelectedEncounterId && encounters.some((encounter) => encounter.id === fallbackSelectedEncounterId)) {
    return fallbackSelectedEncounterId;
  }

  if (activeEncounterId && encounters.some((encounter) => encounter.id === activeEncounterId)) {
    return activeEncounterId;
  }

  return encounters[0]?.id ?? null;
};

export const useEncounterStore = create<EncounterState & EncounterActions>((set, get) => ({
  campaign: null,
  encounters: [],
  sessions: [],
  selectedEncounterId: null,
  loading: false,
  saving: false,
  error: null,

  async loadCampaignContext(campaignId) {
    set({ loading: true, error: null });

    try {

      const [campaign, encounters, sessions] = await Promise.all([
        getCampaignById(campaignId),
        getEncountersByCampaign(campaignId),
        getSessionsByCampaign(campaignId),
      ]);

      set((state) => ({
        campaign,
        encounters,
        sessions,
        selectedEncounterId: resolveSelectedEncounterId(
          encounters,
          campaign.activeEncounterId,
          state.campaign?.id === campaign.id ? state.selectedEncounterId : null,
        ),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message });
      showNotification({
        title: "Failed to load encounters",
        message,
        color: SectionColor.Red,
      });
    } finally {
      set({ loading: false });
    }
  },

  selectEncounter(encounterId) {
    set((state) => ({
      selectedEncounterId: encounterId && state.encounters.some((encounter) => encounter.id === encounterId)
        ? encounterId
        : null,
    }));
  },

  async createEncounter(encounter) {
    set({ saving: true, error: null });

    try {

      const created = await createEncounter(encounter);

      set((state) => ({
        encounters: [...state.encounters, created],
        selectedEncounterId: created.id,
      }));

      showNotification({
        title: "Encounter created",
        message: created.name || "Untitled encounter",
        color: SectionColor.Green,
      });

      return created;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message });
      showNotification({
        title: "Failed to create encounter",
        message,
        color: SectionColor.Red,
      });
      return null;
    } finally {
      set({ saving: false });
    }
  },

  async updateEncounter(encounter) {
    if (!encounter.id) {
      return null;
    }

    set({ saving: true, error: null });

    try {

      const updated = await updateEncounter(encounter.id, encounter);

      set((state) => ({
        encounters: state.encounters.map((currentEncounter) =>
          currentEncounter.id === updated.id ? updated : currentEncounter,
        ),
      }));

      showNotification({
        title: "Encounter updated",
        message: updated.name || "Encounter saved",
        color: SectionColor.Green,
      });

      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message });
      showNotification({
        title: "Failed to update encounter",
        message,
        color: SectionColor.Red,
      });
      return null;
    } finally {
      set({ saving: false });
    }
  },

  async removeEncounter(encounterId) {
    set({ saving: true, error: null });

    try {

      await deleteEncounter(encounterId);

      set((state) => {
        const encounters = state.encounters.filter((encounter) => encounter.id !== encounterId);
        const isRemovedActiveEncounter = state.campaign?.activeEncounterId === encounterId;

        return {
          encounters,
          campaign: state.campaign
            ? {
                ...state.campaign,
                activeEncounterId: isRemovedActiveEncounter ? null : state.campaign.activeEncounterId,
              }
            : null,
          selectedEncounterId: resolveSelectedEncounterId(
            encounters,
            isRemovedActiveEncounter ? null : state.campaign?.activeEncounterId ?? null,
          ),
        };
      });

      showNotification({
        title: "Encounter deleted",
        message: "The encounter was removed.",
        color: SectionColor.Red,
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message });
      showNotification({
        title: "Failed to delete encounter",
        message,
        color: SectionColor.Red,
      });
      return false;
    } finally {
      set({ saving: false });
    }
  },

  async setActiveEncounter(encounterId) {
    const campaignId = get().campaign?.id;
    if (!campaignId) {
      return false;
    }

    set({ saving: true, error: null });

    try {

      await setActiveEncounterForCampaign(campaignId, encounterId);

      set((state) => ({
        campaign: state.campaign ? { ...state.campaign, activeEncounterId: encounterId } : null,
      }));

      showNotification({
        title: "Active encounter updated",
        message: "The campaign encounter focus has changed.",
        color: SectionColor.Green,
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message });
      showNotification({
        title: "Failed to activate encounter",
        message,
        color: SectionColor.Red,
      });
      return false;
    } finally {
      set({ saving: false });
    }
  },

  async clearActiveEncounter() {
    const campaignId = get().campaign?.id;
    if (!campaignId) {
      return false;
    }

    set({ saving: true, error: null });

    try {

      await clearActiveEncounterForCampaign(campaignId);

      set((state) => ({
        campaign: state.campaign ? { ...state.campaign, activeEncounterId: null } : null,
        selectedEncounterId: getIsAdmin()
          ? state.selectedEncounterId
          : resolveSelectedEncounterId(state.encounters, null),
      }));

      showNotification({
        title: "Active encounter cleared",
        message: "Players will no longer see an active encounter.",
        color: SectionColor.Yellow,
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message });
      showNotification({
        title: "Failed to clear active encounter",
        message,
        color: SectionColor.Red,
      });
      return false;
    } finally {
      set({ saving: false });
    }
  },

  applyCampaignActiveEncounterChange(campaignId, activeEncounterId) {
    set((state) => {
      if (state.campaign?.id !== campaignId) {
        return state;
      }

      const shouldFollowActiveEncounter =
        !getIsAdmin() ||
        !state.selectedEncounterId ||
        state.selectedEncounterId === state.campaign.activeEncounterId;

      return {
        campaign: { ...state.campaign, activeEncounterId },
        selectedEncounterId: shouldFollowActiveEncounter
          ? resolveSelectedEncounterId(state.encounters, activeEncounterId)
          : state.selectedEncounterId,
      };
    });
  },

  clear() {
    set({
      campaign: null,
      encounters: [],
      sessions: [],
      selectedEncounterId: null,
      loading: false,
      saving: false,
      error: null,
    });
  },
}));

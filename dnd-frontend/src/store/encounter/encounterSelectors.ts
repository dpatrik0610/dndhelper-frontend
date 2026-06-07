import { useEncounterStore } from "./encounterStore";
import { useShallow } from "zustand/react/shallow";

// Data Selectors
export const useCampaign = () => useEncounterStore((s) => s.campaign);
export const useEncounterList = () => useEncounterStore((s) => s.encounters);
export const useSessionList = () => useEncounterStore((s) => s.sessions);
export const useSelectedEncounterId = () => useEncounterStore((s) => s.selectedEncounterId);
export const useEncounterLoading = () => useEncounterStore((s) => s.loading);
export const useEncounterSaving = () => useEncounterStore((s) => s.saving);
export const useEncounterError = () => useEncounterStore((s) => s.error);

export const useSelectedEncounter = () => useEncounterStore((s) => 
  s.encounters.find((e) => e.id === s.selectedEncounterId) ?? null
);
export const useActiveEncounter = () => useEncounterStore((s) => 
  s.encounters.find((e) => e.id === s.campaign?.activeEncounterId) ?? null
);

// Action Selectors
export const useEncounterActions = () => useEncounterStore(useShallow((s) => ({
  loadCampaignContext: s.loadCampaignContext,
  selectEncounter: s.selectEncounter,
  createEncounter: s.createEncounter,
  updateEncounter: s.updateEncounter,
  removeEncounter: s.removeEncounter,
  setActiveEncounter: s.setActiveEncounter,
  clearActiveEncounter: s.clearActiveEncounter,
  applyCampaignActiveEncounterChange: s.applyCampaignActiveEncounterChange,
  clear: s.clear,
})));

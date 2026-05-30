import { create } from "zustand";

export type AdminSection =
  | "Dashboard"
  | "EncounterBoard"
  | "EncounterRoomManager"
  | "CharactersManager"
  | "InventoryDashboard"
  | "UserManager"
  | "ItemManager"
  | "MonsterManager"
  | "CampaignManager"
  | "InitiativeTracker"
  | "SpellsManager"
  | "CacheManager"
  | "SessionManager"
  | "BackupManager"
  | "RuleManager"
  ;

interface AdminDashboardState {
  activeSection: AdminSection;
  setActiveSection: (section: AdminSection) => void;
  resetSection: () => void;
}

export const useAdminDashboardStore = create<AdminDashboardState>((set) => ({
  activeSection: "Dashboard",
  setActiveSection: (section) => set({ activeSection: section }),
  resetSection: () => set({ activeSection: "Dashboard" }),
}));

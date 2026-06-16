import { create } from "zustand";

export type AdminSection =
  | "Dashboard"
  | "EncounterBoard"
  | "EncounterRoomManager"
  | "CharactersManager"
  | "InventoryDashboard"
  | "ShopManager"
  | "UserManager"
  | "ItemManager"
  | "MonsterManager"
  | "CampaignManager"
  | "InitiativeTracker"
  | "SpellsManager"
  | "CacheManager"
  | "SessionManager"
  | "BackupManager"
  | "RuleManager";

export interface AdminDashboardState {
  activeSection: AdminSection;
}

export interface AdminDashboardActions {
  setActiveSection: (section: AdminSection) => void;
  resetSection: () => void;
}

export const useAdminDashboardStore = create<AdminDashboardState & AdminDashboardActions>((set) => ({
  activeSection: "Dashboard",
  setActiveSection: (section) => set({ activeSection: section }),
  resetSection: () => set({ activeSection: "Dashboard" }),
}));

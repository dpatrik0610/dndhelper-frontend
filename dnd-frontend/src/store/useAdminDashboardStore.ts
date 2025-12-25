import { create } from "zustand";

export type AdminSection =
  | "Dashboard"
  | "CharactersManager"
  | "InventoryManager"
  | "UserManager"
  | "ItemManager"
  | "MonsterManager"
  | "CampaignManager"
  | "InitiativeTracker"
  | "SpellsManager"
  | "CacheManager"
  | "InventoryBrowser"
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

import { create } from "zustand";

export type AdminSection =
  | "Dashboard"
  | "InventoryDashboard"
  | "ShopManager"
  | "UserManager"
  | "ItemManager"
  | "MonsterManager"
  | "CampaignManager"
  | "SpellsManager"
  | "CacheManager"
  | "SessionManager"
  | "BackupManager"
  | "RuleManager"
  | "QuestManager"
  | "AllCampaigns";

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

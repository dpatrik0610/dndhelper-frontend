import { create } from "zustand";

export type AdminSection =
  | "Dashboard"
  | "InventoryManager"
  | "UserManager"
  | "ItemManager"
  | "CampaignManager"
  | "InitiativeTracker"
  | "SpellsManager"
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

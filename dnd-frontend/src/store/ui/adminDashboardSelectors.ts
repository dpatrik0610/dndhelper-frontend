import { useAdminDashboardStore } from "./adminDashboardStore";

export const useAdminActiveSection = () => useAdminDashboardStore((s) => s.activeSection);

export const useAdminDashboardActions = () => useAdminDashboardStore((s) => ({
  setActiveSection: s.setActiveSection,
  resetSection: s.resetSection,
}));

import { useSessionStore } from "./sessionStore";

// Data Selectors
export const useSessionList = () => useSessionStore((s) => s.sessions);
export const useSelectedSession = () => useSessionStore((s) => s.selected);
export const useSessionLoading = () => useSessionStore((s) => s.loading);
export const useSessionError = () => useSessionStore((s) => s.error);

// Action Selectors
export const useSessionActions = () => useSessionStore((s) => ({
  loadAll: s.loadAll,
  loadByCampaign: s.loadByCampaign,
  loadById: s.loadById,
  select: s.select,
  create: s.create,
  update: s.update,
  remove: s.remove,
  setLive: s.setLive,
  clear: s.clear,
}));

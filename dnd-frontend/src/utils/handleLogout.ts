import { useAuthStore } from "@store/useAuthStore";
import { useUiStore } from "@store/useUiStore";

export const handleLogout = () => {
  // Let the centralized auth guard handle clearing stores; just clear auth + UI prefs here
  useAuthStore.getState().clearAuthData();
  useAuthStore.persist.clearStorage();
  useUiStore.getState().setSidebarTheme("sunset");
};

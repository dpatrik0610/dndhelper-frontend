import { useAuthStore } from "@store/auth/authStore";
import { useUiStore } from "@store/ui/uiStore";

export const handleLogout = () => {
  // Let the centralized auth guard handle clearing stores; just clear auth + UI prefs here
  useAuthStore.getState().logout();
  useAuthStore.persist.clearStorage();
  useUiStore.getState().setSidebarTheme("sunset");
};

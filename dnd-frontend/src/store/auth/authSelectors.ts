import { useAuthStore } from "./authStore";
import { useShallow } from "zustand/react/shallow";

// Data selectors
export const useToken = () => useAuthStore((s) => s.token);
export const useCurrentUserId = () => useAuthStore((s) => s.id);
export const useUsername = () => useAuthStore((s) => s.username);
export const useRoles = () => useAuthStore((s) => s.roles);
/** The superadmin: sees and edits every campaign and core content. */
export const useIsSuperAdmin = () => useAuthStore((s) => s.roles.includes("Admin"));
export const useIsAuthenticated = () => useAuthStore((s) => !!s.token);

// Action selectors
export const useAuthActions = () => useAuthStore(useShallow((s) => ({
  setAuthData: s.setAuthData,
  setToken: s.setToken,
  logout: s.logout,
})));

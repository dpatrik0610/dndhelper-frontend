import { useAuthStore } from "./authStore";

/**
 * Gets the auth token. Throws if no token exists.
 * Ideal for service calls that strictly require authentication.
 */
export const getAuthToken = (): string => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("Authentication required");
  return token;
};

/**
 * Gets the auth token or null if not authenticated.
 */
export const getAuthTokenSafe = (): string | null => {
  return useAuthStore.getState().token;
};

/**
 * Checks if the current user has the Admin role.
 */
export const getIsAdmin = (): boolean => {
  return useAuthStore.getState().roles.includes("Admin");
};

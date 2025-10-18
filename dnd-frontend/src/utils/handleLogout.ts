import type { NavigateFunction } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useCharacterStore } from "../store/useCharacterStore";
import { useInventoryStore } from "../store/useInventorystore";

export const handleLogout = (navigate: NavigateFunction) => {
  // Clear auth
  useAuthStore.getState().clearAuthData();
  useAuthStore.persist.clearStorage();

  // Clear character
  useCharacterStore.getState().clearCharacter();
  useCharacterStore.persist.clearStorage();

  // Clear inventory
  useInventoryStore.getState().clearInventories();
  useInventoryStore.persist.clearStorage();

  console.log(`✅ User logged out, redirecting to login page.`);
  navigate("/login");
};

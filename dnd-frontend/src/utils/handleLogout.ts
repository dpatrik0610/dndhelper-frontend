import type { NavigateFunction } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useCharacterStore } from "../store/useCharacterStore";
import { useInventoryStore } from "../store/useInventorystore";
import { useSpellStore } from "../store/useSpellStore";

export const handleLogout = (navigate: NavigateFunction) => {

  localStorage.clear();
  
  // Clear auth
  useAuthStore.getState().clearAuthData();
  useAuthStore.persist.clearStorage();

  // Clear character
  useCharacterStore.getState().clearCharacter();
  useCharacterStore.persist.clearStorage();

  // Clear inventory
  useInventoryStore.getState().clearInventories();
  useInventoryStore.persist.clearStorage();

  // Clear spells
  useSpellStore.getState().clearCurrentSpell();
  useSpellStore.persist.clearStorage();

  console.log(`✅ User logged out, redirecting to login page.`);
  navigate("/login");
};

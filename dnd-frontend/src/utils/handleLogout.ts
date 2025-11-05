import { useAdminCampaignStore } from "../store/admin/useAdminCampaignStore";
import { useAdminCharacterStore } from "../store/admin/useAdminCharacterStore";
import { useAdminInventoryStore } from "../store/admin/useAdminInventoryStore";
import { useAuthStore } from "../store/useAuthStore";
import { useCharacterStore } from "../store/useCharacterStore";
import { useInventoryStore } from "../store/useInventorystore";
import { useSpellStore } from "../store/useSpellStore";

export const handleLogout = () => {

  localStorage.clear();
  
  // Clear auth
  useAuthStore.getState().clearAuthData();
  useAuthStore.persist.clearStorage();

  // Clear character
  useCharacterStore.getState().clearStore();
  useCharacterStore.persist.clearStorage();

  // Clear inventory
  useInventoryStore.getState().clearInventories();
  useInventoryStore.persist.clearStorage();

  // Clear spells
  useSpellStore.getState().clearCurrentSpell();
  useSpellStore.persist.clearStorage();

  // Clear Admin campaign
  useAdminCampaignStore.getState().reset();
  useAdminCampaignStore.persist.clearStorage();

  // Clear Admin character
  useAdminCharacterStore.getState().clearStorage();

  // Clear Admin inventory
  useAdminInventoryStore.getState().clearStorage();
};

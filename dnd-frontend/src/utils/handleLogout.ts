import { useAdminCampaignStore } from "@store/admin/useAdminCampaignStore";
import { useAdminCharacterStore } from "@store/admin/useAdminCharacterStore";
import { useAdminCurrencyStore } from "@store/admin/useAdminCurrencyStore";
import { useAdminInventoryStore } from "@store/admin/useAdminInventoryStore";
import { useAdminEquipmentStore } from "@store/admin/useAdminEquipmentStore";
import { useAdminMonsterStore } from "@store/admin/useAdminMonsterStore";
import { useAdminUserStore } from "@store/admin/useAdminUserStore";
import { useAuthStore } from "@store/useAuthStore";
import { useCharacterStore } from "@store/useCharacterStore";
import { useInventoryStore } from "@store/useInventorystore";
import { useSpellStore } from "@store/useSpellStore";
import { useNoteStore } from "@store/useNoteStore";
import { useSessionStore } from "@store/session/useSessionStore";
import { useUiStore } from "@store/useUiStore";

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

  // Clear notes
  useNoteStore.getState().clearStore?.();
  useNoteStore.persist?.clearStorage?.();

  // Clear sessions
  useSessionStore.getState().clear?.();
  useSessionStore.persist?.clearStorage?.();

  // Clear Admin campaign
  useAdminCampaignStore.getState().reset();
  useAdminCampaignStore.persist.clearStorage();

  // Clear Admin character
  useAdminCharacterStore.getState().clearStorage();
  // Clear Admin inventory
  useAdminInventoryStore.getState().clearStorage();
  // Clear Admin currencies
  useAdminCurrencyStore.getState().clearStorage();
  useAdminCurrencyStore.persist.clearStorage();
  // Clear Admin equipment
  useAdminEquipmentStore.getState().clearStorage();
  // Clear Admin monsters
  useAdminMonsterStore.getState().clearStorage();
  // Clear Admin users
  useAdminUserStore.getState().clearStorage();

  // Clear UI prefs (theme)
  useUiStore.getState().setSidebarTheme("sunset");
};

import { useAuthStore } from "@store/auth/authStore";
import { useCharacterStore } from "@store/character/characterStore";
import { useInventoryStore } from "@store/inventory/inventoryStore";
import { useNoteStore } from "@store/note/noteStore";
import { useSpellStore } from "@store/spell/spellStore";
import { useSessionStore } from "@store/session/sessionStore";
import { useAdminCampaignStore } from "@store/admin/adminCampaignStore";
import { useAdminCharacterStore } from "@store/admin/adminCharacterStore";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { useAdminCurrencyStore } from "@store/admin/adminCurrencyStore";
import { useAdminEquipmentStore } from "@store/admin/adminEquipmentStore";
import { useAdminMonsterStore } from "@store/admin/adminMonsterStore";
import { useAdminUserStore } from "@store/admin/adminUserStore";

let registered = false;

/**
 * Registers a single auth-change listener that clears all user-scoped stores
 * when the authenticated user/roles change.
 */
export const registerAuthStoreGuards = () => {
  if (registered) return;
  registered = true;

  useAuthStore.subscribe((next, prev) => {
    if (next.id === prev?.id && next.roles === prev?.roles) return;

    // Character store
    useCharacterStore.getState().clearStore();
    useCharacterStore.persist?.clearStorage?.();

    // Inventory store
    useInventoryStore.getState().clearInventories();
    useInventoryStore.persist?.clearStorage?.();

    // Note store
    useNoteStore.getState().clearStore();
    useNoteStore.persist?.clearStorage?.();

    // Spell store
    useSpellStore.persist?.clearStorage?.();
    useSpellStore.setState({ spellNames: [], currentSpell: null });

    // Session store
    useSessionStore.getState().clear();
    useSessionStore.persist?.clearStorage?.();

    // Admin stores
    useAdminCampaignStore.getState().reset();
    useAdminCampaignStore.persist?.clearStorage?.();

    useAdminCharacterStore.getState().clearStorage?.();
    useAdminInventoryStore.getState().clearStorage?.();
    useAdminCurrencyStore.getState().clearStorage?.();
    useAdminEquipmentStore.getState().clearStorage?.();
    useAdminMonsterStore.getState().clearStorage?.();
    useAdminUserStore.getState().clearStorage?.();
  });
};

import { useAuthStore } from "@store/useAuthStore";
import { useCharacterStore } from "@store/useCharacterStore";
import { useInventoryStore } from "@store/useInventorystore";
import { useNoteStore } from "@store/useNoteStore";
import { useSpellStore } from "@store/useSpellStore";
import { useSessionStore } from "@store/session/useSessionStore";
import { useAdminCampaignStore } from "@store/admin/useAdminCampaignStore";
import { useAdminCharacterStore } from "@store/admin/useAdminCharacterStore";
import { useAdminInventoryStore } from "@store/admin/useAdminInventoryStore";
import { useAdminCurrencyStore } from "@store/admin/useAdminCurrencyStore";
import { useAdminEquipmentStore } from "@store/admin/useAdminEquipmentStore";
import { useAdminMonsterStore } from "@store/admin/useAdminMonsterStore";
import { useAdminUserStore } from "@store/admin/useAdminUserStore";

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

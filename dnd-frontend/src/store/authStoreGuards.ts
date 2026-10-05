import { useAuthStore } from "@store/auth/authStore";
import { useCharacterStore } from "@store/character/characterStore";
import { useInventoryStore } from "@store/inventory/inventoryStore";
import { useNoteStore } from "@store/note/noteStore";
import { useSpellStore } from "@store/spell/spellStore";
import { useSessionStore } from "@store/session/sessionStore";
import { useQuestStore } from "@store/quest/questStore";
import { useCampaignStore } from "@store/campaign/campaignStore";
import { useAdminCharacterStore } from "@store/admin/adminCharacterStore";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { useAdminCurrencyStore } from "@store/admin/adminCurrencyStore";
import { useAdminEquipmentStore } from "@store/admin/adminEquipmentStore";
import { useAdminMonsterStore } from "@store/admin/adminMonsterStore";
import { useAdminUserStore } from "@store/admin/adminUserStore";
import { loadCharacters } from "@utils/loadCharacter";

let registered = false;

// Which character was active in each campaign, so switching back restores it.
const LAST_CHARACTER_KEY = "last-character-by-campaign";
const readLastCharacters = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(LAST_CHARACTER_KEY) ?? "{}");
  } catch {
    return {};
  }
};

/** Loads the new campaign's characters and reselects the one last used there (else the only one I own). */
const switchCampaignCharacters = async (campaignId: string | null) => {
  if (!campaignId || !useAuthStore.getState().token) return;
  let characters;
  try {
    characters = await loadCharacters();
  } catch {
    return; // offline/server error: the bootstrap hook retries on the next load
  }
  if (useCampaignStore.getState().selectedId !== campaignId) return; // switched again meanwhile

  const me = useAuthStore.getState().id;
  const mine = characters.filter((c) => me && c.ownerIds?.includes(me));
  const remembered = characters.find((c) => c.id === readLastCharacters()[campaignId]);
  const pick = remembered ?? (mine.length === 1 ? mine[0] : null);
  if (pick && !useCharacterStore.getState().character) useCharacterStore.getState().setCharacter(pick);
};

/**
 * Clears every store holding campaign data. Emptying the character list also makes
 * useBootstrapCharacters fetch the new campaign's characters.
 */
const clearScopedStores = () => {
  useCharacterStore.getState().clearStore();
  useCharacterStore.persist?.clearStorage?.();

  useInventoryStore.getState().clearInventories();
  useInventoryStore.persist?.clearStorage?.();

  useNoteStore.getState().clearStore();
  useNoteStore.persist?.clearStorage?.();

  useSpellStore.persist?.clearStorage?.();
  useSpellStore.setState({ spellNames: [], currentSpell: null });

  useSessionStore.getState().clear();
  useSessionStore.persist?.clearStorage?.();

  useQuestStore.getState().clearStore();
  useQuestStore.persist?.clearStorage?.();

  useAdminCharacterStore.getState().clearStorage?.();
  useAdminInventoryStore.getState().clearStorage?.();
  useAdminCurrencyStore.getState().clearStorage?.();
  useAdminEquipmentStore.getState().clearStorage?.();
  useAdminMonsterStore.getState().clearStorage?.();
};

/**
 * Registers the listeners that drop scoped data: everything when the user/roles change,
 * campaign data when the current campaign changes.
 */
export const registerAuthStoreGuards = () => {
  if (registered) return;
  registered = true;

  useAuthStore.subscribe((next, prev) => {
    if (next.id === prev?.id && next.roles === prev?.roles) return;

    clearScopedStores();

    useCampaignStore.setState({ campaigns: [], selectedId: null, visiting: null, characters: [] });
    useCampaignStore.persist?.clearStorage?.();
    useAdminUserStore.getState().clearStorage?.();
  });

  useCampaignStore.subscribe((next, prev) => {
    if (next.selectedId === prev.selectedId) return;
    clearScopedStores();
    // The list may already have been empty (campaign without characters), so reload explicitly.
    void switchCampaignCharacters(next.selectedId);
  });

  useCharacterStore.subscribe((next, prev) => {
    const campaignId = useCampaignStore.getState().selectedId;
    const characterId = next.character?.id;
    if (!campaignId || !characterId || characterId === prev.character?.id) return;
    try {
      localStorage.setItem(LAST_CHARACTER_KEY, JSON.stringify({ ...readLastCharacters(), [campaignId]: characterId }));
    } catch {
      /* storage unavailable: just no restore */
    }
  });
};

import { getAuthTokenSafe } from "@store/auth/authUtils";
import { create } from "zustand";
import { getCampaignCharacters } from "@services/campaignService";
import { updateCharacter as updateCharacterService, longrest as longrestService, bulkLongRest } from "@services/characterService";
import { transferCurrenciesToCharacter, removeCurrencies } from "@services/currencyService";

import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import type { Character } from "@appTypes/Character/Character";
import type { Currency } from "@appTypes/Currency";

interface AdminCharacterStore {
  characters: Character[];
  selectedId: string | null;
  loading: boolean;

  loadAll: (campaignId: string) => Promise<void>;
  updateCharacter: (id: string, patch: Partial<Character>) => Promise<void>;
  longRestCharacter: (id: string) => Promise<void>;
  bulkLongRest: (characterIds: string[]) => Promise<void>;
  modifyCurrency: (characterId: string, currencyCode: string, delta: number) => Promise<void>;

  select: (id: string | null) => void;
  clearStorage: () => void;
}

export const useAdminCharacterStore = create<AdminCharacterStore>((set, get) => ({
  characters: [],
  selectedId: null,
  loading: false,

  // -------------------------
  // LOAD ALL CHARACTERS
  // -------------------------
  loadAll: async (campaignId) => {
    const token = getAuthTokenSafe()!;
    try {
      set({ loading: true });

      const chars = await getCampaignCharacters(campaignId, token);

      const normalized = chars.map(c => ({
        ...c,
        hitPoints: c.hitPoints ?? 0,
        maxHitPoints: c.maxHitPoints ?? 0,
        temporaryHitPoints: c.temporaryHitPoints ?? 0,
        inspiration: c.inspiration ?? 0,
        currencies: c.currencies ?? [],
        armorClass: c.armorClass ?? 10,
        initiative: c.initiative ?? 0,
      }));

      set({ characters: normalized });
    } catch (err) {
      console.error(err);
      showNotification({
        title: "Failed to load characters",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      set({ loading: false });
    }
  },

  // -------------------------
  // UPDATE CHARACTER
  // -------------------------
  updateCharacter: async (id, patch) => {
    const token = getAuthTokenSafe()!;
    const existing = get().characters.find(c => c.id === id);
    if (!existing) return;

    try {
      set({ loading: true });

      const fullCharacter = { ...existing, ...patch } as Character;

      const updated = await updateCharacterService(fullCharacter, token);
      if (!updated) throw new Error("Update returned null");

      set((state) => ({
        characters: state.characters.map(c => c.id === id ? { ...c, ...patch } : c),
      }));
    } catch (err) {
      console.error(err);
      showNotification({
        title: "Failed to update character",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      set({ loading: false });
    }
  },

  // -------------------------
  // LONG REST CHARACTER
  // -------------------------
  longRestCharacter: async (id) => {
    const token = getAuthTokenSafe()!;
    const existing = get().characters.find(c => c.id === id);
    if (!existing) return;

    try {
      const response = await longrestService(id, token);
      if (response.success) {
        set((state) => ({
          characters: state.characters.map(c => 
            c.id === id ? { 
              ...c, 
              hitPoints: c.maxHitPoints, 
              temporaryHitPoints: 0, 
              deathSavesSuccesses: 0, 
              deathSavesFailures: 0 
            } : c
          ),
        }));
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error(err);
      showNotification({
        title: "Long rest failed",
        message: String(err),
        color: SectionColor.Red,
      });
    }
  },

  // -------------------------
  // BULK LONG REST
  // -------------------------
  bulkLongRest: async (characterIds) => {
    const token = getAuthTokenSafe()!;
    if (!characterIds.length) return;

    try {
      set({ loading: true });

      const { successful, failed } = await bulkLongRest(characterIds, token);

      if (successful.length > 0) {
        set((state) => ({
          characters: state.characters.map(c =>
            successful.includes(c.id!) ? {
              ...c,
              hitPoints: c.maxHitPoints,
              temporaryHitPoints: 0,
              deathSavesSuccesses: 0,
              deathSavesFailures: 0
            } : c
          ),
        }));

        showNotification({
          title: "Group Long Rest Complete",
          message: `Successfully rested ${successful.length} character(s).`,
          color: SectionColor.Green,
        });
      }

      if (failed.length > 0) {
        showNotification({
          title: "Group Rest Incomplete",
          message: `Failed to rest ${failed.length} character(s).`,
          color: SectionColor.Orange,
        });
      }

    } catch (err) {
      console.error(err);
      showNotification({
        title: "Group Long Rest Error",
        message: "An unexpected error occurred during the bulk rest.",
        color: SectionColor.Red,
      });
    } finally {
      set({ loading: false });
    }
  },

  // -------------------------
  // MODIFY CURRENCY
  // -------------------------
  modifyCurrency: async (characterId, currencyCode, delta) => {
    const token = getAuthTokenSafe()!;
    if (!delta) return;

    const payload: Currency[] = [
      { currencyCode, type: currencyCode, amount: Math.abs(delta) },
    ];

    try {
      if (delta > 0) {
        await transferCurrenciesToCharacter(characterId, payload, token);
      } else {
        await removeCurrencies(characterId, payload, token);
      }

      // local optimistic update
      set((state) => ({
        characters: state.characters.map((c) => {
          if (c.id !== characterId) return c;

          const existing = c.currencies.find(x => x.currencyCode === currencyCode)
            ?? { currencyCode, type: currencyCode, amount: 0 };

          const updatedAmount = Math.max(0, existing.amount + delta);

          const nextCurrencies = [
            ...c.currencies.filter(x => x.currencyCode !== currencyCode),
            { ...existing, amount: updatedAmount },
          ];

          return { ...c, currencies: nextCurrencies };
        }),
      }));
    } catch (err) {
      console.error(err);
      showNotification({
        title: "Currency update failed",
        message: String(err),
        color: SectionColor.Red,
      });
    }
  },

  // -------------------------
  // UI HELPERS
  // -------------------------
  select: (id) => set({ selectedId: id }),
  clearStorage: () => set({ characters: [], selectedId: null, loading: false }),
}));

import { create } from "zustand";
import { getCampaignCharacters } from "../../services/campaignService";
import { useAuthStore } from "../useAuthStore";
import { showNotification } from "../../components/Notification/Notification";
import { SectionColor } from "../../types/SectionColor";
import type { Character } from "../../types/Character/Character";

interface AdminCharacterStore {
  characters: Pick<Character, "id" | "name" | "ownerId" | "inventoryIds" | "characterClass" | "level">[];
  selectedId: string | null;
  loading: boolean;
  loadAll: (campaignId: string) => Promise<void>;
  select: (id: string | null) => void;
  clearStorage: () => void;
}

export const useAdminCharacterStore = create<AdminCharacterStore>((set) => ({
  characters: [],
  selectedId: null,
  loading: false,

  loadAll: async (campaignId: string) => {
    const token = useAuthStore.getState().token!;
    try {
      set({ loading: true });
      const chars = await getCampaignCharacters(campaignId, token);
      set({
        characters: chars.map((c) => ({
          id: c.id!,
          name: c.name,
          ownerId: c.ownerId,
          inventoryIds: c.inventoryIds,
          characterClass: c.characterClass,
          level: c.level
        })),
      });
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

  select: (id) => set({ selectedId: id }),

  clearStorage: () => set({ characters: [], selectedId: null, loading: false }),
}));

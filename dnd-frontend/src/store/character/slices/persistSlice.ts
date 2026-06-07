import type { StateCreator } from "zustand";
import type { CharacterStoreState, PersistSliceActions } from "../storeTypes";
import { updateCharacter as updateCharacterApi } from "@services/characterService";
import { getAuthTokenSafe } from "@store/auth/authUtils";
import { normalizeCharacter } from "./coreSlice";

export const createPersistSlice: StateCreator<
  CharacterStoreState,
  [["zustand/immer", never]],
  [],
  PersistSliceActions
> = (set, get) => ({
  persistCharacter: async () => {
    const current = get().character;
    if (!current?.id) return null;
    
    const token = getAuthTokenSafe();
    if (!token) return null;

    try {
      const saved = await updateCharacterApi(current, token);
      if (saved) {
        get().setCharacter(saved);
        
        // Also update in characters array
        set((state) => {
          const idx = state.characters.findIndex((c) => c.id === saved.id);
          if (idx !== -1) {
            state.characters[idx] = normalizeCharacter(saved) as any;
          }
        });
      }
      return saved ?? null;
    } catch (err) {
      console.error("Failed to persist character", err);
      return null;
    }
  },

  applyAndPersist: (updater) => {
    const current = get().character;
    if (!current) return;
    
    const updated = updater(current);
    if (!updated) return;
    
    const normalized = normalizeCharacter(updated);
    if (!normalized) return;

    // Apply locally first
    get().setCharacter(normalized);
    
    set((state) => {
      const idx = state.characters.findIndex((c) => c.id === normalized.id);
      if (idx !== -1) {
        state.characters[idx] = normalized as any;
      }
    });

    // Then persist asynchronously
    void get().persistCharacter();
  },
});

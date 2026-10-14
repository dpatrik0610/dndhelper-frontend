import { create } from "zustand";

interface SearchStore {
  open: boolean;
  /** Set on the first open: the palette chunk loads then and stays mounted, so the card a result opens outlives the popup. */
  used: boolean;
  setOpen: (open: boolean) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  open: false,
  used: false,
  setOpen: (open) => set((s) => ({ open, used: s.used || open })),
}));

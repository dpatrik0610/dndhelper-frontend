import { create } from "zustand";

interface RestClockState {
  playId: number;
  message: string | null;
  play: (message: string) => void;
  clear: () => void;
}

export const useRestClockStore = create<RestClockState>((set) => ({
  playId: 0,
  message: null,
  play: (message) => set((s) => ({ playId: s.playId + 1, message })),
  clear: () => set({ message: null }),
}));

export const playRestClock = (message: string) => useRestClockStore.getState().play(message);

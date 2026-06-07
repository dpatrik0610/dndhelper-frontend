import { create } from "zustand";
import type { SubtleRollEvent } from "@appTypes/Roll";

export interface SubtleRollState {
  activeRoll: SubtleRollEvent | null;
  opened: boolean;
}

export interface SubtleRollActions {
  openRoll: (roll: SubtleRollEvent) => void;
  close: () => void;
}

export const useSubtleRollStore = create<SubtleRollState & SubtleRollActions>((set) => ({
  activeRoll: null,
  opened: false,
  openRoll: (roll) => set({ activeRoll: roll, opened: true }),
  close: () => set({ opened: false, activeRoll: null }),
}));

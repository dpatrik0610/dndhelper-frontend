import { create } from "zustand";
import type { SubtleRollEvent } from "@appTypes/Roll";

interface SubtleRollState {
  activeRoll: SubtleRollEvent | null;
  opened: boolean;
  openRoll: (roll: SubtleRollEvent) => void;
  close: () => void;
}

export const useSubtleRollStore = create<SubtleRollState>((set) => ({
  activeRoll: null,
  opened: false,
  openRoll: (roll) => set({ activeRoll: roll, opened: true }),
  close: () => set({ opened: false, activeRoll: null }),
}));

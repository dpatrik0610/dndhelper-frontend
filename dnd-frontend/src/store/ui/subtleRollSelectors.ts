import { useSubtleRollStore } from "./subtleRollStore";

export const useActiveSubtleRoll = () => useSubtleRollStore((s) => s.activeRoll);
export const useSubtleRollOpened = () => useSubtleRollStore((s) => s.opened);

export const useSubtleRollActions = () => useSubtleRollStore((s) => ({
  openRoll: s.openRoll,
  close: s.close,
}));

import { useReducedMotion } from "@mantine/hooks";
import { useUiStore } from "@store/ui/uiStore";

/** True when the OS asks for reduced motion or the user turned it on in settings. */
export function useReduceMotion() {
  const osReduced = useReducedMotion();
  const prefReduced = useUiStore((s) => s.prefs.reduceMotion);
  return osReduced || prefReduced;
}

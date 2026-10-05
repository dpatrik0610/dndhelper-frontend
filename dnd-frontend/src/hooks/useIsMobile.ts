import { useMediaQuery } from "@mantine/hooks";

/**
 * Global hook to determine if the current viewport is mobile sized (<= 768px).
 * Replaces repeated useMediaQuery("(max-width: 768px)") calls.
 * Read on the first render (client-only app), so phones never get one desktop-layout frame first.
 */
export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)", undefined, { getInitialValueInEffect: false }) ?? false;
}

import { useMediaQuery } from "@mantine/hooks";

/**
 * Global hook to determine if the current viewport is mobile sized (<= 768px).
 * Replaces repeated useMediaQuery("(max-width: 768px)") calls.
 */
export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)") ?? false;
}

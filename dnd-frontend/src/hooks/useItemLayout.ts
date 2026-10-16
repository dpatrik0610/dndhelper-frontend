import { useUiStore } from "@store/ui/uiStore";
import { useIsMobile } from "./useIsMobile";

export function useItemLayout(pref: "spellLayout" | "inventoryLayout") {
  const layout = useUiStore((s) => s.prefs[pref]);
  const setPref = useUiStore((s) => s.setPref);
  const isMobile = useIsMobile();

  const resolved: "list" | "cards" = layout === "auto" ? (isMobile ? "list" : "cards") : layout;
  return [resolved, (next: "list" | "cards") => setPref(pref, next)] as const;
}

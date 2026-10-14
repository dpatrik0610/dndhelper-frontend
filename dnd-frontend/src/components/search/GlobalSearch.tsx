import { lazy, Suspense, useEffect } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useSearchStore } from "./searchStore";

// Loads on the first open: the cards it can open (spell, monster, item) are heavy and most visits never search.
const SearchPalette = lazy(() => import("./SearchPalette"));

/**
 * The site-wide search: Ctrl/⌘+K from anywhere (even mid-typing), or / when not in a text field.
 * Mounted once in App for signed-in users.
 */
export function GlobalSearch() {
  const used = useSearchStore((s) => s.used);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { open, setOpen } = useSearchStore.getState();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        return setOpen(!open);
      }
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || open) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      e.preventDefault();
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return used ? (
    <Suspense fallback={null}>
      <SearchPalette />
    </Suspense>
  ) : null;
}

/** Icon button that toggles the search (the tabletop's top bar). */
export function SearchButton() {
  const open = useSearchStore((s) => s.open);
  return (
    <Tooltip label="Search · Ctrl K">
      <ActionIcon
        data-global-search
        variant={open ? "light" : "subtle"}
        color={open ? "violet" : "gray"}
        onClick={() => useSearchStore.getState().setOpen(!open)}
        aria-label="Search"
        aria-pressed={open}
      >
        <IconSearch size={18} />
      </ActionIcon>
    </Tooltip>
  );
}

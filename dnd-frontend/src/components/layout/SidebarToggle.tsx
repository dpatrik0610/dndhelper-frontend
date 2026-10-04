import { useRef, useState, type PointerEvent } from "react";
import { useHotkeys } from "@mantine/hooks";
import { IconChevronRight } from "@tabler/icons-react";
import styles from "./SidebarToggle.module.css";

interface SidebarToggleProps {
  opened: boolean;
  onOpenedChange: (opened: boolean) => void;
}

/** Drawer width (Sidebar.tsx) at the default 16px root font; the tab rides its edge and a drag can pull it at most this far. */
const DRAWER_WIDTH = 280;

/** Mantine sizes the drawer in rem, so its real width follows the root font size (text size setting). */
const drawerWidthPx = () => (DRAWER_WIDTH * parseFloat(getComputedStyle(document.documentElement).fontSize)) / 16;
/** Same distance the mobile swipe needs (App.tsx). */
const DRAG_COMMIT = 50;

/**
 * Pull-tab on the left screen edge, where the sidebar drawer slides in from. Click, Ctrl/⌘+B, or drag it with the mouse:
 * outward to open, back to close. Touch drags are left to App.tsx's swipe handler.
 * Not portaled: its z-index sits between the drawer and Mantine's modals/popovers/notifications.
 */
export function SidebarToggle({ opened, onOpenedChange }: SidebarToggleProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startX = useRef(0);
  const dragged = useRef(false);
  const maxDrag = useRef(DRAWER_WIDTH);

  useHotkeys([["mod+B", () => onOpenedChange(!opened)]]);

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "touch" || e.button !== 0) return;
    startX.current = e.clientX;
    dragged.current = false;
    maxDrag.current = drawerWidthPx();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragX(0);
  };

  const handlePointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (dragX === null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 4) dragged.current = true;
    // Closed: can only be pulled out (right); open: only pushed back (left).
    setDragX(opened ? Math.max(-maxDrag.current, Math.min(0, dx)) : Math.max(0, Math.min(maxDrag.current, dx)));
  };

  const handlePointerUp = () => {
    if (dragX === null) return;
    if (Math.abs(dragX) >= DRAG_COMMIT) onOpenedChange(!opened);
    setDragX(null);
  };

  const label = opened ? "Close navigation" : "Open navigation";

  return (
    <button
      type="button"
      className={styles.tab}
      data-dragging={dragX !== null || undefined}
      style={dragX ? { ["--drag" as string]: `${dragX}px` } : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setDragX(null)}
      onClick={() => {
        // A drag ends with a click on the tab (it follows the pointer); the drag already decided.
        if (dragged.current) dragged.current = false;
        else onOpenedChange(!opened);
      }}
      aria-label={label}
      aria-expanded={opened}
      aria-keyshortcuts="Control+B Meta+B"
      title={`${label} (Ctrl+B, or drag)`}
    >
      <IconChevronRight size={18} stroke={2.4} className={styles.chevron} aria-hidden="true" />
    </button>
  );
}

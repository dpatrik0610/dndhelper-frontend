import { useRef, useState, type PointerEvent } from "react";
import { useHotkeys } from "@mantine/hooks";
import { IconChevronRight } from "@tabler/icons-react";
import styles from "./SidebarToggle.module.css";

interface SidebarToggleProps {
  opened: boolean;
  onOpenedChange: (opened: boolean) => void;
  /** Live drag as a fraction of the drawer width (-1..1), null when it ends; the drawer follows it (Sidebar.tsx). */
  onDrag: (fraction: number | null) => void;
}

/** Drawer width (Sidebar.tsx) at the default 16px root font; the tab rides its edge and a drag can pull it at most this far. */
const DRAWER_WIDTH = 280;

/** Mantine sizes the drawer in rem, so its real width follows the root font size (text size setting). */
const drawerWidthPx = () => (DRAWER_WIDTH * parseFloat(getComputedStyle(document.documentElement).fontSize)) / 16;
/** Same distance the mobile swipe needs (App.tsx). */
const DRAG_COMMIT = 50;

/**
 * Pull-tab on the left screen edge, where the sidebar drawer slides in from. Click, Ctrl/⌘+B, or drag it with the mouse:
 * outward to open, back to close; the drawer moves with it. Touch drags are left to App.tsx's swipe handler.
 * Not portaled: its z-index sits between the drawer and Mantine's modals/popovers/notifications.
 */
export function SidebarToggle({ opened, onOpenedChange, onDrag }: SidebarToggleProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startX = useRef(0);
  const dragged = useRef(false);
  /** The mouse press already toggled (or dragged) on pointerup, so its trailing click must not toggle again. */
  const handled = useRef(false);
  const maxDrag = useRef(DRAWER_WIDTH);

  useHotkeys([["mod+B", () => onOpenedChange(!opened)]]);

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "touch" || e.button !== 0) return;
    startX.current = e.clientX;
    dragged.current = false;
    maxDrag.current = drawerWidthPx();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragX(0);
    onDrag(0);
  };

  const handlePointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (dragX === null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 4) dragged.current = true;
    // Closed: can only be pulled out (right); open: only pushed back (left).
    const x = opened ? Math.max(-maxDrag.current, Math.min(0, dx)) : Math.max(0, Math.min(maxDrag.current, dx));
    setDragX(x);
    onDrag(x / maxDrag.current);
  };

  const endDrag = () => {
    setDragX(null);
    onDrag(null);
  };

  // A plain click toggles here, not in onClick, so it lands in the same render as the drag ending:
  // otherwise the drawer (mounted for the drag) would start closing, then reopen.
  const handlePointerUp = () => {
    if (dragX === null) return;
    handled.current = true;
    if (!dragged.current || Math.abs(dragX) >= DRAG_COMMIT) onOpenedChange(!opened);
    endDrag();
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
      onPointerCancel={endDrag}
      onClick={() => {
        // Keyboard and touch clicks toggle here; mouse presses were handled on pointerup.
        if (handled.current) handled.current = false;
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

import type { AppShellProps } from "@mantine/core";

/** Left-side lane kept free for the sidebar toggle tab on desktop (tab is 32px wide in SidebarToggle.module.css). */
const TOGGLE_LANE = 44;

export function getAppShellStyles(isMobile: boolean, isDashboardRoute: boolean, showToggle: boolean, fullBleed = false): AppShellProps["styles"] {
  const padding = isDashboardRoute || fullBleed ? 0 : (isMobile ? 2 : 10);
  return {
    root: {
      background: "transparent",
      minHeight: "100vh",
    },
    main: {
      position: "relative",
      minHeight: "100vh",
      overflow: "hidden",
      // Admin routes have no site backdrop; the console wall (adminCyber.css / adminDungeon.css) fills main, toggle lane included.
      background: isDashboardRoute ? "var(--cyber-wall)" : "transparent",
      padding,
      paddingLeft: showToggle && !isMobile && !fullBleed ? TOGGLE_LANE : padding,
    },
  };
}

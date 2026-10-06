import type { AppShellProps } from "@mantine/core";

/** Left-side lane kept free for the sidebar toggle tab on desktop (tab is 32px wide in SidebarToggle.module.css). */
const TOGGLE_LANE = 44;

export function getAppShellStyles(isMobile: boolean, isDashboardRoute: boolean, showToggle: boolean): AppShellProps["styles"] {
  const padding = isDashboardRoute ? 0 : (isMobile ? 2 : 10);
  return {
    root: {
      background: "transparent",
      minHeight: "100vh",
    },
    main: {
      position: "relative",
      minHeight: "100vh",
      overflow: "hidden",
      // Admin routes have no backdrop; the toggle lane takes the admin void colour (adminCyber.css).
      background: isDashboardRoute ? "var(--cyber-bg)" : "transparent",
      padding,
      paddingLeft: showToggle && !isMobile ? TOGGLE_LANE : padding,
    },
  };
}

import type { AppShellProps } from "@mantine/core";

export function getAppShellStyles(isMobile: boolean, isDashboardRoute = false): AppShellProps["styles"] {
  return {
    root: {
      background: "transparent",
      minHeight: "100vh",
    },
    main: {
      position: "relative",
      minHeight: "100vh",
      overflow: "hidden",
      background: "transparent",
      padding: isDashboardRoute ? 0 : (isMobile ? 2 : 10),
    },
  };
}

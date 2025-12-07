import type { AppShellProps } from "@mantine/core";

export function getAppShellStyles(isMobile: boolean): AppShellProps["styles"] {
  return {
    root: {
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      minHeight: "100vh",
    },
    main: {
      position: "relative",
      minHeight: "100vh",
      overflow: "hidden",
      background: "transparent",
      padding: isMobile ? 2 : 10,
    },
  };
}

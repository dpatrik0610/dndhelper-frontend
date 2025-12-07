export type SidebarThemeVariant = "midnight" | "emerald" | "sunset";

export interface SidebarThemeTokens {
  background: string;
  border: string;
  borderStrong: string;
  header: string;
  panel: string;
  active: string;
  activeBorder: string;
}

export const sidebarThemes: Record<SidebarThemeVariant, SidebarThemeTokens> = {
  midnight: {
    background: "linear-gradient(160deg, rgba(23, 20, 45, 0.88), rgba(12, 9, 30, 0.82))",
    border: "rgba(255, 255, 255, 0.06)",
    borderStrong: "rgba(255, 255, 255, 0.12)",
    header: "linear-gradient(135deg, rgba(103, 65, 217, 0.35), rgba(29, 110, 180, 0.3))",
    panel: "rgba(255, 255, 255, 0.03)",
    active: "linear-gradient(135deg, #6a4cff, #53d8ff)",
    activeBorder: "rgba(255, 255, 255, 0.2)",
  },
  emerald: {
    background: "linear-gradient(170deg, rgba(8, 34, 28, 0.9), rgba(5, 19, 21, 0.85))",
    border: "rgba(135, 250, 214, 0.12)",
    borderStrong: "rgba(135, 250, 214, 0.22)",
    header: "linear-gradient(135deg, rgba(31, 138, 112, 0.4), rgba(19, 87, 94, 0.4))",
    panel: "rgba(12, 44, 38, 0.4)",
    active: "linear-gradient(135deg, #2fd2a8, #15a085)",
    activeBorder: "rgba(135, 250, 214, 0.35)",
  },
  sunset: {
    background: "linear-gradient(160deg, rgba(47, 16, 28, 0.92), rgba(18, 10, 22, 0.82))",
    border: "rgba(255, 179, 145, 0.12)",
    borderStrong: "rgba(255, 179, 145, 0.2)",
    header: "linear-gradient(135deg, rgba(255, 94, 98, 0.35), rgba(255, 174, 94, 0.3))",
    panel: "rgba(255, 255, 255, 0.04)",
    active: "linear-gradient(135deg, #ff6e72, #ffb36c)",
    activeBorder: "rgba(255, 179, 145, 0.3)",
  },
};

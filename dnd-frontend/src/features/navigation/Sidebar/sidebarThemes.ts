export type SidebarThemeVariant = "midnight" | "sunset" | "crimson-vampire" | "frost-glacier";

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
  sunset: {
    background: "linear-gradient(160deg, rgba(20, 20, 20, 0.92), rgba(10, 10, 10, 0.85))",
    border: "rgba(255, 179, 145, 0.08)",
    borderStrong: "rgba(255, 179, 145, 0.16)",
    header: "linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(16, 185, 129, 0.2))",
    panel: "rgba(255, 255, 255, 0.02)",
    active: "linear-gradient(135deg, #f59e0b, #10b981)",
    activeBorder: "rgba(245, 158, 11, 0.3)",
  },
  "crimson-vampire": {
    background: "linear-gradient(160deg, rgba(30, 8, 8, 0.92), rgba(14, 4, 4, 0.85))",
    border: "rgba(239, 68, 68, 0.08)",
    borderStrong: "rgba(239, 68, 68, 0.16)",
    header: "linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(217, 119, 6, 0.2))",
    panel: "rgba(255, 255, 255, 0.02)",
    active: "linear-gradient(135deg, #ef4444, #d97706)",
    activeBorder: "rgba(239, 68, 68, 0.3)",
  },
  "frost-glacier": {
    background: "linear-gradient(160deg, rgba(8, 18, 30, 0.92), rgba(4, 9, 16, 0.85))",
    border: "rgba(56, 189, 248, 0.08)",
    borderStrong: "rgba(56, 189, 248, 0.16)",
    header: "linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(203, 213, 225, 0.2))",
    panel: "rgba(255, 255, 255, 0.02)",
    active: "linear-gradient(135deg, #38bdf8, #cbd5e1)",
    activeBorder: "rgba(56, 189, 248, 0.3)",
  },
};

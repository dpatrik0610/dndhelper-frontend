export type SidebarThemeVariant = "midnight" | "sunset" | "crimson-vampire" | "frost-glacier" | "feywild" | "toxic" | "void" | "steampunk" | "deep-ocean" | "darkvision" | "cyberpunk";

/** Display data for theme pickers (settings page, sidebar theme bubble). Order = display order. */
export interface ThemeOption {
  key: SidebarThemeVariant;
  name: string;
  icon: string;
  accent: string;
  accentSecondary: string;
  glow: string;
}

export const themeOptions: ThemeOption[] = [
  { key: "midnight", name: "Midnight", icon: "🌌", accent: "#a855f7", accentSecondary: "#06b6d4", glow: "0 0 15px rgba(168, 85, 247, 0.3)" },
  { key: "sunset", name: "Cyber-Fantasy", icon: "💛", accent: "#f59e0b", accentSecondary: "#10b981", glow: "0 0 15px rgba(245, 158, 11, 0.25)" },
  { key: "crimson-vampire", name: "Crimson Dynasty", icon: "🗡️", accent: "#ef4444", accentSecondary: "#d97706", glow: "0 0 15px rgba(239, 68, 68, 0.3)" },
  { key: "frost-glacier", name: "Frost Glacier", icon: "❄️", accent: "#7dd3fc", accentSecondary: "#5eead4", glow: "0 0 15px rgba(125, 211, 252, 0.4)" },
  { key: "feywild", name: "Feywild Bloom", icon: "🌸", accent: "#f472b6", accentSecondary: "#fbbf24", glow: "0 0 15px rgba(244, 114, 182, 0.25)" },
  { key: "toxic", name: "Toxic Spore", icon: "☣️", accent: "#22c55e", accentSecondary: "#facc15", glow: "0 0 15px rgba(34, 197, 94, 0.25)" },
  { key: "void", name: "Eldritch Void", icon: "👁️", accent: "#d946ef", accentSecondary: "#6366f1", glow: "0 0 15px rgba(217, 70, 239, 0.25)" },
  { key: "steampunk", name: "Clockwork Brass", icon: "⚙️", accent: "#ea580c", accentSecondary: "#0d9488", glow: "0 0 15px rgba(234, 88, 12, 0.25)" },
  { key: "deep-ocean", name: "Deep Ocean", icon: "🌊", accent: "#0284c7", accentSecondary: "#0d9488", glow: "0 0 15px rgba(2, 132, 199, 0.25)" },
  { key: "darkvision", name: "Darkvision", icon: "🕶️", accent: "#ffffff", accentSecondary: "#9ca3af", glow: "0 0 15px rgba(255, 255, 255, 0.25)" },
  { key: "cyberpunk", name: "Cyberpunk", icon: "🌃", accent: "#fcee0a", accentSecondary: "#00f0ff", glow: "0 0 15px rgba(252, 238, 10, 0.45)" },
];

export const getThemeOption = (key: SidebarThemeVariant): ThemeOption =>
  themeOptions.find((t) => t.key === key) ?? themeOptions[1];

export interface SidebarThemeTokens {
  background: string;
  border: string;
  borderStrong: string;
  header: string;
  panel: string;
  active: string;
  activeBorder: string;
  activeText: string;
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
    activeText: "#ffffff",
  },
  sunset: {
    background: "linear-gradient(160deg, rgba(20, 20, 20, 0.92), rgba(10, 10, 10, 0.85))",
    border: "rgba(255, 179, 145, 0.08)",
    borderStrong: "rgba(255, 179, 145, 0.16)",
    header: "linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(16, 185, 129, 0.2))",
    panel: "rgba(255, 255, 255, 0.02)",
    active: "linear-gradient(135deg, #f59e0b, #10b981)",
    activeBorder: "rgba(245, 158, 11, 0.3)",
    activeText: "#121214",
  },
  "crimson-vampire": {
    background: "linear-gradient(160deg, rgba(30, 8, 8, 0.92), rgba(14, 4, 4, 0.85))",
    border: "rgba(239, 68, 68, 0.08)",
    borderStrong: "rgba(239, 68, 68, 0.16)",
    header: "linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(217, 119, 6, 0.2))",
    panel: "rgba(255, 255, 255, 0.02)",
    active: "linear-gradient(135deg, #ef4444, #d97706)",
    activeBorder: "rgba(239, 68, 68, 0.3)",
    activeText: "#ffffff",
  },
  "frost-glacier": {
    background: "linear-gradient(170deg, rgba(10, 30, 56, 0.94), rgba(3, 10, 22, 0.9))",
    border: "rgba(186, 230, 253, 0.1)",
    borderStrong: "rgba(186, 230, 253, 0.22)",
    header: "linear-gradient(135deg, rgba(125, 211, 252, 0.28), rgba(94, 234, 212, 0.18), rgba(167, 139, 250, 0.16))",
    panel: "rgba(186, 230, 253, 0.03)",
    active: "linear-gradient(135deg, #e0f2fe, #7dd3fc 55%, #5eead4)",
    activeBorder: "rgba(224, 242, 254, 0.45)",
    activeText: "#04182e",
  },
  feywild: {
    background: "linear-gradient(160deg, rgba(40, 15, 35, 0.92), rgba(18, 6, 16, 0.85))",
    border: "rgba(244, 114, 182, 0.08)",
    borderStrong: "rgba(244, 114, 182, 0.16)",
    header: "linear-gradient(135deg, rgba(244, 114, 182, 0.25), rgba(251, 191, 36, 0.2))",
    panel: "rgba(255, 255, 255, 0.02)",
    active: "linear-gradient(135deg, #f472b6, #fbbf24)",
    activeBorder: "rgba(244, 114, 182, 0.3)",
    activeText: "#291022",
  },
  toxic: {
    background: "linear-gradient(160deg, rgba(8, 24, 12, 0.92), rgba(4, 12, 6, 0.85))",
    border: "rgba(34, 197, 94, 0.08)",
    borderStrong: "rgba(34, 197, 94, 0.16)",
    header: "linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(250, 204, 21, 0.2))",
    panel: "rgba(255, 255, 255, 0.02)",
    active: "linear-gradient(135deg, #22c55e, #facc15)",
    activeBorder: "rgba(34, 197, 94, 0.3)",
    activeText: "#06140b",
  },
  void: {
    background: "linear-gradient(160deg, rgba(8, 5, 24, 0.92), rgba(4, 2, 12, 0.85))",
    border: "rgba(217, 70, 239, 0.08)",
    borderStrong: "rgba(217, 70, 239, 0.16)",
    header: "linear-gradient(135deg, rgba(217, 70, 239, 0.25), rgba(99, 102, 241, 0.2))",
    panel: "rgba(255, 255, 255, 0.02)",
    active: "linear-gradient(135deg, #d946ef, #6366f1)",
    activeBorder: "rgba(217, 70, 239, 0.3)",
    activeText: "#ffffff",
  },
  steampunk: {
    background: "linear-gradient(160deg, rgba(24, 25, 28, 0.92), rgba(12, 13, 14, 0.85))",
    border: "rgba(234, 88, 12, 0.08)",
    borderStrong: "rgba(234, 88, 12, 0.16)",
    header: "linear-gradient(135deg, rgba(234, 88, 12, 0.25), rgba(13, 148, 136, 0.2))",
    panel: "rgba(255, 255, 255, 0.02)",
    active: "linear-gradient(135deg, #ea580c, #0d9488)",
    activeBorder: "rgba(234, 88, 12, 0.3)",
    activeText: "#141518",
  },
  "deep-ocean": {
    background: "linear-gradient(160deg, rgba(2, 8, 28, 0.94), rgba(1, 3, 12, 0.90))",
    border: "rgba(2, 132, 199, 0.08)",
    borderStrong: "rgba(2, 132, 199, 0.16)",
    header: "linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(13, 148, 136, 0.2))",
    panel: "rgba(255, 255, 255, 0.02)",
    active: "linear-gradient(135deg, #0284c7, #0d9488)",
    activeBorder: "rgba(2, 132, 199, 0.3)",
    activeText: "#ffffff",
  },
  darkvision: {
    background: "linear-gradient(160deg, rgba(10, 10, 10, 0.95), rgba(3, 3, 3, 0.90))",
    border: "rgba(255, 255, 255, 0.08)",
    borderStrong: "rgba(255, 255, 255, 0.16)",
    header: "linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(156, 163, 175, 0.1))",
    panel: "rgba(255, 255, 255, 0.01)",
    active: "linear-gradient(135deg, #ffffff, #9ca3af)",
    activeBorder: "rgba(255, 255, 255, 0.25)",
    activeText: "rgba(0, 0, 0, 0.9)",
  },
  cyberpunk: {
    background: "linear-gradient(160deg, rgba(8, 6, 14, 0.96), rgba(3, 2, 8, 0.92))",
    border: "rgba(0, 240, 255, 0.14)",
    borderStrong: "rgba(252, 238, 10, 0.35)",
    header: "linear-gradient(135deg, rgba(252, 238, 10, 0.22), rgba(255, 0, 60, 0.18))",
    panel: "rgba(0, 240, 255, 0.03)",
    active: "linear-gradient(135deg, #fcee0a, #f5d300)",
    activeBorder: "rgba(0, 240, 255, 0.7)",
    activeText: "#0a0a0f",
  },
};

/**
 * Returns the corresponding theme class name for a given theme variant.
 */
export function getActiveThemeClass(theme: SidebarThemeVariant): string {
  switch (theme) {
    case "midnight":
      return "theme-midnight-arcane";
    case "crimson-vampire":
      return "theme-crimson-vampire";
    case "frost-glacier":
      return "theme-frost-glacier";
    case "feywild":
      return "theme-feywild-bloom";
    case "toxic":
      return "theme-toxic-spore";
    case "void":
      return "theme-eldritch-void";
    case "steampunk":
      return "theme-clockwork-brass";
    case "deep-ocean":
      return "theme-deep-ocean";
    case "darkvision":
      return "theme-darkvision";
    case "cyberpunk":
      return "theme-cyberpunk";
    case "sunset":
    default:
      return "theme-cyber-noir";
  }
}
export type SidebarThemeVariant = "midnight" | "sunset" | "crimson-vampire" | "frost-glacier" | "feywild" | "toxic" | "void" | "steampunk" | "deep-ocean" | "darkvision" | "cyberpunk" | "art-deco" | "scorching-desert" | "wizards-library";

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
  { key: "sunset", name: "Cyber-Fantasy", icon: "💛", accent: "#fbbf24", accentSecondary: "#34d399", glow: "0 0 15px rgba(251, 191, 36, 0.28)" },
  { key: "crimson-vampire", name: "Crimson Dynasty", icon: "🗡️", accent: "#ef4444", accentSecondary: "#d97706", glow: "0 0 15px rgba(239, 68, 68, 0.3)" },
  { key: "frost-glacier", name: "Frost Glacier", icon: "❄️", accent: "#7dd3fc", accentSecondary: "#5eead4", glow: "0 0 15px rgba(125, 211, 252, 0.4)" },
  { key: "feywild", name: "Feywild Bloom", icon: "🌸", accent: "#f472b6", accentSecondary: "#fbbf24", glow: "0 0 15px rgba(244, 114, 182, 0.25)" },
  { key: "toxic", name: "Toxic Spore", icon: "☣️", accent: "#22c55e", accentSecondary: "#facc15", glow: "0 0 15px rgba(34, 197, 94, 0.25)" },
  { key: "void", name: "Eldritch Void", icon: "👁️", accent: "#d946ef", accentSecondary: "#6366f1", glow: "0 0 15px rgba(217, 70, 239, 0.25)" },
  { key: "steampunk", name: "Clockwork Brass", icon: "⚙️", accent: "#c9a24a", accentSecondary: "#56a08c", glow: "0 0 15px rgba(201, 162, 74, 0.25)" },
  { key: "deep-ocean", name: "Deep Ocean", icon: "🌊", accent: "#0284c7", accentSecondary: "#0d9488", glow: "0 0 15px rgba(2, 132, 199, 0.25)" },
  { key: "darkvision", name: "Darkvision", icon: "🕶️", accent: "#ffffff", accentSecondary: "#9ca3af", glow: "0 0 15px rgba(255, 255, 255, 0.25)" },
  { key: "cyberpunk", name: "Cyberpunk", icon: "🌃", accent: "#fcee0a", accentSecondary: "#00f0ff", glow: "0 0 15px rgba(252, 238, 10, 0.45)" },
  { key: "art-deco", name: "Art Deco", icon: "🍸", accent: "#d4af37", accentSecondary: "#3aa58f", glow: "0 0 15px rgba(212, 175, 55, 0.3)" },
  { key: "scorching-desert", name: "Scorching Desert", icon: "🏜️", accent: "#ff7a1a", accentSecondary: "#40c2c9", glow: "0 0 15px rgba(255, 122, 26, 0.35)" },
  { key: "wizards-library", name: "Wizard's Library", icon: "📚", accent: "#e0b35a", accentSecondary: "#d2414a", glow: "0 0 15px rgba(224, 179, 90, 0.3)" },
];

export const getThemeOption = (key: SidebarThemeVariant): ThemeOption =>
  themeOptions.find((t) => t.key === key) ?? themeOptions[1];

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
    case "art-deco":
      return "theme-art-deco";
    case "scorching-desert":
      return "theme-scorching-desert";
    case "wizards-library":
      return "theme-wizards-library";
    case "sunset":
    default:
      return "theme-cyber-noir";
  }
}
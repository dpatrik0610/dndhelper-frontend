import { Box } from "@mantine/core";
import { useUiStore } from "@store/ui/uiStore";
import { type SidebarThemeVariant } from "@appTypes/ThemeTypes";

interface MagicThemeSelectorProps {
  variant?: "floating" | "inline";
}

export function MagicThemeSelector({ variant = "inline" }: MagicThemeSelectorProps) {
  const { sidebarTheme, setSidebarTheme } = useUiStore();

  const containerClass = variant === "floating" ? "runes-theme-switcher" : "runes-theme-switcher-inline";

  const themesList: Array<{ key: SidebarThemeVariant; icon: string; accent: string; glow: string }> = [
    {
      key: "midnight",
      icon: "🌌",
      accent: "#7c3aed",
      glow: "0 0 10px rgba(124, 58, 237, 0.4)",
    },
    {
      key: "sunset",
      icon: "💛",
      accent: "#f59e0b",
      glow: "0 0 10px rgba(245, 158, 11, 0.4)",
    },
    {
      key: "crimson-vampire",
      icon: "🩸",
      accent: "#ef4444",
      glow: "0 0 10px rgba(239, 68, 68, 0.4)",
    },
    {
      key: "frost-glacier",
      icon: "❄️",
      accent: "#38bdf8",
      glow: "0 0 10px rgba(56, 189, 248, 0.4)",
    },
    {
      key: "feywild",
      icon: "🌸",
      accent: "#f472b6",
      glow: "0 0 10px rgba(244, 114, 182, 0.4)",
    },
    {
      key: "toxic",
      icon: "🧪",
      accent: "#22c55e",
      glow: "0 0 10px rgba(34, 197, 94, 0.4)",
    },
    {
      key: "void",
      icon: "👁️",
      accent: "#d946ef",
      glow: "0 0 10px rgba(217, 70, 239, 0.4)",
    },
    {
      key: "steampunk",
      icon: "⚙️",
      accent: "#ea580c",
      glow: "0 0 10px rgba(234, 88, 12, 0.4)",
    },
    {
      key: "deep-ocean",
      icon: "🌊",
      accent: "#0284c7",
      glow: "0 0 10px rgba(2, 132, 199, 0.4)",
    },
    {
      key: "darkvision",
      icon: "🕶️",
      accent: "#ffffff",
      glow: "0 0 10px rgba(255, 255, 255, 0.4)",
    },
  ];

  return (
    <Box className={containerClass}>
      {themesList.map((t) => (
        <Box
          key={t.key}
          onClick={() => setSidebarTheme(t.key)}
          className={`magic-rune-button ${sidebarTheme === t.key ? "active" : ""}`}
          style={{
            "--theme-color-accent-primary": t.accent,
            "--theme-glow-shadow-primary": t.glow,
          } as React.CSSProperties}
        >
          {t.icon}
        </Box>
      ))}
    </Box>
  );
}
export default MagicThemeSelector;

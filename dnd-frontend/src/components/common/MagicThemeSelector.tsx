import { Box } from "@mantine/core";
import { useUiStore } from "@store/ui/uiStore";
import { type SidebarThemeVariant } from "@features/navigation/Sidebar/sidebarThemes";

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

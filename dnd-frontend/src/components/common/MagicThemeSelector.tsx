import { Tooltip } from "@mantine/core";
import { useUiStore } from "@store/ui/uiStore";
import { themeOptions } from "@appTypes/ThemeTypes";

export function MagicThemeSelector() {
  const { sidebarTheme, setSidebarTheme } = useUiStore();

  return (
    <div className="runes-theme-switcher-inline" role="radiogroup" aria-label="Theme">
      {themeOptions.map((t) => (
        <Tooltip key={t.key} label={t.name} withArrow openDelay={300} events={{ hover: true, focus: true, touch: false }}>
          <button
            type="button"
            role="radio"
            aria-checked={sidebarTheme === t.key}
            aria-label={t.name}
            onClick={() => setSidebarTheme(t.key)}
            className={`magic-rune-button ${sidebarTheme === t.key ? "active" : ""}`}
            style={{
              "--theme-color-accent-primary": t.accent,
              "--theme-glow-shadow-primary": t.glow,
            } as React.CSSProperties}
          >
            {t.icon}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
export default MagicThemeSelector;

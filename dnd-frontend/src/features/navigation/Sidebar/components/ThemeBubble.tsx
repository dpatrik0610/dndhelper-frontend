import { useState } from "react";
import { Collapse, UnstyledButton } from "@mantine/core";
import { IconChevronUp } from "@tabler/icons-react";
import { MagicThemeSelector } from "@components/common/MagicThemeSelector";
import { useUiStore } from "@store/ui/uiStore";
import { getThemeOption } from "@appTypes/ThemeTypes";
import classes from "@features/navigation/Sidebar/Sidebar.module.css";

/** Round bubble showing the active theme's icon; expands into the theme selector. */
export function ThemeBubble() {
  const [open, setOpen] = useState(false);
  const theme = getThemeOption(useUiStore((s) => s.sidebarTheme));

  return (
    <div className={classes.themeBubble} data-open={open || undefined}>
      <Collapse in={open} transitionDuration={250}>
        <div className={classes.themeBubblePanel} id="theme-bubble-panel">
          <MagicThemeSelector />
        </div>
      </Collapse>

      <UnstyledButton
        className={classes.themeBubbleToggle}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="theme-bubble-panel"
        aria-label={open ? "Close theme selector" : `Theme: ${theme.name}. Change theme`}
      >
        <span className={classes.themeBubbleIcon} aria-hidden>
          {theme.icon}
        </span>
        <span className={classes.themeBubbleName}>{theme.name}</span>
        <IconChevronUp size={14} className={classes.themeBubbleChevron} aria-hidden />
      </UnstyledButton>
    </div>
  );
}

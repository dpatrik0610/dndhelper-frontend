import { useState, type CSSProperties } from "react";
import { Tooltip } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import classes from "./EffectSigil.module.css";

interface EffectSigilProps {
  Icon: Icon;
  /** Mantine color name of the effect's source. */
  color: string;
  name: string;
  active: boolean;
  /** Left out for effects that can't be switched here (conditions). */
  onToggle?: (active: boolean) => void;
}

/** The effect's source icon, which is also its on/off switch. */
export function EffectSigil({ Icon, color, name, active, onToggle }: EffectSigilProps) {
  const [bursts, setBursts] = useState(0);
  const style = { "--sigil": `var(--mantine-color-${color}-5)` } as CSSProperties;

  if (!onToggle) {
    return (
      <span className={`${classes.sigil} ${classes.static}`} data-active="true" style={style} aria-hidden>
        <Icon size={18} />
      </span>
    );
  }

  return (
    <Tooltip label={active ? `${name} is on. Click to turn it off.` : `${name} is off. Click to turn it on.`} withArrow openDelay={300}>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label={`${name} active`}
        className={classes.sigil}
        data-active={active}
        style={style}
        onClick={() => {
          if (!active) setBursts((n) => n + 1);
          onToggle(!active);
        }}
      >
        <Icon size={18} />
        {bursts > 0 && <span key={bursts} className={classes.burst} aria-hidden />}
      </button>
    </Tooltip>
  );
}

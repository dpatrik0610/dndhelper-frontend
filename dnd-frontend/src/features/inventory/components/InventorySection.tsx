import { useId, useState, type ReactNode } from "react";
import { Collapse } from "@mantine/core";
import { Tooltip } from "@mantine/core";
import { IconBackpack, IconChevronDown, IconShirt } from "@tabler/icons-react";
import type { Currency } from "@appTypes/Currency";
import classes from "./InventorySection.module.css";
import { coinInfo, sortCurrencies } from "@utils/currency";

interface InventorySectionProps {
  title: string;
  itemCount: number;
  totalWeight: number;
  currencies: Currency[];
  matchCount: number;
  hasFilters: boolean;
  /** This character wears what is in here, so its items apply their effects. */
  worn: boolean;
  /** Left out to hide the toggle (another inventory is already worn). */
  onToggleWorn?: () => void;
  children: ReactNode;
}

/** Collapsible inventory with a summary in the header, so it can be judged without opening it. */
export function InventorySection({
  title,
  itemCount,
  totalWeight,
  currencies,
  matchCount,
  hasFilters,
  worn,
  onToggleWorn,
  children,
}: InventorySectionProps) {
  const [userOpened, setUserOpened] = useState(false);
  const bodyId = useId();
  const highlighted = hasFilters && matchCount > 0;
  // A search opens every inventory with matches; clearing it restores the user's choice.
  const opened = highlighted || userOpened;
  const money = currencies.filter((c) => c.amount > 0);

  return (
    <section
      className={classes.section}
      data-open={opened || undefined}
      data-highlighted={highlighted || undefined}
      data-worn={worn || undefined}
    >
      <div className={classes.headerRow}>
      <button
        type="button"
        className={classes.header}
        onClick={() => setUserOpened(!opened)}
        aria-expanded={opened}
        aria-controls={bodyId}
      >
        <span className={classes.avatar}>
          {worn ? <IconShirt size={18} stroke={1.75} /> : <IconBackpack size={18} stroke={1.75} />}
        </span>

        <span className={classes.titleBlock}>
          <span className={classes.title}>{title}</span>
          <span className={classes.meta}>
            {hasFilters ? (
              <span className={matchCount ? classes.match : classes.noMatch}>
                {matchCount ? `${matchCount} match${matchCount === 1 ? "" : "es"}` : "No matches"}
              </span>
            ) : (
              <span>
                {itemCount} item{itemCount === 1 ? "" : "s"}
                {totalWeight > 0 && ` · ${Math.round(totalWeight * 10) / 10} lb`}
              </span>
            )}
            {sortCurrencies(money).map((c) => (
              <span key={c.type} className={classes.coin}>
                {c.amount} {coinInfo(c.type).label}
              </span>
            ))}
          </span>
        </span>
      </button>

      {onToggleWorn && (
        <Tooltip
          label={worn ? "Worn: its items apply their effects. Click to stop wearing it." : "Wear this inventory: its items apply their effects."}
          withArrow
          multiline
          w={240}
        >
          <button type="button" className={classes.wear} aria-pressed={worn} onClick={onToggleWorn}>
            <IconShirt size={14} />
            {worn ? "Worn" : "Wear"}
          </button>
        </Tooltip>
      )}

      {/* Outside the header button so the wear toggle can sit before it; keyboard users open via the header. */}
      <span className={classes.chevron} onClick={() => setUserOpened(!opened)} aria-hidden>
        <IconChevronDown size={18} />
      </span>
      </div>

      <Collapse in={opened} transitionDuration={200}>
        <div id={bodyId} className={classes.body}>
          {children}
        </div>
      </Collapse>
    </section>
  );
}

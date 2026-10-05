import { useId, useState, type ReactNode } from "react";
import { Collapse } from "@mantine/core";
import { IconBackpack, IconChevronDown } from "@tabler/icons-react";
import type { Currency } from "@appTypes/Currency";
import classes from "./InventorySection.module.css";

interface InventorySectionProps {
  title: string;
  itemCount: number;
  totalWeight: number;
  currencies: Currency[];
  matchCount: number;
  hasFilters: boolean;
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
  children,
}: InventorySectionProps) {
  const [userOpened, setUserOpened] = useState(false);
  const bodyId = useId();
  const highlighted = hasFilters && matchCount > 0;
  // A search opens every inventory with matches; clearing it restores the user's choice.
  const opened = highlighted || userOpened;
  const money = currencies.filter((c) => c.amount > 0);

  return (
    <section className={classes.section} data-open={opened || undefined} data-highlighted={highlighted || undefined}>
      <button
        type="button"
        className={classes.header}
        onClick={() => setUserOpened(!opened)}
        aria-expanded={opened}
        aria-controls={bodyId}
      >
        <span className={classes.avatar}>
          <IconBackpack size={18} stroke={1.75} />
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
            {money.map((c) => (
              <span key={c.currencyCode} className={classes.coin}>
                {c.amount} {c.currencyCode}
              </span>
            ))}
          </span>
        </span>

        <span className={classes.chevron}>
          <IconChevronDown size={18} />
        </span>
      </button>

      <Collapse in={opened} transitionDuration={200}>
        <div id={bodyId} className={classes.body}>
          {children}
        </div>
      </Collapse>
    </section>
  );
}

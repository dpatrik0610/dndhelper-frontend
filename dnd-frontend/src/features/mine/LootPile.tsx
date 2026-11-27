import { useState } from "react";
import type { MiningConfig, OreCounts } from "@services/miningService";
import { PanelHead } from "./CampMenus";
import { compact, fillUpTo, total } from "./mine";
import { oreIcon } from "./render";
import { Sprite } from "./Sprite";
import styles from "./Mine.module.css";

export function LootPile({
  config,
  pile,
  carried,
  capacity,
  maxCarry,
  onTake,
  onClose,
}: {
  config: MiningConfig;
  pile: OreCounts;
  carried: number;
  capacity: number;
  maxCarry: number;
  onTake: (take: OreCounts) => Promise<void>;
  onClose: () => void;
}) {
  const order = config.ores.map((o) => o.key).reverse();
  const fits = () => fillUpTo(pile, order, capacity - carried);
  const [take, setTake] = useState<OreCounts>(fits);
  const [busy, setBusy] = useState(false);
  const after = carried + total(take);
  const over = after > maxCarry;
  const heavy = after > capacity;
  const keys = order.filter((k) => (pile[k] ?? 0) > 0);

  const submit = async () => {
    setBusy(true);
    try {
      await onTake(take);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.hudPanel} aria-label="Loot pile">
      <PanelHead title="Loot that didn't fit" onClose={onClose} />
      <span className={styles.dim}>
        Your satchel was nearly full, so this was set aside. Take as much as you like; whatever you leave is gone when you ride up.
      </span>
      {keys.map((key) => {
        const i = config.ores.findIndex((o) => o.key === key);
        const have = pile[key] ?? 0;
        const n = take[key] ?? 0;
        return (
          <label key={key} className={styles.pileRow}>
            <Sprite grid={oreIcon(i)} scale={1} />
            <span className={styles.pileName}>{config.ores[i]?.name ?? key}</span>
            <input
              type="range"
              min={0}
              max={have}
              value={n}
              className={styles.pileRange}
              aria-label={`Take ${config.ores[i]?.name ?? key}`}
              onChange={(e) => setTake({ ...take, [key]: Number(e.currentTarget.value) })}
            />
            <span className={styles.pileCount}>
              {compact(n)} / {compact(have)}
            </span>
          </label>
        );
      })}
      <span className={over ? styles.pileOver : heavy ? styles.encumbered : styles.dim}>
        Satchel after: {compact(after)} / {compact(capacity)}
        {over ? ` · more than you can carry (${compact(maxCarry)})` : heavy ? " · Encumbered" : ""}
      </span>
      <div className={styles.btnRow}>
        <button type="button" className={`glass-btn-secondary ${styles.actBtn}`} disabled={busy} onClick={() => setTake(fits())}>
          What fits
        </button>
        <button
          type="button"
          className={`glass-btn-secondary ${styles.actBtn}`}
          disabled={busy}
          onClick={() => setTake(fillUpTo(pile, order, maxCarry - carried))}
        >
          All I can carry
        </button>
      </div>
      <div className={styles.btnRow}>
        <button
          type="button"
          className={`glass-btn-primary ${styles.actBtn}`}
          disabled={busy || over || total(take) === 0}
          onClick={() => void submit()}
        >
          Take {compact(total(take))}
        </button>
        <button type="button" className={`glass-btn-secondary ${styles.actBtn}`} disabled={busy} onClick={onClose}>
          Leave it
        </button>
      </div>
    </section>
  );
}

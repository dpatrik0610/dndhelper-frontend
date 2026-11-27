import type { MiningConfig, MiningState } from "@services/miningService";
import { item, itemName, SETS } from "./art/gear";
import { PanelHead } from "./CampMenus";
import { characterSheet, compact, critHit, setProgress, tiersOf } from "./mine";
import { Sprite } from "./Sprite";
import styles from "./Mine.module.css";

export function CharacterPanel({
  config,
  state,
  onClose,
}: {
  config: MiningConfig;
  state: MiningState;
  onClose: () => void;
}) {
  const s = state.stats;
  const tiers = tiersOf(state);
  const fight = [
    ["Hit", compact(s.power)],
    ["Crit hit", compact(critHit(s))],
    ["Damage taken", s.armor ? `${Math.round((1 - s.armor) * 100)}%` : "100%"],
    ["Most you can haul", `${compact(Math.floor(s.capacity * config.overload))} (slow past ${compact(s.capacity)})`],
  ];

  return (
    <section className={`${styles.hudPanel} ${styles.trophyPanel}`} aria-label="Character">
      <PanelHead title="Character" onClose={onClose} />
      {characterSheet(s).map(({ slot, rows, perks }) => (
        <div key={slot} className={styles.charSlot}>
          <div className={styles.charHead}>
            <Sprite grid={item(slot, tiers[slot])} scale={2} label={itemName(slot, tiers[slot])} />
            <b>{itemName(slot, tiers[slot])}</b>
            <span className={styles.dim}>tier {tiers[slot]}</span>
          </div>
          <dl className={styles.charStats}>
            {rows.map((r) => (
              <div key={r.label}>
                <dt>{r.label}</dt>
                <dd>{r.value}</dd>
              </div>
            ))}
          </dl>
          {perks.map((p) => (
            <span key={p} className={styles.petMeta}>
              {p}
            </span>
          ))}
        </div>
      ))}

      <span className={styles.eyebrow}>In a fight</span>
      <dl className={styles.charStats}>
        {fight.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <span className={styles.eyebrow}>Armor sets</span>
      <span className={styles.dim}>Wear all five pieces of one tier for its bonus.</span>
      <ul className={styles.setList}>
        {setProgress(tiers).map((row) => (
          <li key={row.tier} className={`${styles.setRow} ${row.have === 5 ? styles.setActive : ""}`}>
            <Sprite grid={item("helm", row.tier)} scale={2} label={SETS[row.tier].name} />
            <div className={styles.setBody}>
              <b>{row.name}</b>
              <span className={styles.dim}>
                {SETS[row.tier].name} · tier {row.tier}
              </span>
              <span className={styles.setDoes}>{row.does}</span>
            </div>
            <span className={styles.setPips} role="img" aria-label={`${row.have} of 5 pieces`}>
              {[0, 1, 2, 3, 4].map((k) => (
                <i key={k} className={k < row.have ? styles.pipOn : undefined} />
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

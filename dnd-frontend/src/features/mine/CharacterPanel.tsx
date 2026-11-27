import type { MiningConfig, MiningState } from "@services/miningService";
import { item, itemName, SETS } from "./art/gear";
import { PanelHead } from "./CampMenus";
import { characterSheet, compact, critHit, DASH_PERKS, dashHit, SET_BONUSES, tiersOf } from "./mine";
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
  const set = s.setBonus;
  const fight = [
    ["Hit", compact(s.power)],
    ["Crit hit", compact(critHit(s))],
    ["Dash strike", compact(dashHit(s))],
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

      {set > 0 && (
        <>
          <span className={styles.eyebrow}>Armor set</span>
          <div className={`${styles.setRow} ${styles.setActive}`}>
            <Sprite grid={item("helm", set)} scale={2} label={SETS[set].name} />
            <div className={styles.setBody}>
              <b>{SET_BONUSES[set][0]}</b>
              <span className={styles.dim}>
                {SETS[set].name} · tier {set}
              </span>
              <span className={styles.setDoes}>{SET_BONUSES[set][1]}</span>
              <span className={styles.setDoes}>{DASH_PERKS[set]}</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

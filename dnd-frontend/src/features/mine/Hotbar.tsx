import type { ReactNode, RefObject } from "react";
import { Tooltip } from "@mantine/core";
import type { MiningConfig, MiningState } from "@services/miningService";
import { GEAR_SLOTS, item, itemName } from "./art/gear";
import { PET_ART, petSprite } from "./art/pets";
import { type Grid, tint } from "./art/pixel";
import { potionSprite, scrollSprite } from "./art/world";
import { SET_BONUSES, statLine, tiersOf } from "./mine";
import { TORCH } from "./render";
import { Sprite } from "./Sprite";
import styles from "./Mine.module.css";

const ghost = (grid: Grid) => tint(grid, "#000000");

function Square({
  grid,
  empty,
  hotkey,
  count,
  tip,
  label,
  className,
  children,
}: {
  grid: Grid;
  empty?: boolean;
  hotkey?: string;
  count?: string;
  tip: ReactNode;
  label: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.hotCell}>
      <kbd className={styles.hotKey} data-empty={!hotkey || undefined}>
        {hotkey ?? "·"}
      </kbd>
      <Tooltip multiline w={240} withArrow position="top" label={tip}>
        <button
          type="button"
          className={`${styles.hotSlot} ${empty ? styles.hotEmpty : ""} ${className ?? ""}`}
          aria-label={label}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Sprite grid={empty ? ghost(grid) : grid} scale={2} />
          {count && <span className={styles.hotCount}>{count}</span>}
          {children}
        </button>
      </Tooltip>
    </div>
  );
}

export function Hotbar({
  config,
  state,
  potions,
  torchesLeft,
  inMine,
  boltRef,
}: {
  config: MiningConfig;
  state: MiningState;
  potions: number;
  torchesLeft: number;
  inMine: boolean;
  boltRef: RefObject<HTMLDivElement | null>;
}) {
  const tiers = tiersOf(state);
  const set = state.stats.setBonus;
  const petIdx = state.pet ? config.pets.findIndex((p) => p.key === state.pet) : -1;
  return (
    <div className={styles.hotbar}>
      <div className={styles.hotGroup}>
        {GEAR_SLOTS.map((slot) => {
          const info = config.slots.find((x) => x.key === slot);
          const t = tiers[slot];
          return (
            <Square
              key={slot}
              grid={item(slot, t)}
              label={`${itemName(slot, t)}, tier ${t}`}
              className={set > 0 ? styles.hotSet : t >= 8 ? styles.hotGlow : ""}
              tip={
                <>
                  <b>{itemName(slot, t)}</b> · tier {t} / 10
                  <br />
                  {info?.stat}
                  <br />
                  {info && statLine(slot, info.tiers[t].stats)}
                  <br />
                  {set > 0 ? (
                    <>
                      Set bonus <b>{SET_BONUSES[set][0]}</b>: {SET_BONUSES[set][1]}
                    </>
                  ) : (
                    "Wear all five pieces of one metal for a set bonus."
                  )}
                </>
              }
            />
          );
        })}
      </div>

      <div className={styles.hotGroup}>
        <Square
          grid={TORCH[1]}
          hotkey="T"
          empty={torchesLeft <= 0}
          count={`${torchesLeft}/${config.maxTorches}`}
          label={`Torches, ${torchesLeft} left`}
          tip={
            <>
              <b>Torches</b> · {torchesLeft} of {config.maxTorches} left
              <br />
              {inMine ? "T plants one above your head. Lit tunnels stay lit." : "You get a fresh bundle every trip."}
            </>
          }
        />
        <Square
          grid={scrollSprite()}
          hotkey="F"
          empty={!state.firebolt}
          label={state.firebolt ? "Firebolt" : "Firebolt, not learned"}
          tip={
            state.firebolt ? (
              <>
                <b>Firebolt</b> · F or right-click to throw it at the cursor. The only thing that hurts a mimic.
              </>
            ) : (
              <>
                <b>Firebolt</b> · not learned yet. Moss the peddler teaches it down in the mine.
              </>
            )
          }
        >
          {state.firebolt && <div ref={boltRef} className={styles.hotCooldown} />}
        </Square>
        <Square
          grid={potionSprite()}
          hotkey="Q"
          empty={potions <= 0}
          count={potions > 0 ? `×${potions}` : undefined}
          label={`Healing draughts, ${potions}`}
          tip={
            potions > 0 ? (
              <>
                <b>Healing draught</b> × {potions} · Q heals 60% of your health.
              </>
            ) : (
              <>
                <b>Healing draught</b> · none on your belt. Moss sells them down in the mine.
              </>
            )
          }
        />
      </div>

      <div className={styles.hotGroup}>
        <Square
          grid={petSprite(PET_ART[Math.max(0, petIdx)])}
          empty={petIdx < 0}
          label={petIdx >= 0 ? config.pets[petIdx].name : "No pet"}
          tip={
            petIdx >= 0 ? (
              <>
                <b>{config.pets[petIdx].name}</b> · {PET_ART[petIdx].does}
              </>
            ) : (
              <>
                <b>No pet yet</b> · Pip sells them at camp.
              </>
            )
          }
        />
      </div>
    </div>
  );
}

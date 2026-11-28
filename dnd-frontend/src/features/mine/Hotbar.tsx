import { type CSSProperties, type ReactNode, type RefObject, useState } from "react";
import { Tooltip } from "@mantine/core";
import type { MiningConfig, MiningState, SlotKey } from "@services/miningService";
import { GEAR_SLOTS, type GearSlot, item, itemName, SETS } from "./art/gear";
import { PET_ART, petSprite } from "./art/pets";
import { type Grid, tint } from "./art/pixel";
import { bombSprite, greaterPotionSprite, potionSprite, recallScroll, reviveScroll, scrollSprite } from "./art/world";
import type { Drink } from "./engine";
import { DASH_PERKS, forgedOf, HOLDING_TIER, ownsHolding, SET_BONUSES, statLine, tiersOf, wearsHolding } from "./mine";
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
  glow,
  active,
  onClick,
  children,
}: {
  grid: Grid;
  empty?: boolean;
  hotkey?: string;
  count?: string;
  tip: ReactNode;
  label: string;
  className?: string;
  glow?: string;
  active?: boolean;
  onClick?: () => void;
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
          style={glow ? ({ "--glow": glow } as CSSProperties) : undefined}
          data-on={active || undefined}
          aria-pressed={onClick ? !!active : undefined}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClick}
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
  greater,
  drink,
  onDrink,
  bombs,
  torchesLeft,
  inMine,
  boltRef,
  top,
  onEquip,
  onPet,
  onRecall,
}: {
  config: MiningConfig;
  state: MiningState;
  potions: number;
  greater: number;
  drink: Drink;
  onDrink: (d: Drink) => void;
  bombs: number;
  torchesLeft: number | null;
  inMine: boolean;
  boltRef: RefObject<HTMLDivElement | null>;
  top?: ReactNode;
  onEquip: (slot: SlotKey, tier: number) => Promise<void>;
  onPet: (key: string | null) => Promise<void>;
  onRecall?: () => void;
}) {
  const tiers = tiersOf(state);
  const forged = forgedOf(state);
  const holding = wearsHolding(state);
  const set = state.stats.setBonus;
  const petIdx = state.pet ? config.pets.findIndex((p) => p.key === state.pet) : -1;
  const [picking, setPicking] = useState<GearSlot | "pet" | "potion" | null>(null);
  const [busy, setBusy] = useState(false);
  const pick = inMine && picking !== "potion" ? null : picking;
  const toggle = (p: GearSlot | "pet" | "potion") => setPicking((cur) => (cur === p ? null : p));
  const choose = async (work: () => Promise<void>) => {
    setBusy(true);
    try {
      await work();
      setPicking(null);
    } finally {
      setBusy(false);
    }
  };
  const swapTip = inMine ? "Swap gear at camp." : "Click to swap to another piece you've forged.";
  const ownedPets = config.pets.map((p, i) => ({ ...p, i })).filter((p) => state.pets.includes(p.key));

  return (
    <div className={styles.hotbar}>
      {top}
      {pick === "potion" && (
        <div className={styles.hotPicker}>
          <span className={styles.hotPickLabel}>Q drinks</span>
          {(
            [
              ["potion", potionSprite(), "Healing draught", potions],
              ["greater", greaterPotionSprite(), "Greater Healing Potion", greater],
            ] as const
          ).map(([key, grid, name, n]) => (
            <button
              key={key}
              type="button"
              className={`${styles.hotSlot} ${n <= 0 ? styles.hotEmpty : ""}`}
              data-on={drink === key || undefined}
              aria-pressed={drink === key}
              title={`${name}, ${n} on your belt`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onDrink(key);
                setPicking(null);
              }}
            >
              <Sprite grid={grid} scale={2} label={name} />
              <span className={styles.hotCount}>{n}</span>
            </button>
          ))}
        </div>
      )}
      {pick && pick !== "pet" && pick !== "potion" && (
        <div className={styles.hotPicker}>
          <span className={styles.hotPickLabel}>Wear</span>
          {[
            ...(config.slots.find((x) => x.key === pick)?.tiers ?? []).slice(0, forged[pick] + 1).map((x) => x.tier),
            ...(pick === "satchel" && ownsHolding(state) ? [HOLDING_TIER] : []),
          ].map((t) => (
            <button
              key={t}
              type="button"
              className={styles.hotSlot}
              data-on={t === (pick === "satchel" && holding ? HOLDING_TIER : tiers[pick]) || undefined}
              aria-pressed={t === (pick === "satchel" && holding ? HOLDING_TIER : tiers[pick])}
              title={`${itemName(pick, t)}, tier ${t}`}
              disabled={busy}
              onClick={() => void choose(() => onEquip(pick, t))}
            >
              <Sprite grid={item(pick, t)} scale={2} label={itemName(pick, t)} />
              <span className={styles.hotCount}>{t}</span>
            </button>
          ))}
        </div>
      )}
      {pick === "pet" && (
        <div className={styles.hotPicker}>
          <span className={styles.hotPickLabel}>Follow</span>
          <button
            type="button"
            className={`${styles.hotSlot} ${styles.hotEmpty}`}
            data-on={petIdx < 0 || undefined}
            aria-pressed={petIdx < 0}
            title="No pet"
            disabled={busy}
            onClick={() => void choose(() => onPet(null))}
          >
            <Sprite grid={ghost(petSprite(PET_ART[0]))} scale={2} label="No pet" />
          </button>
          {ownedPets.map((p) => (
            <button
              key={p.key}
              type="button"
              className={styles.hotSlot}
              data-on={p.key === state.pet || undefined}
              aria-pressed={p.key === state.pet}
              title={p.name}
              disabled={busy}
              onClick={() => void choose(() => onPet(p.key))}
            >
              <Sprite grid={petSprite(PET_ART[p.i])} scale={2} label={p.name} />
            </button>
          ))}
        </div>
      )}
      <div className={styles.hotRow}>
        <div className={styles.hotGroup}>
          {GEAR_SLOTS.map((slot) => {
            const info = config.slots.find((x) => x.key === slot);
            const t = tiers[slot];
            const bag = slot === "satchel" && holding;
            const shown = bag ? HOLDING_TIER : t;
            return (
              <Square
                key={slot}
                grid={item(slot, shown)}
                label={`${itemName(slot, shown)}, tier ${shown}`}
                className={set > 0 ? styles.hotSet : t >= 6 ? styles.hotGlow : ""}
                glow={t >= 6 ? (SETS[t].accent ?? SETS[t].base) : undefined}
                active={pick === slot}
                onClick={inMine ? undefined : () => toggle(slot)}
                tip={
                  <>
                    <b>{itemName(slot, shown)}</b> · tier {shown} / 10
                    {forged[slot] > t && ` (forged up to ${forged[slot]})`}
                    <br />
                    {info?.stat}
                    <br />
                    {bag ? `Carries ${state.stats.capacity}, twice a Starmetal satchel.` : info && statLine(slot, info.tiers[t].stats)}
                    <br />
                    {set > 0 ? (
                      <>
                        Set bonus <b>{SET_BONUSES[set][0]}</b>: {SET_BONUSES[set][1]} {DASH_PERKS[set]}
                      </>
                    ) : (
                      "Wear all six pieces of one metal, boots included, for a set bonus."
                    )}
                    <br />
                    {swapTip}
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
            empty={torchesLeft !== null && torchesLeft <= 0}
            count={torchesLeft === null ? undefined : String(torchesLeft)}
            label={torchesLeft === null ? "Torches" : `Torches, ${torchesLeft} left`}
            tip={
              <>
                <b>Torches</b>
                {torchesLeft !== null && ` · ${torchesLeft} left`}
                <br />
                {inMine ? "T plants one above your head. Wounds only mend in torchlight, and monsters never spawn near one." : `Hesk sells them at camp, ${config.torchPrice} coins each.`}
              </>
            }
          />
          <Square
            grid={scrollSprite(!!state.fireball)}
            hotkey="F"
            empty={!state.firebolt}
            label={state.fireball ? "Fireball" : state.firebolt ? "Firebolt" : "Firebolt, not learned"}
            tip={
              state.fireball ? (
                <>
                  <b>Fireball</b> · F or right-click to throw it at the cursor. 5× your Hit, burning every monster within 2 tiles of where it lands.
                </>
              ) : state.firebolt ? (
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
            grid={drink === "greater" ? greaterPotionSprite() : potionSprite()}
            hotkey="Q"
            empty={(drink === "greater" ? greater : potions) <= 0}
            count={(drink === "greater" ? greater : potions) > 0 ? `×${drink === "greater" ? greater : potions}` : undefined}
            label={drink === "greater" ? `Greater Healing Potions, ${greater}` : `Healing draughts, ${potions}`}
            active={pick === "potion"}
            onClick={() => toggle("potion")}
            tip={
              <>
                {drink === "greater" ? (
                  <>
                    <b>Greater Healing Potion</b> × {greater} · Q heals you completely.
                  </>
                ) : (
                  <>
                    <b>Healing draught</b> × {potions} · Q heals 60% of your health.
                  </>
                )}
                <br />
                Click to pick which potion Q drinks. If that one runs out, Q drinks the other.
                {potions + greater <= 0 && " Hesk and Moss sell draughts; Sister Maren sells the greater kind."}
              </>
            }
          />
        </div>

        <div className={styles.hotGroup}>
          <Square
            grid={bombSprite()}
            hotkey="B"
            empty={bombs <= 0}
            count={bombs > 0 ? `×${bombs}` : undefined}
            label={`Bombs, ${bombs} of ${state.bombCap ?? 3}`}
            tip={
              <>
                <b>Blasting Bomb</b> × {bombs} / {state.bombCap ?? 3} · B readies one, B again lights it at the cursor. It levels everything within 7 tiles
                and hits you for 200 (less armor) if you're inside the ring.{bombs <= 0 && " Moss sells them down in the mine."}
              </>
            }
          />
          <Square
            grid={recallScroll()}
            hotkey="R"
            empty={!state.recalls}
            count={state.recalls ? `×${state.recalls}` : undefined}
            label={`Scrolls of the Tide, ${state.recalls ?? 0}`}
            onClick={inMine && state.recalls ? onRecall : undefined}
            tip={
              <>
                <b>Scroll of the Tide</b> × {state.recalls ?? 0} ·{" "}
                {inMine ? "R reads one and carries you home to camp at once, with everything you carry." : "Read one in the mine to get home instantly. Sister Maren sells them at the chapel."}
              </>
            }
          />
          <Square
            grid={reviveScroll()}
            empty={!state.revives}
            count={state.revives ? `×${state.revives}` : undefined}
            label={`Scrolls of Second Breath, ${state.revives ?? 0}`}
            tip={
              <>
                <b>Scroll of Second Breath</b> × {state.revives ?? 0} · If you fall in the mine, you'll be offered one before you faint: back up at full health, satchel and all.
                {!state.revives && " Sister Maren sells them at the chapel."}
              </>
            }
          />
        </div>

        <div className={styles.hotGroup}>
          <Square
            grid={petSprite(PET_ART[Math.max(0, petIdx)])}
            empty={petIdx < 0}
            label={petIdx >= 0 ? config.pets[petIdx].name : "No pet"}
            active={pick === "pet"}
            onClick={inMine || !state.pets.length ? undefined : () => toggle("pet")}
            tip={
              <>
                {petIdx >= 0 ? (
                  <>
                    <b>{config.pets[petIdx].name}</b> · {PET_ART[petIdx].does}
                  </>
                ) : (
                  <>
                    <b>No pet following</b> · Pip sells them at camp.
                  </>
                )}
                {state.pets.length > 0 && (
                  <>
                    <br />
                    {inMine ? "Swap pets at camp." : "Click to pick who follows you."}
                  </>
                )}
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}

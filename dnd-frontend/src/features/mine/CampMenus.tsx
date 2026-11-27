import { useState } from "react";
import { Tooltip } from "@mantine/core";
import { IconLock, IconPin, IconPinFilled, IconX } from "@tabler/icons-react";
import { showNotification } from "@components/Notification/Notification";
import {
  buyPet,
  craftGear,
  descend,
  followPet,
  type MiningConfig,
  type MiningState,
  type OreCounts,
  type SlotKey,
  upgradeForge,
} from "@services/miningService";
import { FORGE_LEVELS, forgeSprite } from "./art/forge";
import { GEAR_SLOTS, item, itemName } from "./art/gear";
import { PET_ART, petSprite } from "./art/pets";
import { ENEMIES, potionSprite, scrollSprite } from "./art/world";
import { type Goal, goalsFor, pickGoal, progress, setPinnedGoal, usePinnedGoal, withSatchel } from "./goals";
import { canAfford, compact, discounted, statLine, tiersOf } from "./mine";
import { oreIcon } from "./render";
import { play, type Sfx } from "./sound";
import { Sprite } from "./Sprite";
import { FOREMAN, MOSS_LINES, PAGES, WARES, wickLines, wickSprite } from "./story";
import styles from "./Mine.module.css";

type MenuProps = { config: MiningConfig; state: MiningState; onState: (s: MiningState) => void };

function Cost({ cost, ores, config }: { cost: OreCounts; ores: OreCounts; config: MiningConfig }) {
  return (
    <div className={styles.costs}>
      {Object.entries(cost).map(([key, need]) => {
        const i = config.ores.findIndex((o) => o.key === key);
        const have = ores[key] ?? 0;
        return (
          <span key={key} className={`${styles.cost} ${have >= need ? styles.costOk : ""}`}>
            <Sprite grid={oreIcon(i)} scale={1} />
            {compact(Math.min(have, need))} / {compact(need)} {config.ores[i]?.name}
          </span>
        );
      })}
    </div>
  );
}

function PinButton({ id }: { id: string }) {
  const pinned = usePinnedGoal();
  const on = pinned === id;
  return (
    <button
      type="button"
      className={`${on ? "glass-btn-primary" : "glass-btn-secondary"} ${styles.actBtn}`}
      aria-pressed={on}
      onClick={() => setPinnedGoal(on ? null : id)}
    >
      {on ? <IconPinFilled size={14} /> : <IconPin size={14} />} {on ? "Tracking" : "Track"}
    </button>
  );
}

const GOAL_PLACE: Record<Goal["kind"], string> = { gear: "the forge", forge: "the forge", pet: "Pip's stall" };

export function PanelHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className={styles.barHead}>
      <span className={styles.eyebrow}>{title}</span>
      <button
        type="button"
        className={`glass-btn-secondary ${styles.closeBtn}`}
        aria-label={`Close ${title}`}
        onClick={onClose}
      >
        <IconX size={14} />
      </button>
    </div>
  );
}

export function NextGoal({
  config,
  state,
  satchel,
  onClose,
}: {
  config: MiningConfig;
  state: MiningState;
  satchel: OreCounts;
  onClose: () => void;
}) {
  const pinned = usePinnedGoal();
  const ores = withSatchel(state.ores, satchel);
  const goal = pickGoal(goalsFor(config, state), ores, pinned);
  if (!goal) return null;
  const ready = canAfford(goal.cost, ores);
  const banked = canAfford(goal.cost, state.ores);
  return (
    <div className={`${styles.block} ${styles.hudPanel} ${styles.goalCard}`}>
      <PanelHead title={goal.id === pinned ? "Tracking" : "Next goal"} onClose={onClose} />
      <div className={styles.barHead}>
        <b className={styles.pixel}>{goal.name}</b>
        <span className={styles.barText}>{Math.floor(progress(goal.cost, ores) * 100)}%</span>
      </div>
      <div className={styles.bar}>
        <div
          className={`${styles.satchelFill} ${ready ? styles.goalReady : ""}`}
          style={{ width: `${progress(goal.cost, ores) * 100}%` }}
        />
      </div>
      <Cost cost={goal.cost} ores={ores} config={config} />
      {ready && (
        <span className={styles.goalNote}>
          {banked ? `Ready! Visit ${GOAL_PLACE[goal.kind]}.` : `Ready! Bank your satchel, then visit ${GOAL_PLACE[goal.kind]}.`}
        </span>
      )}
      {goal.id === pinned && (
        <button type="button" className={`glass-btn-secondary ${styles.actBtn}`} onClick={() => setPinnedGoal(null)}>
          Stop tracking
        </button>
      )}
    </div>
  );
}

export interface TripReport {
  fainted: boolean;
  haul: OreCounts;
  fresh: string[];
  ready: Goal[];
}

const GOAL_ACTIONS: Record<Goal["kind"], [string, (key: string) => Promise<MiningState>]> = {
  gear: ["Forge it", (key) => craftGear(key as SlotKey)],
  forge: ["Rebuild", () => upgradeForge()],
  pet: ["Adopt", (key) => buyPet(key)],
};

export function TripSummary({ config, state, onState, report, onClose }: MenuProps & { report: TripReport; onClose: () => void }) {
  const { busy, run } = useRun(onState);
  const live = new Map(goalsFor(config, state).map((g) => [g.id, g]));
  const ready = report.ready.filter((g) => live.get(g.id)?.name === g.name);
  const haul = Object.entries(report.haul).filter(([, n]) => n > 0);
  return (
    <section className={styles.found} aria-label="Trip summary">
      <div className={styles.summary}>
        <span className={styles.eyebrow}>{report.fainted ? "You fainted" : "Back at camp"}</span>
        <h2 className={styles.h2}>
          {haul.length ? `Banked ${compact(haul.reduce((a, [, n]) => a + n, 0))} ore` : "Empty-handed, but alive"}
        </h2>
        {report.fainted && <span className={styles.dim}>You woke up sore and lighter. Half the satchel is gone.</span>}
        {haul.length > 0 && (
          <div className={styles.satchelList}>
            {haul.map(([key, n]) => {
              const i = config.ores.findIndex((o) => o.key === key);
              const fresh = report.fresh.includes(key);
              return (
                <span key={key} className={`${styles.satchelItem} ${fresh ? styles.freshOre : ""}`} title={config.ores[i]?.name}>
                  <Sprite grid={oreIcon(i)} scale={2} />
                  {compact(n)} {config.ores[i]?.name}
                  {fresh && " · NEW"}
                </span>
              );
            })}
          </div>
        )}
        {ready.length > 0 && (
          <>
            <span className={styles.eyebrow}>Now affordable</span>
            {ready.map((g) => {
              const [label, act] = GOAL_ACTIONS[g.kind];
              return (
                <div key={g.id} className={styles.readyRow}>
                  <span className={styles.pixel}>{g.name}</span>
                  <button
                    type="button"
                    className={`glass-btn-primary ${styles.actBtn}`}
                    disabled={busy || !canAfford(g.cost, state.ores)}
                    onClick={() => void run(() => act(g.key), () => `${g.name} is yours`)}
                  >
                    {label}
                  </button>
                </div>
              );
            })}
          </>
        )}
      </div>
      <button type="button" className={`glass-btn-secondary ${styles.actBtn}`} onClick={onClose}>
        Back to camp (Esc)
      </button>
    </section>
  );
}

function useRun(onState: (s: MiningState) => void) {
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<MiningState>, done?: (s: MiningState) => string, sfx?: Sfx) => {
    setBusy(true);
    try {
      const s = await action();
      const cue = sfx ?? (done ? "buy" : null);
      if (cue) play(cue);
      onState(s);
      if (done) showNotification({ title: done(s), message: "", color: "yellow" });
    } catch (e) {
      showNotification({ title: "Not now", message: (e as Error).message, color: "red" });
    } finally {
      setBusy(false);
    }
  };
  return { busy, run };
}

function Wick({ state }: { state: MiningState }) {
  const [line] = useState(() => {
    const lines = wickLines(state);
    return lines[Math.floor(Math.random() * lines.length)];
  });
  const [page, setPage] = useState<number | null>(null);
  const found = new Set(state.pages);
  return (
    <div className={styles.wick}>
      <Sprite grid={wickSprite()} scale={3} label="Old Wick" />
      <div className={styles.wickBody}>
        <p className={styles.wickLine}>
          <b className={styles.pixel}>Old Wick:</b> "{line}"
        </p>
        <div className={styles.ledgerRow}>
          <span className={styles.petMeta}>
            The foreman's ledger · {found.size} / {PAGES.length}
          </span>
          {PAGES.map((_, i) => {
            const n = i + 1;
            const has = found.has(n);
            return (
              <Tooltip key={n} label={has ? `Page ${n}` : `Lost somewhere in depth ${n}`} withArrow>
                <button
                  type="button"
                  className={`${styles.pageBtn} ${page === n ? styles.pageOpen : ""}`}
                  disabled={!has}
                  aria-label={has ? `Read page ${n}` : `Page ${n}, not found yet`}
                  onClick={() => setPage(page === n ? null : n)}
                >
                  {has ? n : "?"}
                </button>
              </Tooltip>
            );
          })}
        </div>
        {page && <LedgerPage n={page} />}
      </div>
    </div>
  );
}

export function LedgerPage({ n }: { n: number }) {
  return (
    <blockquote className={styles.ledgerPage}>
      <span className={styles.petMeta}>
        {FOREMAN} · page {n}
      </span>
      <p>{PAGES[n - 1]}</p>
    </blockquote>
  );
}

export function LiftMenu({ config, state, onState }: MenuProps) {
  const { busy, run } = useRun(onState);
  return (
    <>
      <Wick state={state} />
      <div className={styles.depths}>
        {config.depths.map((d) => {
          const locked = d.number > state.deepestDepth;
          const foe = ENEMIES[d.number - 1];
          return (
            <button
              key={d.number}
              type="button"
              className={`${styles.depthCard} ${locked ? styles.locked : ""}`}
              disabled={locked || busy}
              onClick={() => void run(() => descend(d.number), undefined, "lift")}
            >
              <span className={styles.depthNum}>{locked ? <IconLock size={14} /> : d.number}</span>
              <span className={styles.depthInfo}>
                <b>{d.name}</b>
                <span>
                  {locked
                    ? `Break the seal at depth ${d.number - 1} with a ${itemName("pickaxe", d.number - 1)}`
                    : `${foe.name} · ${config.ores[2 * d.number - 2].name}, ${config.ores[2 * d.number - 1].name}`}
                </span>
              </span>
              <span className={styles.depthOres}>
                <Sprite grid={oreIcon(2 * d.number - 2)} scale={1} />
                <Sprite grid={oreIcon(2 * d.number - 1)} scale={1} />
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

export function ForgeMenu({ config, state, onState }: MenuProps) {
  const { busy, run } = useRun(onState);
  const tiers = tiersOf(state);
  const forge = config.forges[state.forgeLevel - 1];
  const nextForge = config.forges[state.forgeLevel];
  return (
    <>
      <div className={styles.forgeHead}>
        <Sprite grid={forgeSprite(state.forgeLevel)} scale={2} label={forge.name} />
        <div className={styles.forgeInfo}>
          <b className={styles.pixel}>
            Level {forge.level} · {forge.name}
          </b>
          <span className={styles.dim}>{FORGE_LEVELS[state.forgeLevel - 1].perk}</span>
          {nextForge ? (
            <>
              <span className={styles.dim}>
                Next: {nextForge.name}. {FORGE_LEVELS[state.forgeLevel].perk}
              </span>
              <Cost cost={nextForge.cost ?? {}} ores={state.ores} config={config} />
              <div className={styles.btnRow}>
                <button
                  type="button"
                  className={`glass-btn-primary ${styles.actBtn}`}
                  disabled={busy || !canAfford(nextForge.cost, state.ores)}
                  onClick={() => void run(upgradeForge, (s) => `The ${config.forges[s.forgeLevel - 1].name} is lit`)}
                >
                  Rebuild the forge
                </button>
                <PinButton id="forge" />
              </div>
            </>
          ) : (
            <span className={styles.dim}>The hottest fire there is.</span>
          )}
        </div>
      </div>
      <div className={styles.slots}>
        {GEAR_SLOTS.map((key) => {
          const slot = config.slots.find((s) => s.key === key);
          if (!slot) return null;
          const tier = tiers[key];
          const next = slot.tiers[tier + 1];
          const cost = next?.cost ? discounted(next.cost, forge.discount) : null;
          const capped = !!next && next.tier > forge.maxTier;
          return (
            <div key={key} className={styles.slot}>
              <Sprite grid={item(key, tier)} scale={3} label={itemName(key, tier)} />
              <div className={styles.slotBody}>
                <div className={styles.slotName}>
                  {itemName(key, tier)}
                  <span className={styles.tier}>{tier} / 10</span>
                </div>
                <div className={styles.slotStat}>{statLine(key, slot.tiers[tier].stats)}</div>
                {next && cost ? (
                  <>
                    <div className={styles.slotNext}>
                      <Sprite grid={item(key, tier + 1)} scale={1} /> {itemName(key, tier + 1)} →{" "}
                      {statLine(key, next.stats)}
                    </div>
                    {capped ? (
                      <div className={styles.dim}>Needs a hotter forge (level {Math.ceil(next.tier / 2)}).</div>
                    ) : (
                      <>
                        <Cost cost={cost} ores={state.ores} config={config} />
                        <div className={styles.btnRow}>
                          <button
                            type="button"
                            className={`glass-btn-primary ${styles.actBtn}`}
                            disabled={busy || !canAfford(cost, state.ores)}
                            onClick={() =>
                              void run(
                                () => craftGear(key),
                                () => `Forged: ${itemName(key, tier + 1)}`,
                              )
                            }
                          >
                            Forge
                          </button>
                          <PinButton id={`gear:${key}`} />
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className={styles.dim}>Masterwork. Nothing left to forge.</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function PetMenu({ config, state, onState }: MenuProps) {
  const { busy, run } = useRun(onState);
  const pets = config.pets.filter((p) => !p.mythic || state.foxRevealed || state.pets.includes(p.key));
  const current = config.pets.find((p) => p.key === state.pet);
  return (
    <>
      <p className={styles.quote}>
        "Every delver needs a friend down there. Mind the dragon, it bites." Pets fight beside you, but only finish a
        monster alone when they're at least 3 tiers above the depth.
      </p>
      {current && (
        <button
          type="button"
          className={`glass-btn-secondary ${styles.actBtn}`}
          disabled={busy}
          onClick={() => void run(() => followPet(null))}
        >
          Leave {current.name} at camp
        </button>
      )}
      <div className={styles.pets}>
        {pets.map((p) => {
          const art = PET_ART[config.pets.indexOf(p)];
          const owned = state.pets.includes(p.key);
          const active = state.pet === p.key;
          return (
            <div
              key={p.key}
              className={`${styles.pet} ${p.mythic ? styles.mythic : ""} ${active ? styles.petActive : ""}`}
            >
              <Sprite grid={petSprite(art)} scale={3} label={p.name} />
              <div className={styles.petBody}>
                <span className={styles.petMeta}>
                  {p.mythic ? "MYTHIC" : `TIER ${p.tier}`} ·{" "}
                  {p.tier > 3
                    ? `finishes foes alone on depths 1–${Math.min(10, p.tier - 3)}`
                    : "leaves the last blow to you"}
                </span>
                <b className={styles.pixel}>{p.name}</b>
                <span className={styles.dim}>{art.does}</span>
                {owned ? (
                  <button
                    type="button"
                    className={`${active ? "glass-btn-primary" : "glass-btn-secondary"} ${styles.actBtn}`}
                    disabled={busy || active}
                    onClick={() => void run(() => followPet(p.key))}
                  >
                    {active ? "Following you" : "Take along"}
                  </button>
                ) : (
                  <>
                    <Cost cost={p.cost} ores={state.ores} config={config} />
                    <div className={styles.btnRow}>
                      <button
                        type="button"
                        className={`glass-btn-primary ${styles.actBtn}`}
                        disabled={busy || !canAfford(p.cost, state.ores)}
                        onClick={() =>
                          void run(
                            () => buyPet(p.key),
                            () => `${p.name} joins you`,
                          )
                        }
                      >
                        Adopt
                      </button>
                      <PinButton id={`pet:${p.key}`} />
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function OrePouch({ config, state }: { config: MiningConfig; state: MiningState }) {
  return (
    <div className={styles.pouch}>
      {config.ores.map((o, i) => {
        const known = !!state.mined[o.key];
        return (
          <Tooltip
            key={o.key}
            multiline
            w={240}
            withArrow
            label={
              known
                ? `${o.lore} Mined so far: ${compact(state.mined[o.key])}.`
                : `Unknown ore, found from depth ${Math.floor(i / 2) + 1}.`
            }
          >
            <div className={`${styles.oreCell} ${known ? "" : styles.oreUnknown}`}>
              <Sprite grid={oreIcon(i)} scale={1} />
              <span className={styles.oreName}>{known ? o.name : "???"}</span>
              <span className={styles.oreCount}>{compact(state.ores[o.key] ?? 0)}</span>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}

export function TraderMenu({
  config,
  state,
  onTrade,
}: {
  config: MiningConfig;
  state: MiningState;
  onTrade: (item: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [line] = useState(() => MOSS_LINES[Math.floor(Math.random() * MOSS_LINES.length)]);
  const wares = Object.entries(state.trip?.wares ?? {}).filter(([k]) => k !== "firebolt" || !state.firebolt);
  const buy = async (item: string) => {
    setBusy(true);
    try {
      await onTrade(item);
    } catch (e) {
      showNotification({ title: "Moss shakes his head", message: (e as Error).message, color: "red" });
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <p className={styles.quote}>{line}</p>
      <div className={styles.pets}>
        {wares.map(([key, cost]) => {
          const full = key === "potion" && state.potions >= 5;
          return (
            <div key={key} className={`${styles.pet} ${key === "firebolt" ? styles.petActive : ""}`}>
              <Sprite grid={key === "firebolt" ? scrollSprite() : potionSprite()} scale={6} label={WARES[key]?.name} />
              <div className={styles.petBody}>
                <b className={styles.pixel}>{WARES[key]?.name ?? key}</b>
                <span className={styles.dim}>{WARES[key]?.blurb}</span>
                {key === "potion" && <span className={styles.petMeta}>ON YOUR BELT · {state.potions} / 5</span>}
                <Cost cost={cost} ores={state.ores} config={config} />
                <button
                  type="button"
                  className={`glass-btn-primary ${styles.actBtn}`}
                  disabled={busy || full || !canAfford(cost, state.ores)}
                  onClick={() => void buy(key)}
                >
                  {key === "firebolt" ? "Learn it" : full ? "Belt full" : "Buy one"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

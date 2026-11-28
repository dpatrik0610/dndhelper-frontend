import { type CSSProperties, useState } from "react";
import { Tooltip } from "@mantine/core";
import { IconArrowRight, IconLock, IconPin, IconPinFilled, IconX } from "@tabler/icons-react";
import { showNotification } from "@components/Notification/Notification";
import {
  buyPet,
  buyWare,
  churchBuy,
  craftGear,
  descend,
  followPet,
  type MiningConfig,
  type MiningState,
  type OreCounts,
  sellOre,
  type SlotKey,
  upgradeForge,
  upgradeHouse,
} from "@services/miningService";
import { FORGE_LEVELS, forgeSprite } from "./art/forge";
import { HOUSE_LEVELS, houseIcon } from "./art/house";
import type { Grid } from "./art/pixel";
import { COIN, DIAMOND, MAGMA_CORE, MATERIALS, MERCHANT } from "./art/materials";
import { GEAR_SLOTS, item, itemName, SETS } from "./art/gear";
import { PET_ART, petSprite } from "./art/pets";
import { bombSprite, chartSprite, ENEMIES, oilSprite, potionSprite, priestSprite, recallScroll, reviveScroll, scrollSprite } from "./art/world";
import { type Goal, goalsFor, pickGoal, progress, setPinnedGoal, usePinnedGoal, withSatchel } from "./goals";
import { canAfford, compact, discounted, forgedOf, statRows } from "./mine";
import { oreIcon, TORCH } from "./render";
import { play, type Sfx } from "./sound";
import { EFFECT_ART } from "./Effects";
import { Sprite } from "./Sprite";
import { BLESSINGS, FOREMAN, MOSS_LINES, PAGES, WARES, wickLines, wickSprite } from "./story";
import styles from "./Mine.module.css";

type MenuProps = { config: MiningConfig; state: MiningState; onState: (s: MiningState) => void };

const resourceOf = (config: MiningConfig, key: string) => {
  const i = config.ores.findIndex((o) => o.key === key);
  if (i >= 0) return { name: config.ores[i].name, grid: oreIcon(i), special: false };
  const m = MATERIALS[key];
  return { name: m?.name ?? key, grid: m?.grid ?? oreIcon(0), special: true };
};

function Cost({ cost, ores, config }: { cost: OreCounts; ores: OreCounts; config: MiningConfig }) {
  return (
    <div className={styles.costs}>
      {Object.entries(cost).map(([key, need]) => {
        const r = resourceOf(config, key);
        const have = ores[key] ?? 0;
        return (
          <span
            key={key}
            className={`${styles.cost} ${have >= need ? styles.costOk : ""} ${r.special ? styles.costSpecial : ""}`}
          >
            <Sprite grid={r.grid} scale={1} />
            {compact(Math.min(have, need))} / {compact(need)} {r.name}
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

const WARE_ART: Record<string, () => Grid> = {
  firebolt: () => scrollSprite(),
  fireball: () => scrollSprite(true),
  potion: potionSprite,
  bomb: bombSprite,
  torch: () => TORCH[1],
  chart: chartSprite,
  oil: oilSprite,
  [MAGMA_CORE]: () => MATERIALS[MAGMA_CORE].grid,
};
const MOSS_ONLY = new Set(["chart", "oil", MAGMA_CORE]);
const SPELLS = new Set(["firebolt", "fireball"]);

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

const GOAL_ACTIONS: Record<Goal["kind"], [string, (name: string) => string, (key: string) => Promise<MiningState>]> = {
  gear: ["Forge it", (name) => `Forge the ${name}?`, (key) => craftGear(key as SlotKey)],
  forge: ["Rebuild", (name) => `Rebuild into the ${name}?`, () => upgradeForge()],
  pet: ["Adopt", (name) => `Adopt the ${name}?`, (key) => buyPet(key)],
};

export function TripSummary({ config, state, onState, report, onClose }: MenuProps & { report: TripReport; onClose: () => void }) {
  const { busy, run } = useRun(onState);
  const [confirming, setConfirming] = useState<string | null>(null);
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
              const r = resourceOf(config, key);
              const fresh = report.fresh.includes(key);
              return (
                <span key={key} className={`${styles.satchelItem} ${fresh ? styles.freshOre : ""}`} title={r.name}>
                  <Sprite grid={r.grid} scale={2} />
                  {compact(n)} {r.name}
                  {fresh && " · NEW"}
                </span>
              );
            })}
          </div>
        )}
        {ready.length > 0 && (
          <>
            <span className={styles.eyebrow}>Suggestions</span>
            <span className={styles.dim}>
              Just ideas for what your stores can pay for now. Nothing is bought until you confirm, and you can always spend your ore at the
              forge or the pet shop instead.
            </span>
            {ready.map((g) => {
              const [label, ask, act] = GOAL_ACTIONS[g.kind];
              const affordable = canAfford(g.cost, state.ores);
              if (confirming === g.id && affordable)
                return (
                  <div key={g.id} className={`${styles.readyRow} ${styles.readyConfirm}`}>
                    <div className={styles.readyAsk}>
                      <span className={styles.pixel}>{ask(g.name)}</span>
                      <Cost cost={g.cost} ores={state.ores} config={config} />
                    </div>
                    <div className={styles.btnRow}>
                      <button type="button" className={`glass-btn-secondary ${styles.actBtn}`} onClick={() => setConfirming(null)}>
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={`glass-btn-primary ${styles.actBtn}`}
                        disabled={busy}
                        onClick={() => {
                          setConfirming(null);
                          void run(() => act(g.key), () => `${g.name} is yours`);
                        }}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                );
              return (
                <div key={g.id} className={styles.readyRow}>
                  <span className={styles.pixel}>{g.name}</span>
                  <button
                    type="button"
                    className={`glass-btn-secondary ${styles.actBtn}`}
                    disabled={busy || !affordable}
                    onClick={() => setConfirming(g.id)}
                  >
                    {label}…
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
  const tiers = forgedOf(state);
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
          const change = next ? statRows(key, slot.tiers[tier].stats, next.stats) : null;
          const glow = next ? (SETS[next.tier].accent ?? SETS[next.tier].gem ?? SETS[next.tier].base) : undefined;
          return (
            <div key={key} className={styles.slot}>
              <span className={styles.eyebrow}>{slot.noun}</span>
              <div className={styles.compare}>
                <div className={styles.gearCard}>
                  <span className={styles.gearTag}>Now</span>
                  <Sprite grid={item(key, tier)} scale={3} label={itemName(key, tier)} />
                  <b className={styles.gearName}>{itemName(key, tier)}</b>
                  <span className={styles.tier}>Tier {tier}</span>
                </div>
                {next ? (
                  <>
                    <IconArrowRight size={22} className={styles.compareArrow} aria-hidden />
                    <div
                      className={`${styles.gearCard} ${styles.gearNext}`}
                      style={{ "--glow": glow } as CSSProperties}
                    >
                      <span className={styles.gearTag}>Next</span>
                      <Sprite grid={item(key, tier + 1)} scale={3} label={itemName(key, tier + 1)} />
                      <b className={styles.gearName}>{itemName(key, tier + 1)}</b>
                      <span className={styles.tier}>Tier {tier + 1}</span>
                    </div>
                  </>
                ) : (
                  <span className={styles.dim}>Masterwork. Nothing left to forge.</span>
                )}
              </div>
              {change && (
                <table className={styles.deltaTable}>
                  <tbody>
                    {change.rows.map((r) => (
                      <tr key={r.label} className={r.gain ? styles.deltaUp : ""}>
                        <th scope="row">{r.label}</th>
                        <td>{r.now}</td>
                        <td aria-hidden>→</td>
                        <td className={styles.deltaNext}>{r.next}</td>
                        <td className={styles.deltaGain}>{r.gain ?? "same"}</td>
                      </tr>
                    ))}
                    {change.perks.map((p) => (
                      <tr key={p.label} className={p.fresh ? styles.deltaPerk : ""}>
                        <th scope="row" colSpan={4}>
                          {p.label}
                        </th>
                        <td className={styles.deltaGain}>{p.fresh ? "NEW" : "kept"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {next && cost && (
                capped ? (
                  <div className={styles.dim}>
                    <IconLock size={12} /> Needs a hotter forge:{" "}
                    {config.forges.find((f) => f.maxTier >= next.tier)?.name ?? "a better one"}.
                  </div>
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
                        Forge {itemName(key, tier + 1)}
                      </button>
                      <PinButton id={`gear:${key}`} />
                    </div>
                  </>
                )
              )}
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
      {Object.entries(MATERIALS).map(([key, m]) =>
        state.ores[key] ? (
          <Tooltip key={key} multiline w={240} withArrow label={m.lore}>
            <div className={`${styles.oreCell} ${styles.oreSpecial}`}>
              <Sprite grid={m.grid} scale={1} />
              <span className={styles.oreName}>{m.name}</span>
              <span className={styles.oreCount}>{compact(state.ores[key] ?? 0)}</span>
            </div>
          </Tooltip>
        ) : null,
      )}
    </div>
  );
}

function Coins({ n, have }: { n: number; have?: number }) {
  return (
    <span className={`${styles.cost} ${have === undefined || have >= n ? styles.costOk : ""}`}>
      <Sprite grid={COIN} scale={1} />
      {compact(n)} coins
    </span>
  );
}

export function Purse({ coins }: { coins: number }) {
  return (
    <span className={styles.purse}>
      <Sprite grid={COIN} scale={2} label="Coin pouch" />
      <b className={styles.pixel}>{coins.toLocaleString("en")}</b>
      <span className={styles.dim}>coins</span>
    </span>
  );
}

const SELL_STEPS = [1, 10, 100];

export function MarketMenu({ config, state, onState }: MenuProps) {
  const { busy, run } = useRun(onState);
  const owned = [...config.ores, { key: DIAMOND, name: MATERIALS[DIAMOND].name }].filter((o) => (state.ores[o.key] ?? 0) > 0);
  const wares = [
    {
      key: "torch",
      name: "Torch",
      blurb: `Pitch and rag on a stick. Your bundle holds ${config.maxTorchStock}.`,
      grid: TORCH[1],
      price: config.torchPrice,
      have: `IN YOUR BUNDLE · ${state.torchStock} / ${config.maxTorchStock}`,
      room: config.maxTorchStock - state.torchStock,
      counts: [1, 10],
    },
    {
      key: "potion",
      name: WARES.potion.name,
      blurb: WARES.potion.blurb,
      grid: potionSprite(),
      price: config.potionPrice,
      have: `ON YOUR BELT · ${state.potions} / ${state.belt}`,
      room: state.belt - state.potions,
      counts: [1],
    },
    ...(state.firebolt
      ? []
      : [
          {
            key: "firebolt",
            name: WARES.firebolt.name,
            blurb: WARES.firebolt.blurb,
            grid: scrollSprite(),
            price: config.fireboltPrice,
            have: "ONE SCROLL, LEARNED FOR GOOD",
            room: 1,
            counts: [1],
          },
        ]),
  ];
  return (
    <>
      <div className={styles.marketHead}>
        <Sprite grid={MERCHANT} scale={3} label="Hesk Saltpenny" />
        <p className={styles.quote}>"Copper's copper and starmetal's a fortune. I pay fair either way. Fair-ish."</p>
        <Purse coins={state.coins} />
      </div>
      <span className={styles.eyebrow}>Sell ore</span>
      {owned.length ? (
        <div className={styles.sellList}>
          {owned.map((o) => {
            const have = state.ores[o.key] ?? 0;
            const price = state.prices[o.key] ?? 0;
            return (
              <div key={o.key} className={styles.sellRow}>
                <Sprite grid={resourceOf(config, o.key).grid} scale={1} />
                <span className={styles.oreName}>{o.name}</span>
                <span className={styles.dim}>
                  {compact(have)} · {compact(price)}c each
                </span>
                <div className={styles.btnRow}>
                  {SELL_STEPS.filter((n) => n < have).map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`glass-btn-secondary ${styles.actBtn}`}
                      disabled={busy}
                      onClick={() => void run(() => sellOre(o.key, n), undefined, "buy")}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`glass-btn-primary ${styles.actBtn}`}
                    disabled={busy}
                    title={`Sell all for ${compact(have * price)} coins`}
                    onClick={() => void run(() => sellOre(o.key, have), undefined, "buy")}
                  >
                    All · {compact(have * price)}c
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <span className={styles.dim}>Nothing in your stores to sell. Bank some ore first.</span>
      )}
      <span className={styles.eyebrow}>Wares</span>
      <div className={styles.pets}>
        {wares.map((w) => (
          <div key={w.key} className={styles.pet}>
            <Sprite grid={w.grid} scale={w.key === "torch" ? 4 : 6} label={w.name} />
            <div className={styles.petBody}>
              <b className={styles.pixel}>{w.name}</b>
              <span className={styles.dim}>{w.blurb}</span>
              <span className={styles.petMeta}>{w.have}</span>
              <Coins n={w.price} have={state.coins} />
              <div className={styles.btnRow}>
                {w.counts.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`${n === 1 ? "glass-btn-primary" : "glass-btn-secondary"} ${styles.actBtn}`}
                    disabled={busy || w.room < n || state.coins < w.price * n}
                    onClick={() =>
                      void run(
                        () => buyWare(w.key, n),
                        () => (w.key === "firebolt" ? "You learned Firebolt" : `Bought ${n} × ${w.name}`),
                      )
                    }
                  >
                    {w.room < 1 ? "Full" : w.key === "firebolt" ? "Learn it" : `Buy ${n}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function HouseMenu({ config, state, onState }: MenuProps) {
  const { busy, run } = useRun(onState);
  const lv = Math.max(1, Math.min(HOUSE_LEVELS.length, state.houseLevel));
  const now = HOUSE_LEVELS[lv - 1];
  const next = HOUSE_LEVELS[lv];
  const cost = config.houses[lv]?.cost ?? 0;
  return (
    <>
      <div className={styles.marketHead}>
        <p className={styles.quote}>{now.blurb}</p>
        <Purse coins={state.coins} />
      </div>
      <div className={styles.compare}>
        <div className={styles.gearCard}>
          <span className={styles.gearTag}>Now</span>
          <Sprite grid={houseIcon(lv)} scale={2} label={now.name} />
          <b className={styles.gearName}>{now.name}</b>
          <span className={styles.dim}>{now.perk}</span>
        </div>
        {next ? (
          <>
            <IconArrowRight size={22} className={styles.compareArrow} aria-hidden />
            <div className={`${styles.gearCard} ${styles.gearNext}`}>
              <span className={styles.gearTag}>Next</span>
              <Sprite grid={houseIcon(lv + 1)} scale={2} label={next.name} />
              <b className={styles.gearName}>{next.name}</b>
              <span className={styles.dim}>{next.perk}</span>
            </div>
          </>
        ) : (
          <span className={styles.dim}>The grandest hall on Saltbell Isle. Nothing left to build.</span>
        )}
      </div>
      {next && (
        <>
          <div className={styles.barHead}>
            <span className={styles.eyebrow}>
              Home {lv} / {HOUSE_LEVELS.length}
            </span>
            <span className={styles.barText}>
              {compact(Math.min(state.coins, cost))} / {compact(cost)} coins
            </span>
          </div>
          <div className={styles.bar}>
            <div className={styles.satchelFill} style={{ width: `${Math.min(1, state.coins / cost) * 100}%` }} />
          </div>
          <button
            type="button"
            className={`glass-btn-primary ${styles.actBtn}`}
            disabled={busy || state.coins < cost}
            onClick={() => void run(upgradeHouse, () => `Moved into the ${next.name}`)}
          >
            Build the {next.name}
          </button>
        </>
      )}
    </>
  );
}

const minutesLeft = (ms: number) => (ms >= 60_000 ? `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s` : `${Math.ceil(ms / 1000)}s`);

export function ChurchMenu({ config, state, onState }: MenuProps) {
  const { busy, run } = useRun(onState);
  const prices = config.church ?? {};
  const maxMin = config.maxBlessingMinutes ?? 30;
  const scrolls = [
    {
      key: "potion",
      name: WARES.potion.name,
      blurb: WARES.potion.blurb,
      grid: potionSprite(),
      have: `ON YOUR BELT · ${state.potions} / ${state.belt}`,
      room: state.belt - state.potions,
    },
    {
      key: "revive",
      name: WARES.revive.name,
      blurb: WARES.revive.blurb,
      grid: reviveScroll(),
      have: `IN YOUR SCROLL CASE · ${state.revives ?? 0} / ${config.maxRevives ?? 3}`,
      room: (config.maxRevives ?? 3) - (state.revives ?? 0),
    },
    {
      key: "recall",
      name: WARES.recall.name,
      blurb: WARES.recall.blurb,
      grid: recallScroll(),
      have: `IN YOUR SCROLL CASE · ${state.recalls ?? 0} / ${config.maxRecalls ?? 5}`,
      room: (config.maxRecalls ?? 5) - (state.recalls ?? 0),
    },
  ];
  return (
    <>
      <div className={styles.marketHead}>
        <Sprite grid={priestSprite()} scale={3} label="Sister Maren" />
        <p className={styles.quote}>"The tide gives back what the deep takes. Usually. A blessing helps it remember."</p>
        <Purse coins={state.coins} />
      </div>
      <span className={styles.eyebrow}>Blessings</span>
      <span className={styles.dim}>
        Each runs on the real clock from the moment it's given, in the mine or out. Buy more to add time, up to {maxMin} minutes.
      </span>
      <div className={styles.pets}>
        {(Object.keys(BLESSINGS) as (keyof typeof BLESSINGS)[]).map((key) => {
          const b = BLESSINGS[key];
          const left = state.blessings?.[key] ?? 0;
          return (
            <div key={key} className={styles.pet}>
              <Sprite grid={EFFECT_ART[key].grid} scale={5} label={b.name} />
              <div className={styles.petBody}>
                <b className={styles.pixel}>{b.name}</b>
                <span className={styles.dim}>{b.blurb}</span>
                <span className={styles.petMeta}>{left > 0 ? `ACTIVE · ${minutesLeft(left)} LEFT` : "NOT ACTIVE"}</span>
                <div className={styles.btnRow}>
                  {[1, 5, 10].map((m) => {
                    const price = prices[`${key}-${m}`] ?? 0;
                    const over = left + m * 60_000 > maxMin * 60_000;
                    return (
                      <button
                        key={m}
                        type="button"
                        className={`${m === 1 ? "glass-btn-primary" : "glass-btn-secondary"} ${styles.actBtn}`}
                        disabled={busy || over || state.coins < price}
                        title={over ? `A blessing can't hold more than ${maxMin} minutes.` : undefined}
                        onClick={() => void run(() => churchBuy(`${key}-${m}`), () => `${b.name}: +${m} min`)}
                      >
                        {m} min · {compact(price)}c
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <span className={styles.eyebrow}>Scrolls and draughts</span>
      <div className={styles.pets}>
        {scrolls.map((w) => {
          const price = prices[w.key] ?? 0;
          return (
            <div key={w.key} className={styles.pet}>
              <Sprite grid={w.grid} scale={6} label={w.name} />
              <div className={styles.petBody}>
                <b className={styles.pixel}>{w.name}</b>
                <span className={styles.dim}>{w.blurb}</span>
                <span className={styles.petMeta}>{w.have}</span>
                <Coins n={price} have={state.coins} />
                <div className={styles.btnRow}>
                  <button
                    type="button"
                    className={`glass-btn-primary ${styles.actBtn}`}
                    disabled={busy || w.room < 1 || state.coins < price}
                    onClick={() => void run(() => churchBuy(w.key), () => `Bought ${w.name}`)}
                  >
                    {w.room < 1 ? "Full" : "Buy 1"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function TraderMenu({
  config,
  state,
  satchel,
  onTrade,
  onSell,
}: {
  config: MiningConfig;
  state: MiningState;
  satchel: OreCounts;
  onTrade: (item: string) => Promise<void>;
  onSell: (key: string, amount: number) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [line] = useState(() => MOSS_LINES[Math.floor(Math.random() * MOSS_LINES.length)]);
  const wares = Object.entries(state.trip?.wares ?? {}).filter(
    ([k]) => (k !== "firebolt" || !state.firebolt) && (k !== "fireball" || (state.firebolt && !state.fireball)),
  );
  const carried = config.ores.filter((o) => (satchel[o.key] ?? 0) > 0);
  const sell = (key: string, n: number) => attempt(() => onSell(key, n));
  const buy = (item: string) => attempt(() => onTrade(item));
  const attempt = async (work: () => Promise<void>) => {
    setBusy(true);
    try {
      await work();
    } catch (e) {
      showNotification({ title: "Moss shakes his head", message: (e as Error).message, color: "red" });
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <p className={styles.quote}>{line}</p>
      <div className={styles.traderHead}>
        <Purse coins={state.coins} />
        <span className={styles.eyebrow}>Sell from your satchel</span>
        <span className={styles.dim}>
          Moss pays {Math.round(config.mossBuys * 100)}% of the camp price, and it lightens your load on the spot.
        </span>
      </div>
      {carried.length ? (
        <div className={styles.sellList}>
          {carried.map((o) => {
            const have = satchel[o.key] ?? 0;
            const price = Math.max(1, Math.floor((state.prices[o.key] ?? 0) * config.mossBuys));
            return (
              <div key={o.key} className={styles.sellRow}>
                <Sprite grid={resourceOf(config, o.key).grid} scale={1} />
                <span className={styles.oreName}>{o.name}</span>
                <span className={styles.dim}>
                  {compact(have)} · {compact(price)}c each
                </span>
                <div className={styles.btnRow}>
                  {SELL_STEPS.filter((n) => n < have).map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`glass-btn-secondary ${styles.actBtn}`}
                      disabled={busy}
                      onClick={() => void sell(o.key, n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`glass-btn-primary ${styles.actBtn}`}
                    disabled={busy}
                    title={`Sell all for ${compact(have * price)} coins`}
                    onClick={() => void sell(o.key, have)}
                  >
                    All · {compact(have * price)}c
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <span className={styles.dim}>Your satchel is empty.</span>
      )}
      <span className={styles.eyebrow}>Wares</span>
      <div className={styles.pets}>
        {wares.map(([key, price]) => {
          const full =
            (key === "potion" && state.potions >= state.belt) || (key === "torch" && state.torchStock >= config.maxTorchStock);
          const ware = WARES[key];
          return (
            <div key={key} className={`${styles.pet} ${SPELLS.has(key) || MOSS_ONLY.has(key) ? styles.petActive : ""}`}>
              <Sprite grid={WARE_ART[key]?.() ?? potionSprite()} scale={key === "torch" || key === MAGMA_CORE ? 4 : 6} label={ware?.name ?? key} />
              <div className={styles.petBody}>
                <b className={styles.pixel}>{ware?.name ?? key}</b>
                <span className={styles.dim}>{ware?.blurb}</span>
                {key === "potion" && (
                  <span className={styles.petMeta}>
                    ON YOUR BELT · {state.potions} / {state.belt}
                  </span>
                )}
                {MOSS_ONLY.has(key) && <span className={styles.petMeta}>ONLY FROM MOSS · ONE PER VISIT</span>}
                {key === "fireball" && <span className={styles.petMeta}>ONLY IN THE FLAMEWELL · LEARNED FOR GOOD</span>}
                <Coins n={price} have={state.coins} />
                <button
                  type="button"
                  className={`glass-btn-primary ${styles.actBtn}`}
                  disabled={busy || full || state.coins < price}
                  onClick={() => void buy(key)}
                >
                  {SPELLS.has(key) ? "Learn it" : full ? "Belt full" : "Buy one"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

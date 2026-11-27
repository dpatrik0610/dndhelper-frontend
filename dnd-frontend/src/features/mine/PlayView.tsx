import { useCallback, useEffect, useRef, useState } from "react";
import { Switch, Tooltip } from "@mantine/core";
import { showNotification } from "@components/Notification/Notification";
import {
  ascend,
  dig,
  faint,
  getMiningState,
  trade,
  type MiningConfig,
  type MiningState,
  type OreCounts,
} from "@services/miningService";
import { GEAR_SLOTS, item, itemName } from "./art/gear";
import { PET_ART, petSprite } from "./art/pets";
import { potionSprite, scrollSprite } from "./art/world";
import { ForgeMenu, LedgerPage, LiftMenu, OrePouch, PetMenu, TraderMenu } from "./CampMenus";
import {
  type Aim,
  BOLT_MS,
  castBolt,
  createGame,
  drinkPotion,
  type Game,
  type Keys,
  loadTrip,
  noteInput,
  placeTorch,
  type Station,
  stationAt,
  step,
  T,
  takePending,
} from "./engine";
import { compact, SET_BONUSES, statLine, tiersOf, total } from "./mine";
import { createRenderer, oreIcon } from "./render";
import { loadPrefs, play, preloadSounds, setPrefs, type SoundPrefs, startMusic, stopMusic } from "./sound";
import { Sprite } from "./Sprite";
import { dreamsFor, engraving } from "./story";
import styles from "./Mine.module.css";

const SWITCH_CLASSES = { root: "sq-switch", track: "sq-switch-track", thumb: "sq-switch-thumb" };
const STEP_MS = 1000 / 60;
const FLUSH_MS = 1000;
const NO_KEYS: Keys = { left: false, right: false, up: false, down: false, jump: false, attack: false };

const KEYMAP: Record<string, keyof Keys> = {
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  Space: "jump",
  Enter: "attack",
  NumpadEnter: "attack",
};

const ignoreKeys = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null;
  if (t?.closest?.("input, textarea, select, [contenteditable], [role='dialog']")) return true;
  return (e.code === "Enter" || e.code === "Space" || e.code === "NumpadEnter") && !!t?.closest?.("button, a");
};

const MENU_TITLES: Record<Station, [string, string]> = {
  lift: ["The lift", "Old Wick works the bell. Pick a depth; every trip down is a fresh shaft."],
  forge: ["The forge", "Turn ore into better gear, or rebuild the forge to work harder metals."],
  shop: ["Pip Tinkerwhistle's Menagerie", "One friend follows you down at a time."],
  trader: ["Moss, the wandering peddler", "He'll be gone by the next trip."],
};

const petSetup = (config: MiningConfig, key: string | null) => {
  const i = key ? config.pets.findIndex((p) => p.key === key) : -1;
  return i >= 0 ? { art: PET_ART[i], key: config.pets[i].key } : null;
};

export function PlayView({
  config,
  state,
  onState,
}: {
  config: MiningConfig;
  state: MiningState;
  onState: (s: MiningState) => void;
}) {
  const trip = state.trip;
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLCanvasElement>(null);
  const hpRef = useRef<HTMLDivElement>(null);
  const hpText = useRef<HTMLSpanElement>(null);
  const gameRef = useRef<Game | null>(null);
  const keys = useRef<Keys>({ ...NO_KEYS });
  const aim = useRef<Aim>(null);
  const cam = useRef({ camX: 0, camY: 0 });
  const inflight = useRef<Promise<void> | null>(null);
  const leaving = useRef(false);
  const seenOres = useRef(new Set(Object.keys(state.mined)));

  const [satchel, setSatchel] = useState<OreCounts>(trip?.satchel ?? {});
  const [depth, setDepth] = useState(trip?.depth ?? 0);
  const [near, setNear] = useState<Station | null>(null);
  const [asleep, setAsleep] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(0);
  const [sealNear, setSealNear] = useState(false);
  const [potions, setPotions] = useState(state.potions);
  const [dream, setDream] = useState("");
  const boltRef = useRef<HTMLDivElement>(null);
  const [sound, setSound] = useState<SoundPrefs>(loadPrefs);

  const toggleSound = (key: keyof SoundPrefs, on: boolean) => {
    const next = { ...sound, [key]: on };
    setSound(next);
    setPrefs(next);
  };

  useEffect(() => {
    if (!asleep) return;
    const dreams = dreamsFor(state.deepestDepth);
    const pick = () => setDream(dreams[Math.floor(Math.random() * dreams.length)]);
    pick();
    const id = setInterval(pick, 15_000);
    return () => clearInterval(id);
  }, [asleep, state.deepestDepth]);

  useEffect(() => {
    preloadSounds();
    startMusic();
    return stopMusic;
  }, []);

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    setSatchel(trip?.satchel ?? {});
    setDepth(trip?.depth ?? 0);
    leaving.current = false;
  }, [trip]);

  useEffect(() => {
    const g = gameRef.current;
    if (!g?.camp) return;
    g.tiers = tiersOf(state);
    g.stats = state.stats;
    g.forgeLevel = state.forgeLevel;
    g.firebolt = state.firebolt;
    g.potions = state.potions;
    g.player.hp = state.stats.maxHp;
    if ((g.pet?.key ?? null) !== state.pet) {
      g.pet = petSetup(config, state.pet);
      g.petActor = g.pet
        ? { art: g.pet.art, key: g.pet.key, px: g.player.x - 1, py: g.player.y, face: 1, nextHit: 0, hopUntil: 0 }
        : null;
    }
  }, [state, config]);

  const resync = useCallback(async () => {
    const s = await getMiningState().catch(() => null);
    if (!s) return;
    const g = gameRef.current;
    if (s.trip && g && !g.camp) {
      loadTrip(g, s.trip, g.now);
      g.pending = { breaks: [], ladders: [], torches: [], kills: 0, mimics: [], drank: 0 };
      setSatchel(s.trip.satchel);
      setDepth(s.trip.depth);
    } else onState(s);
  }, [onState]);

  const flush = useCallback(async () => {
    if (inflight.current) return inflight.current;
    const g = gameRef.current;
    const req = g && !g.camp ? takePending(g) : null;
    if (!g || !req) return;
    const run = (async () => {
      try {
        const res = await dig(req);
        setSatchel(res.satchel);
        g.carried = total(res.satchel);
        for (const key of Object.keys(res.drops)) {
          if (seenOres.current.has(key)) continue;
          seenOres.current.add(key);
          play("discover");
          const ore = config.ores.find((o) => o.key === key);
          if (ore)
            showNotification({
              title: "New ore discovered",
              message: `${ore.name}: ${ore.lore}`,
              color: "yellow",
              autoClose: 6000,
            });
        }
        if (res.deepestDepth !== stateRef.current.deepestDepth)
          onState({ ...stateRef.current, deepestDepth: res.deepestDepth });
        if (res.trip) {
          const broke = res.trip.depth !== g.depth;
          loadTrip(g, res.trip, g.now);
          g.pending = { breaks: [], ladders: [], torches: [], kills: 0, mimics: [], drank: 0 };
          setDepth(res.trip.depth);
          if (broke)
            showNotification({
              title: `You broke through to depth ${res.trip.depth}`,
              message: `${config.depths[res.trip.depth - 1].name}. The lift reaches down here now.`,
              color: "yellow",
            });
        }
      } catch (e) {
        if ((e as { status?: number }).status !== 409)
          showNotification({ title: "The mine rumbles", message: "Couldn't save your last swings.", color: "red" });
        await resync();
      } finally {
        inflight.current = null;
      }
    })();
    inflight.current = run;
    return run;
  }, [config, onState, resync]);

  const finish = useCallback(
    async (fainted: boolean) => {
      if (leaving.current) return;
      leaving.current = true;
      setBusy(true);
      try {
        await inflight.current;
        await flush();
        const banked = total(satchel);
        const s = await (fainted ? faint() : ascend());
        play(fainted ? "faint" : "lift");
        showNotification(
          fainted
            ? {
                title: "You fainted",
                message: "You wake up at camp, sore and lighter. Half your satchel is gone.",
                color: "red",
              }
            : {
                title: "Back at camp",
                message: banked ? `You banked ${compact(banked)} ore.` : "Empty-handed, but alive.",
                color: "yellow",
              },
        );
        onState(s);
      } catch (e) {
        leaving.current = false;
        showNotification({ title: "The lift is stuck", message: (e as Error).message, color: "red" });
      } finally {
        setBusy(false);
      }
    },
    [flush, onState, satchel],
  );

  const finishRef = useRef(finish);
  finishRef.current = finish;
  const flushRef = useRef(flush);
  flushRef.current = flush;
  const onStateRef = useRef(onState);
  onStateRef.current = onState;

  useEffect(() => {
    const canvas = canvasRef.current;
    const text = textRef.current;
    const stage = stageRef.current;
    if (!canvas || !text || !stage) return;
    const s = stateRef.current;
    const g = createGame(
      {
        W: config.mapW,
        H: config.mapH,
        liftX: config.liftX,
        liftY: config.liftY,
        oreHp: config.ores.map((o) => o.hardness),
        oreNames: config.ores.map((o) => o.name),
        oreColors: config.ores.map((o) => o.color),
        depths: config.depths,
        stats: s.stats,
        tiers: tiersOf(s),
        pet: petSetup(config, s.pet),
        forgeLevel: s.forgeLevel,
        firebolt: s.firebolt,
        potions: s.potions,
      },
      trip,
      performance.now(),
    );
    gameRef.current = g;
    const draw = createRenderer(canvas, text);

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const scale = Math.max(2, Math.min(4, Math.round(Math.min(w / 420, h / 220))));
      canvas.width = Math.ceil(w / scale);
      canvas.height = Math.ceil(h / scale);
      canvas.style.width = `${canvas.width * scale}px`;
      canvas.style.height = `${canvas.height * scale}px`;
      const dpr = window.devicePixelRatio || 1;
      text.width = Math.round(canvas.width * scale * dpr);
      text.height = Math.round(canvas.height * scale * dpr);
      text.style.width = canvas.style.width;
      text.style.height = canvas.style.height;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let wasNear: Station | null = null;
    let wasAsleep = false;
    let fainted = false;
    let wasSeal = false;
    let wasPotions = g.potions;
    const frame = (now: number) => {
      acc += Math.min(100, now - last);
      last = now;
      while (acc >= STEP_MS) {
        step(g, STEP_MS, keys.current, aim.current);
        acc -= STEP_MS;
      }
      for (const name of g.sfx) play(name);
      g.sfx.length = 0;
      cam.current = draw(g);
      if (hpRef.current) hpRef.current.style.width = `${Math.max(0, g.player.hp / g.stats.maxHp) * 100}%`;
      if (hpText.current) hpText.current.textContent = `${compact(Math.ceil(g.player.hp))} / ${compact(g.stats.maxHp)}`;
      const n = stationAt(g);
      if (n !== wasNear) {
        wasNear = n;
        setNear(n);
      }
      if (g.asleep !== wasAsleep) {
        wasAsleep = g.asleep;
        setAsleep(g.asleep);
      }
      if (g.found) {
        const n = g.found;
        g.found = 0;
        setReading(n);
        const s = stateRef.current;
        if (!s.pages.includes(n)) onStateRef.current({ ...s, pages: [...s.pages, n] });
      }
      if (g.potions !== wasPotions) {
        wasPotions = g.potions;
        setPotions(g.potions);
      }
      if (boltRef.current) boltRef.current.style.width = `${Math.min(1, 1 - (g.nextBolt - g.now) / BOLT_MS) * 100}%`;
      const sn = !g.camp && g.player.y >= g.H - 4;
      if (sn !== wasSeal) {
        wasSeal = sn;
        setSealNear(sn);
      }
      if (g.fainted && !fainted) {
        fainted = true;
        void finishRef.current(true);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      if (down) {
        noteInput(g);
        startMusic();
      }
      if (ignoreKeys(e)) return;
      const k = KEYMAP[e.code];
      if (k) {
        e.preventDefault();
        keys.current[k] = down;
      }
      if (!down || e.repeat) return;
      if (e.code === "Escape") setReading(0);
      if (e.code === "KeyT" && !g.camp) placeTorch(g);
      if (e.code === "KeyF") castBolt(g, g.hover);
      if (e.code === "KeyQ") drinkPotion(g);
      if (e.code === "KeyE" && !g.camp && stationAt(g) === "lift") void finishRef.current(false);
    };
    const kd = onKey(true);
    const ku = onKey(false);
    const wake = () => {
      noteInput(g);
      startMusic();
    };
    const release = () => {
      keys.current = { ...NO_KEYS };
      aim.current = null;
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    window.addEventListener("pointerdown", wake);
    window.addEventListener("wheel", wake, { passive: true });
    window.addEventListener("blur", release);
    const id = setInterval(() => void flushRef.current(), FLUSH_MS);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(id);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("wheel", wake);
      window.removeEventListener("blur", release);
      const rest = g.camp ? null : takePending(g);
      if (rest && !leaving.current) void dig(rest).catch(() => undefined);
      gameRef.current = null;
    };
  }, [config, trip]);

  const aimAt = (e: React.PointerEvent<HTMLCanvasElement>): Aim => {
    const c = e.currentTarget;
    const r = c.getBoundingClientRect();
    return {
      x: (((e.clientX - r.left) / r.width) * c.width + cam.current.camX) / T,
      y: (((e.clientY - r.top) / r.height) * c.height + cam.current.camY) / T,
    };
  };

  const onTrade = async (item: string) => {
    await inflight.current;
    await flush();
    const s = await trade(item);
    play("buy");
    const g = gameRef.current;
    if (g) {
      g.firebolt = s.firebolt;
      g.potions = s.potions;
    }
    setPotions(s.potions);
    onState({ ...s, trip: stateRef.current.trip });
    showNotification({
      title: item === "firebolt" ? "You learned Firebolt" : "A healing draught, corked and warm",
      message: item === "firebolt" ? "F or right-click to cast it at the cursor." : "Q to drink it.",
      color: "yellow",
    });
  };

  const tiers = tiersOf(state);
  const petIdx = state.pet ? config.pets.findIndex((p) => p.key === state.pet) : -1;
  const carried = total(satchel);
  const full = carried >= state.stats.capacity;
  const props = { config, state, onState };

  return (
    <div className={styles.frame}>
      <aside className={styles.side}>
        <div className={styles.block}>
          <span className={styles.eyebrow}>Gear</span>
          <div className={styles.gear}>
            {GEAR_SLOTS.map((slot) => {
              const info = config.slots.find((x) => x.key === slot);
              const t = tiers[slot];
              return (
                <Tooltip
                  key={slot}
                  multiline
                  w={240}
                  withArrow
                  position="right"
                  label={
                    <>
                      <b>{itemName(slot, t)}</b> · tier {t} / 10
                      <br />
                      {info?.stat}
                      <br />
                      {info && statLine(slot, info.tiers[t].stats)}
                    </>
                  }
                >
                  <button
                    type="button"
                    className={styles.gearSlot}
                    data-tier={t}
                    aria-label={`${itemName(slot, t)}, tier ${t}`}
                  >
                    <Sprite grid={item(slot, t)} scale={2} />
                  </button>
                </Tooltip>
              );
            })}
          </div>
          {state.stats.setBonus > 0 ? (
            <span className={styles.setBonus}>
              <b>{SET_BONUSES[state.stats.setBonus][0]}</b> · {SET_BONUSES[state.stats.setBonus][1]}
            </span>
          ) : (
            <span className={styles.dim}>Wear all five pieces of one metal for a set bonus.</span>
          )}
        </div>

        <div className={styles.block}>
          <div className={styles.barHead}>
            <span className={styles.eyebrow}>Health</span>
            <span ref={hpText} className={styles.barText} />
          </div>
          <div className={styles.bar}>
            <div ref={hpRef} className={styles.hpFill} />
          </div>
        </div>

        {trip ? (
          <div className={styles.block}>
            <div className={styles.barHead}>
              <span className={styles.eyebrow}>Satchel</span>
              <span className={styles.barText}>
                {compact(carried)} / {compact(state.stats.capacity)}
              </span>
            </div>
            <div className={styles.bar}>
              <div
                className={`${styles.satchelFill} ${full ? styles.satchelFull : ""}`}
                style={{ width: `${Math.min(1, carried / state.stats.capacity) * 100}%` }}
              />
            </div>
            <div className={styles.satchelList}>
              {Object.entries(satchel)
                .filter(([, n]) => n > 0)
                .map(([key, n]) => {
                  const i = config.ores.findIndex((o) => o.key === key);
                  return (
                    <span key={key} className={styles.satchelItem} title={config.ores[i]?.name}>
                      <Sprite grid={oreIcon(i)} scale={1} />
                      {compact(n)}
                    </span>
                  );
                })}
              {!carried && <span className={styles.dim}>Empty. Find some ore.</span>}
            </div>
          </div>
        ) : (
          <div className={`${styles.block} ${styles.grow}`}>
            <span className={styles.eyebrow}>Ore pouch</span>
            <OrePouch config={config} state={state} />
          </div>
        )}
      </aside>

      <div ref={stageRef} className={styles.stage}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-label="The game. A and D walk and dig, Space jumps, S digs down, W climbs, click or Enter attacks."
          onPointerDown={(e) => {
            if (e.button === 2) {
              if (gameRef.current) castBolt(gameRef.current, aimAt(e));
              return;
            }
            e.currentTarget.setPointerCapture(e.pointerId);
            aim.current = aimAt(e);
          }}
          onContextMenu={(e) => e.preventDefault()}
          onPointerMove={(e) => {
            const a = aimAt(e);
            if (aim.current) aim.current = a;
            if (gameRef.current) gameRef.current.hover = a;
          }}
          onPointerLeave={() => {
            if (gameRef.current) gameRef.current.hover = null;
          }}
          onPointerUp={() => {
            aim.current = null;
          }}
          onPointerCancel={() => {
            aim.current = null;
          }}
        />

        <canvas ref={textRef} className={`${styles.canvas} ${styles.textLayer}`} aria-hidden />

        {near && (
          <section className={styles.menu} aria-label={MENU_TITLES[near][0]}>
            {trip && near === "trader" ? (
              <>
                <div className={styles.menuHead}>
                  <h2 className={styles.h2}>{MENU_TITLES.trader[0]}</h2>
                  <span className={styles.dim}>{MENU_TITLES.trader[1]} Walk away to close.</span>
                </div>
                <TraderMenu config={config} state={{ ...state, potions }} onTrade={onTrade} />
              </>
            ) : trip ? (
              <div className={styles.liftUp}>
                <div>
                  <h2 className={styles.h2}>The lift</h2>
                  <p className={styles.dim}>
                    {carried ? `Ride up and bank ${compact(carried)} ore.` : "Ride up to camp. Your satchel is empty."}
                  </p>
                </div>
                <button
                  type="button"
                  className={`glass-btn-primary ${styles.actBtn}`}
                  disabled={busy}
                  onClick={() => void finish(false)}
                >
                  Ride the lift up (E)
                </button>
              </div>
            ) : (
              <>
                <div className={styles.menuHead}>
                  <h2 className={styles.h2}>{MENU_TITLES[near][0]}</h2>
                  <span className={styles.dim}>{MENU_TITLES[near][1]} Walk away to close.</span>
                </div>
                {near === "lift" && <LiftMenu {...props} />}
                {near === "forge" && <ForgeMenu {...props} />}
                {near === "shop" && <PetMenu {...props} />}
              </>
            )}
          </section>
        )}

        {reading > 0 && trip && (
          <section className={styles.found} aria-label="A ledger page">
            <LedgerPage n={reading} />
            <button type="button" className={`glass-btn-secondary ${styles.actBtn}`} onClick={() => setReading(0)}>
              Tuck it in your satchel (Esc)
            </button>
          </section>
        )}

        {sealNear && trip && (
          <div className={styles.sealNote}>
            <span className={styles.eyebrow}>
              {depth < 10 ? "Carved into the seal below" : "The bottom of the world"}
            </span>
            <span>{engraving(depth)}</span>
          </div>
        )}

        {asleep && (
          <div className={styles.napNote}>
            <span className={styles.eyebrow}>Zzz… dreaming</span>
            <span className={styles.dream}>{dream}</span>
            <span className={styles.dim}>Press any key to wake up.</span>
          </div>
        )}
      </div>

      <aside className={styles.side}>
        <div className={styles.block}>
          <span className={styles.eyebrow}>{trip ? `Depth ${depth}` : "Camp"}</span>
          <b className={styles.pixel}>{trip ? config.depths[depth - 1]?.name : "The mine entrance"}</b>
          <span className={styles.dim}>
            {trip
              ? "Dig for ore and walk back to the lift to bank it. Break the gold-runed floor to go deeper."
              : "Walk to the lift, the forge or Pip's stall."}
          </span>
        </div>

        {(potions > 0 || state.firebolt) && (
          <div className={styles.block}>
            <span className={styles.eyebrow}>Belt</span>
            <div className={styles.beltItem}>
              <Sprite grid={potionSprite()} scale={2} label="Healing draught" />
              <span className={styles.pixel}>× {potions}</span>
              <kbd>Q</kbd>
            </div>
            {state.firebolt && (
              <div className={styles.beltItem}>
                <Sprite grid={scrollSprite()} scale={2} label="Firebolt" />
                <div className={`${styles.bar} ${styles.grow}`}>
                  <div ref={boltRef} className={styles.boltFill} />
                </div>
                <kbd>F</kbd>
              </div>
            )}
          </div>
        )}

        <div className={styles.block}>
          <span className={styles.eyebrow}>Pet</span>
          {petIdx >= 0 ? (
            <div className={styles.petLine}>
              <Sprite grid={petSprite(PET_ART[petIdx])} scale={2} />
              <div>
                <b className={styles.pixel}>{config.pets[petIdx].name}</b>
                <span className={styles.dim}>{PET_ART[petIdx].does}</span>
              </div>
            </div>
          ) : (
            <span className={styles.dim}>No pet yet. Pip sells them at camp.</span>
          )}
        </div>

        <div className={styles.block}>
          <span className={styles.eyebrow}>Sound</span>
          <Switch
            classNames={SWITCH_CLASSES}
            label="Music"
            checked={sound.music}
            onChange={(e) => toggleSound("music", e.currentTarget.checked)}
          />
          <Switch
            classNames={SWITCH_CLASSES}
            label="Effects"
            checked={sound.sfx}
            onChange={(e) => toggleSound("sfx", e.currentTarget.checked)}
          />
        </div>

        <div className={styles.block}>
          <span className={styles.eyebrow}>Controls</span>
          <div className={styles.keys}>
            <span>
              <kbd>A</kbd>
              <kbd>D</kbd> walk / dig sideways
            </span>
            <span>
              <kbd>Space</kbd> jump
            </span>
            <span>
              <kbd>S</kbd> dig down
            </span>
            <span>
              <kbd>W</kbd> climb, places a ladder
            </span>
            <span>
              <kbd>Click</kbd> or <kbd>Enter</kbd> attack
            </span>
            <span>
              <kbd>T</kbd> torch
            </span>
            {state.firebolt && (
              <span>
                <kbd>F</kbd> or <kbd>Right-click</kbd> firebolt
              </span>
            )}
            <span>
              <kbd>Q</kbd> drink a potion
            </span>
            <span>
              <kbd>E</kbd> ride the lift up
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}

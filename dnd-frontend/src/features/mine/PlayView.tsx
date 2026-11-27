import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Switch } from "@mantine/core";
import { IconSettings, IconTrophy } from "@tabler/icons-react";
import { showNotification } from "@components/Notification/Notification";
import {
  ascend,
  dig,
  faint,
  getMiningState,
  recordFeats,
  trade,
  type MiningConfig,
  type MiningState,
  type OreCounts,
} from "@services/miningService";
import { PET_ART } from "./art/pets";
import {
  ForgeMenu,
  LedgerPage,
  LiftMenu,
  NextGoal,
  OrePouch,
  PanelHead,
  PetMenu,
  TraderMenu,
  type TripReport,
  TripSummary,
} from "./CampMenus";
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
  sayOnce,
  step,
  T,
  takePending,
  resetPending,
  feat,
} from "./engine";
import { achievementsFor, mergeFeats, unlockedNow } from "./achievements";
import { goalsFor, newlyAffordable } from "./goals";
import { compact, tiersOf, total } from "./mine";
import { createRenderer, oreIcon } from "./render";
import { loadPrefs, play, preloadSounds, setPrefs, type SoundPrefs, startMusic, stopMusic } from "./sound";
import { Hotbar } from "./Hotbar";
import { Sprite } from "./Sprite";
import { type AchToast, AchievementToasts, TrophyPanel } from "./Trophies";
import { ARRIVAL, dreamsFor, engraving } from "./story";
import styles from "./Mine.module.css";

const SWITCH_CLASSES = { root: "sq-switch", track: "sq-switch-track", thumb: "sq-switch-thumb" };
const GOAL_OPEN_KEY = "deepdelve-goal-open";
type Panel = "pouch" | "controls" | "settings" | "trophies";
const TOAST_MS = 5000;
const MAX_TOASTS = 3;
const LOW_HP = 0.3;
const STEP_MS = 1000 / 60;
const FLUSH_MS = 1000;
const NO_KEYS: Keys = { left: false, right: false, up: false, down: false, jump: false, attack: false, dash: false };

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
  ShiftLeft: "dash",
  ShiftRight: "dash",
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
  const hpLag = useRef<HTMLDivElement>(null);
  const hpBar = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
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
  const [report, setReport] = useState<TripReport | null>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [goalOpen, setGoalOpen] = useState(() => localStorage.getItem(GOAL_OPEN_KEY) !== "0");
  const togglePanel = (p: Panel) => setPanel((cur) => (cur === p ? null : p));
  const showGoal = (open: boolean) => {
    setGoalOpen(open);
    localStorage.setItem(GOAL_OPEN_KEY, open ? "1" : "0");
  };
  const [torchesUsed, setTorchesUsed] = useState(trip?.torches.length ?? 0);
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

  const achievements = useMemo(() => achievementsFor(config), [config]);
  const [unlocked, setUnlocked] = useState<ReadonlySet<string>>(() => new Set(state.achievements));
  const unlockedRef = useRef(unlocked);
  const [toasts, setToasts] = useState<AchToast[]>([]);
  const readAch = useCallback(
    () => ({ config, state: stateRef.current, feats: mergeFeats(stateRef.current.feats, gameRef.current?.feats) }),
    [config],
  );

  useEffect(() => {
    const next = new Set([...unlockedRef.current, ...state.achievements]);
    if (next.size === unlockedRef.current.size) return;
    unlockedRef.current = next;
    setUnlocked(next);
  }, [state.achievements]);

  useEffect(() => {
    const id = setInterval(() => {
      const g = gameRef.current;
      if (!g || leaving.current) return;
      const fresh = unlockedNow(achievements, readAch(), unlockedRef.current);
      if (!fresh.length) return;
      const ids = fresh.map((a) => a.id);
      unlockedRef.current = new Set([...unlockedRef.current, ...ids]);
      setUnlocked(unlockedRef.current);
      if (g.camp) void recordFeats({ unlocked: ids }).catch(() => undefined);
      else g.pending.unlocked.push(...ids);
      play("achievement");
      const now = Date.now();
      const shown: AchToast[] = fresh.slice(0, MAX_TOASTS).map((a, k) => ({ key: now + k, icon: a.icon, name: a.name }));
      if (fresh.length > MAX_TOASTS)
        shown.push({ key: now + MAX_TOASTS, icon: "🏆", name: `and ${fresh.length - MAX_TOASTS} more` });
      setToasts((cur) => [...cur, ...shown]);
      const keys = new Set(shown.map((t) => t.key));
      setTimeout(() => setToasts((cur) => cur.filter((t) => !keys.has(t.key))), TOAST_MS);
    }, 700);
    return () => clearInterval(id);
  }, [achievements, readAch]);

  useEffect(() => {
    setSatchel(trip?.satchel ?? {});
    setDepth(trip?.depth ?? 0);
    if (trip) setReport(null);
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
      resetPending(g);
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
          resetPending(g);
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
        const g = gameRef.current;
        if (g) {
          feat(g, fainted ? "faint" : "trip");
          if (new Date().getHours() < 5) feat(g, "nightShift");
        }
        await flush();
        const before = stateRef.current;
        const s = await (fainted ? faint() : ascend());
        play(fainted ? "faint" : "lift");
        const haul = Object.fromEntries(
          Object.entries(s.ores).map(([k, n]) => [k, n - (before.ores[k] ?? 0)] as const),
        );
        setReport({
          fainted,
          haul,
          fresh: Object.keys(s.mined).filter((k) => !before.mined[k]),
          ready: newlyAffordable(goalsFor(config, s), before.ores, s.ores),
        });
        if (g) g.feats = {};
        onState(s);
      } catch (e) {
        leaving.current = false;
        showNotification({ title: "The lift is stuck", message: (e as Error).message, color: "red" });
      } finally {
        setBusy(false);
      }
    },
    [config, flush, onState],
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
        hotOre: config.ores.findIndex((o) => o.key === "flametouchedIron"),
        oreColors: config.ores.map((o) => o.color),
        depths: config.depths,
        stats: s.stats,
        tiers: tiersOf(s),
        pet: petSetup(config, s.pet),
        forgeLevel: s.forgeLevel,
        firebolt: s.firebolt,
        potions: s.potions,
        maxTorches: config.maxTorches,
      },
      trip,
      performance.now(),
    );
    if (!trip && s.nodesBroken === 0) sayOnce(g, "arrival", ARRIVAL, "#e8dcc0", 3000);
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
    let wasTorches = -1;
    let seenHurt = g.player.lastHurt;
    let wasLow = false;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      const frac = Math.max(0, g.player.hp / g.stats.maxHp);
      if (hpRef.current) hpRef.current.style.width = `${frac * 100}%`;
      if (hpLag.current) hpLag.current.style.width = `${frac * 100}%`;
      if (g.player.lastHurt !== seenHurt) {
        seenHurt = g.player.lastHurt;
        flashRef.current?.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 450, easing: "ease-out" });
        if (!calm)
          hpBar.current?.animate(
            [
              { transform: "translateX(-4px)" },
              { transform: "translateX(4px)" },
              { transform: "translateX(-2px)" },
              { transform: "none" },
            ],
            { duration: 260 },
          );
      }
      const low = frac > 0 && frac < LOW_HP;
      if (low !== wasLow) {
        wasLow = low;
        hpBar.current?.toggleAttribute("data-low", low);
      }
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
      if (boltRef.current) boltRef.current.style.height = `${Math.max(0, (g.nextBolt - g.now) / BOLT_MS) * 100}%`;
      const used = g.camp ? 0 : g.torches.size;
      if (used !== wasTorches) {
        wasTorches = used;
        setTorchesUsed(used);
      }
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
      if (e.code === "Escape") {
        setReading(0);
        setReport(null);
        setPanel(null);
      }
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

  const carried = total(satchel);
  const full = carried >= state.stats.capacity;
  const props = { config, state, onState };

  return (
    <div className={styles.frame}>
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
        <div ref={flashRef} className={styles.hurtFlash} aria-hidden />

        <div className={styles.hudLeft}>
          <span className={styles.hudTitle}>
            {trip ? `Depth ${depth} · ${config.depths[depth - 1]?.name ?? ""}` : "Camp · The mine entrance"}
          </span>
          {trip && (
            <>
              <div className={styles.hudRow}>
                <span className={styles.hudLabel}>Satchel</span>
                <div className={`${styles.bar} ${styles.grow}`}>
                  <div
                    className={`${styles.satchelFill} ${full ? styles.satchelFull : ""}`}
                    style={{ width: `${Math.min(1, carried / state.stats.capacity) * 100}%` }}
                  />
                </div>
                <span className={styles.barText}>
                  {compact(carried)} / {compact(state.stats.capacity)}
                </span>
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
              </div>
            </>
          )}
        </div>

        <AchievementToasts toasts={toasts} />
        <div className={styles.hudRight}>
          <div className={styles.btnRow}>
            {!trip && (
              <button
                type="button"
                className={`glass-btn-secondary ${styles.hudBtn}`}
                onClick={() => togglePanel("pouch")}
              >
                {panel === "pouch" ? "Hide ore pouch" : "Ore pouch"}
              </button>
            )}
            {!goalOpen && (
              <button type="button" className={`glass-btn-secondary ${styles.hudBtn}`} onClick={() => showGoal(true)}>
                Show goal
              </button>
            )}
            <button
              type="button"
              className={`glass-btn-secondary ${styles.hudBtn}`}
              onClick={() => togglePanel("controls")}
            >
              {panel === "controls" ? "Hide controls" : "Show controls"}
            </button>
            <button
              type="button"
              className={`${panel === "trophies" ? "glass-btn-primary" : "glass-btn-secondary"} ${styles.gearBtn}`}
              aria-label="Achievements"
              aria-pressed={panel === "trophies"}
              onClick={() => togglePanel("trophies")}
            >
              <IconTrophy size={18} />
            </button>
            <button
              type="button"
              className={`${panel === "settings" ? "glass-btn-primary" : "glass-btn-secondary"} ${styles.gearBtn}`}
              aria-label="Settings"
              aria-pressed={panel === "settings"}
              onClick={() => togglePanel("settings")}
            >
              <IconSettings size={18} />
            </button>
          </div>

          {panel === "trophies" && (
            <TrophyPanel list={achievements} read={readAch} unlocked={unlocked} onClose={() => setPanel(null)} />
          )}

          {panel === "settings" && (
            <section className={styles.hudPanel} aria-label="Settings">
              <PanelHead title="Settings" onClose={() => setPanel(null)} />
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
            </section>
          )}

          {panel === "controls" && (
            <section className={styles.hudPanel} aria-label="Controls">
              <PanelHead title="Controls" onClose={() => setPanel(null)} />
              <span className={styles.dim}>
                {trip
                  ? "Dig for ore and walk back to the lift to bank it. Break the gold-runed floor to go deeper."
                  : "Walk to the lift, the forge or Pip's stall."}
              </span>
              <span className={styles.dim}>
                Monsters flash a red ! before they bite: step back or dash away. Every third hit in a row smashes,
                and hits from a jump land harder.
              </span>
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
                  <kbd>Click</kbd> or <kbd>Enter</kbd> attack and mine
                </span>
                <span>
                  <kbd>Shift</kbd> dash, dodges hits
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
                <span>
                  <kbd>Esc</kbd> close panels
                </span>
              </div>
            </section>
          )}

          {panel === "pouch" && !trip && (
            <section className={styles.hudPanel} aria-label="Ore pouch">
              <PanelHead title="Ore pouch" onClose={() => setPanel(null)} />
              <OrePouch config={config} state={state} />
            </section>
          )}

          {goalOpen && (
            <NextGoal config={config} state={state} satchel={trip ? satchel : {}} onClose={() => showGoal(false)} />
          )}
        </div>

        {near && !(report && !trip) && (
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

        <Hotbar
          config={config}
          state={state}
          potions={potions}
          torchesLeft={config.maxTorches ? config.maxTorches - torchesUsed : null}
          inMine={!!trip}
          boltRef={boltRef}
          top={
            <div className={styles.hpDock}>
              <span className={styles.hudLabel}>Health</span>
              <div ref={hpBar} className={`${styles.bar} ${styles.hpBar}`}>
                <div ref={hpLag} className={styles.hpLag} />
                <div ref={hpRef} className={styles.hpFill} />
              </div>
              <span ref={hpText} className={styles.barText} />
            </div>
          }
        />

        {report && !trip && (
          <TripSummary {...props} report={report} onClose={() => setReport(null)} />
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
    </div>
  );
}

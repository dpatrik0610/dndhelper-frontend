import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconSettings, IconTrophy, IconUserShield } from "@tabler/icons-react";
import { play, preloadSounds, startMusic, stopMusic } from "@features/mine/sound";
import { SoundSettings } from "@features/mine/SoundSettings";
import {
  ascend,
  descend,
  dig,
  dropOre,
  equipGear,
  followPet,
  faint,
  getMiningState,
  mossSell,
  recallHome,
  recordFeats,
  reviveDelver,
  takePile,
  trade,
  type MiningConfig,
  type MiningState,
  type OreCounts,
} from "@services/miningService";
import { DIAMOND, MAGMA_CORE, MATERIALS } from "./art/materials";
import { PET_ART } from "./art/pets";
import {
  ChurchMenu,
  ForgeMenu,
  SmithMenu,
  LedgerPage,
  LiftMenu,
  NextGoal,
  OrePouch,
  PanelHead,
  HouseMenu,
  MarketMenu,
  PetMenu,
  Purse,
  TraderMenu,
  type TripReport,
  TripSummary,
} from "./CampMenus";
import {
  type Aim,
  BOLT_MS,
  castBolt,
  createGame,
  showLoot,
  drinkPotion,
  type Game,
  type Keys,
  loadTrip,
  OVERLOADED,
  noteInput,
  bombKey,
  type Drink,
  placeTorch,
  revive,
  setBlessings,
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
import { goalsFor, newlyAffordable, withSatchel } from "./goals";
import { compact, tiersOf, total, viewOf } from "./mine";
import { createRenderer, FINE, oreIcon } from "./render";
import { CharacterPanel } from "./CharacterPanel";
import { Effects } from "./Effects";
import { Hotbar } from "./Hotbar";
import { DropOre, LootPile } from "./LootPile";
import { Sprite } from "./Sprite";
import { NoteLog } from "./NoteLog";
import { QuestTracker, ShipMenu } from "./Quests";
import { isActive, lapsed, newlyDone } from "./jobs";
import { pushNote } from "./notes";
import { TrophyPanel } from "./Trophies";
import { ARRIVAL, dreamsFor, engraving } from "./story";
import styles from "./Mine.module.css";

const GOAL_OPEN_KEY = "deepdelve-goal-open";
const JOBS_OPEN_KEY = "deepdelve-jobs-open";
type Panel = "pouch" | "controls" | "settings" | "trophies" | "character" | "drop";
const MAX_TOASTS = 3;
const LOW_HP = 0.3;
const STEP_MS = 1000 / 60;
const FLUSH_MS = 1000;
const TRADE_NOTES: Record<string, [string, string]> = {
  firebolt: ["You learned Firebolt", "F or right-click to cast it at the cursor."],
  fireball: ["Your Firebolt is a Fireball now", "5× damage, and it bursts on every monster within 2 tiles."],
  torch: ["A torch, a little damp", "T to plant it."],
  potion: ["A healing draught, corked and warm", "Q to drink it."],
  bomb: ["A blasting bomb", "B readies it, B again lights it at the cursor. Stand clear of the ring."],
  chart: ["Prospector's Chart", "Every treasure on this level is marked with an X."],
  oil: ["Lamp Oil", "Your lantern burns half again as far until you leave this level."],
  magmaCore: ["Magma Core", "Still warm. It's safe in your stores."],
};
const DRINK_KEY = "deepdelve.drink";
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
  lift: [
    "The lift",
    "Old Wick works the bell. Pick a depth, or press its number key; every trip down is a fresh shaft.",
  ],
  forge: ["The forge", "Smelt ore into alloy bars, or rebuild the forge to burn hot enough for harder metals."],
  smith: ["Thora's Smithy", "Thora Anvilsong turns your ore and alloy bars into better gear."],
  market: ["Hesk Saltpenny's Market", "Ore for coin, coin for torches and tonics. Hesk weighs everything twice."],
  shop: ["Pip Tinkerwhistle's Menagerie", "One friend follows you down at a time."],
  house: ["Home", "Your own four walls on Saltbell Isle. Coin makes them grander."],
  church: ["Saltbell Chapel", "Sister Maren keeps a candle lit for every delver below. Coin buys blessings, scrolls and draughts."],
  ship: ["The Obsidian Gale", "Captain Morg pays well for ore, alloy bars and monster hunts, as long as you beat the clock."],
  trader: ["Moss, the wandering peddler", "He'll be gone by the next trip."],
};

const TALK: Record<Station, string> = {
  lift: "Call the lift",
  forge: "Use the forge",
  smith: "Talk to Thora",
  market: "Talk to Hesk",
  shop: "Visit Pip",
  house: "Go inside",
  church: "Talk to Sister Maren",
  ship: "Talk to Captain Morg",
  trader: "Talk to Moss",
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
  const resizeRef = useRef<(() => void) | null>(null);
  const setBonus = state.stats.setBonus;
  useEffect(() => {
    if (setBonus >= 0) resizeRef.current?.();
  }, [setBonus]);
  const keys = useRef<Keys>({ ...NO_KEYS });
  const aim = useRef<Aim>(null);
  const cam = useRef({ camX: 0, camY: 0 });
  const inflight = useRef<Promise<void> | null>(null);
  const leaving = useRef(false);
  const seenOres = useRef(new Set(Object.keys(state.mined)));

  const [satchel, setSatchel] = useState<OreCounts>(trip?.satchel ?? {});
  const [pile, setPile] = useState<OreCounts>(trip?.pile ?? {});
  const [pileOpen, setPileOpen] = useState(false);
  const pileSize = useRef(total(trip?.pile ?? {}));
  const notePile = useCallback((next: OreCounts) => {
    const n = total(next);
    if (n > pileSize.current) setPileOpen(true);
    pileSize.current = n;
    setPile(next);
  }, []);
  const [depth, setDepth] = useState(trip?.depth ?? 0);
  const [near, setNear] = useState<Station | null>(null);
  const [opened, setOpened] = useState<Station | null>(null);
  const [asleep, setAsleep] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(0);
  const [sealNear, setSealNear] = useState(false);
  const [potions, setPotions] = useState(state.potions);
  const [downed, setDowned] = useState(false);
  const [bombs, setBombs] = useState(state.bombs ?? 0);
  const [greater, setGreater] = useState(state.greaterPotions ?? 0);
  const [drink, setDrink] = useState<Drink>(() => (localStorage.getItem(DRINK_KEY) === "greater" ? "greater" : "potion"));
  const pickDrink = (d: Drink) => {
    setDrink(d);
    localStorage.setItem(DRINK_KEY, d);
    if (gameRef.current) gameRef.current.drink = d;
  };
  const downedRef = useRef(false);
  const [mossWares, setMossWares] = useState<Record<string, number> | null>(null);
  const [dream, setDream] = useState("");
  const [report, setReport] = useState<TripReport | null>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [started, setStarted] = useState(false);
  const firstLoad = useRef(true);
  const startedRef = useRef(false);
  const begin = useRef(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStarted(true);
    startMusic();
    play("lift");
  }).current;
  const [goalOpen, setGoalOpen] = useState(() => localStorage.getItem(GOAL_OPEN_KEY) !== "0");
  const [jobsOpen, setJobsOpen] = useState(() => localStorage.getItem(JOBS_OPEN_KEY) !== "0");
  const showJobs = (open: boolean) => {
    setJobsOpen(open);
    localStorage.setItem(JOBS_OPEN_KEY, open ? "1" : "0");
  };
  const hasJobs = (state.quests ?? []).some(isActive);
  const togglePanel = (p: Panel) => setPanel((cur) => (cur === p ? null : p));
  const showGoal = (open: boolean) => {
    setGoalOpen(open);
    localStorage.setItem(GOAL_OPEN_KEY, open ? "1" : "0");
  };
  const [torchesUsed, setTorchesUsed] = useState(trip?.torches.length ?? 0);
  const [torchCap, setTorchCap] = useState(state.torchStock + (trip?.torches.length ?? 0));
  const boltRef = useRef<HTMLDivElement>(null);

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
    return stopMusic;
  }, []);

  const stateRef = useRef(state);
  stateRef.current = state;

  const achievements = useMemo(() => achievementsFor(config), [config]);
  const [unlocked, setUnlocked] = useState<ReadonlySet<string>>(() => new Set(state.achievements));
  const unlockedRef = useRef(unlocked);
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
      for (const a of fresh.slice(0, MAX_TOASTS))
        pushNote({ icon: a.icon, title: a.name, text: "Achievement unlocked", color: "#f5c542" });
      if (fresh.length > MAX_TOASTS)
        pushNote({ icon: "🏆", title: `and ${fresh.length - MAX_TOASTS} more`, text: "Achievements unlocked", color: "#f5c542" });
    }, 700);
    return () => clearInterval(id);
  }, [achievements, readAch]);

  useEffect(() => {
    setSatchel(trip?.satchel ?? {});
    setPile(trip?.pile ?? {});
    pileSize.current = total(trip?.pile ?? {});
    setPileOpen(false);
    setDepth(trip?.depth ?? 0);
    setMossWares(null);
    if (trip) setReport(null);
    leaving.current = false;
  }, [trip]);

  useEffect(() => {
    const g = gameRef.current;
    if (g) setBlessings(g, state.blessings);
  }, [state.blessings]);

  useEffect(() => {
    const g = gameRef.current;
    if (!g?.camp) return;
    g.tiers = tiersOf(state);
    g.stats = state.stats;
    g.forgeLevel = state.forgeLevel;
    g.houseLevel = state.houseLevel;
    g.firebolt = state.firebolt;
    g.fireball = !!state.fireball;
    g.potions = state.potions;
    g.bombs = state.bombs ?? 0;
    g.greater = state.greaterPotions ?? 0;
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
      g.bombs = s.bombs ?? 0;
      g.greater = s.greaterPotions ?? 0;
      setSatchel(s.trip.satchel);
      notePile(s.trip.pile ?? {});
      setDepth(s.trip.depth);
    } else onState(s);
  }, [onState, notePile]);

  const flush = useCallback(async () => {
    if (inflight.current) return inflight.current;
    const g = gameRef.current;
    const req = g && !g.camp ? takePending(g) : null;
    if (!g || !req) return;
    const run = (async () => {
      try {
        const res = await dig(req);
        const before = stateRef.current;
        const next = { ...before, deepestDepth: res.deepestDepth };
        setSatchel(res.satchel);
        g.carried = total(res.satchel);
        if (res.pile) notePile(res.pile);
        for (const key of Object.keys(res.drops)) {
          if (seenOres.current.has(key)) continue;
          seenOres.current.add(key);
          play("discover");
          const ore = config.ores.find((o) => o.key === key);
          if (ore)
            pushNote({
              title: "New ore discovered",
              text: `${ore.name}: ${ore.lore}`,
              color: "#ffd77a",
            });
        }
        if (res.cores) {
          next.ores = { ...next.ores, [MAGMA_CORE]: (next.ores[MAGMA_CORE] ?? 0) + res.cores };
          play("jackpot");
          pushNote({
            title: res.cores > 1 ? `${res.cores} Magma Cores` : "Magma Core",
            text: MATERIALS[MAGMA_CORE].lore,
            color: "#ffb347",
          });
        }
        if (res.diamonds) {
          const n = res.diamonds;
          next.ores = { ...next.ores, [DIAMOND]: (next.ores[DIAMOND] ?? 0) + n };
          next.mined = { ...next.mined, [DIAMOND]: (next.mined[DIAMOND] ?? 0) + n };
          pushNote({
            title: n > 1 ? `${n} diamonds!` : "A diamond!",
            text: `It's safe in your stores already. Hesk pays ${compact(next.prices[DIAMOND] ?? 0)} coins apiece, or keep it for your collection.`,
            color: "#c4f4ff",
          });
        }
        if (res.wyrmCoins) {
          next.coins += res.wyrmCoins;
          if (res.bag) next.ores = { ...next.ores, bagOfHolding: 1 };
          play("jackpot");
          pushNote({
            title: "The Ashen Wyrm is slain!",
            text: `Its hoard is yours: ${compact(res.wyrmCoins)} coins, banked already.${res.bag ? ` You found a Bag of Holding too. ${MATERIALS.bagOfHolding.lore}` : ""}`,
            color: "#ffb347",
          });
        }
        if (!res.trip || res.trip.depth === g.depth)
          for (const find of res.loot ?? [])
            showLoot(
              g,
              find.i,
              Object.entries(find.ores)
                .map(([key, n]) => ({ index: config.ores.findIndex((o) => o.key === key), n }))
                .filter((o) => o.index >= 0 && o.n > 0),
            );
        if (res.quests) {
          const finished = newlyDone(before.quests, res.quests, withSatchel(next.ores, res.satchel));
          for (const q of lapsed(before.quests, res.quests))
            pushNote({ title: `Time's up: ${q.title}`, text: "Captain Morg gave the job to someone else.", color: "#ff8a6a" });
          next.quests = res.quests;
          for (const q of finished) {
            play("jackpot");
            pushNote({ title: `Job done: ${q.title}`, text: "Bank your haul and hand it in to Captain Morg at the docks.", color: "#9fe09a" });
          }
        }
        if (res.quests || res.cores || res.diamonds || res.wyrmCoins || next.deepestDepth !== before.deepestDepth)
          onState(next);
        if (res.trip) {
          const broke = res.trip.depth !== g.depth;
          loadTrip(g, res.trip, g.now);
          resetPending(g);
          setDepth(res.trip.depth);
          if (broke)
            pushNote({
              title: `You broke through to depth ${res.trip.depth}`,
              text: `${config.depths[res.trip.depth - 1].name}. The lift reaches down here now.`,
              color: "#ffd77a",
            });
        }
      } catch (e) {
        if ((e as { status?: number }).status !== 409)
          pushNote({ title: "The mine rumbles", text: "Couldn't save your last swings.", color: "#ff8a6a" });
        await resync();
      } finally {
        inflight.current = null;
      }
    })();
    inflight.current = run;
    return run;
  }, [config, notePile, onState, resync]);

  const finish = useCallback(
    async (fainted: boolean, next = 0, recall = false) => {
      if (leaving.current) return;
      leaving.current = true;
      setBusy(true);
      const g = gameRef.current;
      if (g && !fainted) {
        g.riding = true;
        play(recall ? "potion" : "lift");
      }
      try {
        await inflight.current;
        if (g) {
          feat(g, fainted ? "faint" : "trip");
          if (new Date().getHours() < 5) feat(g, "nightShift");
        }
        await flush();
        const before = stateRef.current;
        const s = await (fainted ? faint() : recall ? recallHome() : ascend());
        if (fainted) play("faint");
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
        if (next) onState(await descend(next));
      } catch (e) {
        leaving.current = false;
        if (g) g.riding = false;
        pushNote({ title: "The lift is stuck", text: (e as Error).message, color: "#ff8a6a" });
      } finally {
        setBusy(false);
      }
    },
    [config, flush, onState],
  );

  const finishRef = useRef(finish);
  finishRef.current = finish;

  const standUp = async (use: boolean) => {
    if (!downedRef.current) return;
    downedRef.current = false;
    setDowned(false);
    const g = gameRef.current;
    if (!use || !g) return void finish(true);
    try {
      await inflight.current;
      await flush();
      const s = await reviveDelver();
      revive(g);
      onState({ ...s, trip: stateRef.current.trip });
    } catch (e) {
      pushNote({ title: "The scroll crumbles", text: (e as Error).message, color: "#ff8a6a" });
      void finish(true);
    }
  };
  const standRef = useRef(standUp);
  standRef.current = standUp;

  const rideTo = async (n: number) => {
    const g = gameRef.current;
    if (!g || leaving.current || n > config.depths.length) return;
    if (n > stateRef.current.deepestDepth) {
      pushNote({ title: `Depth ${n} is sealed`, text: "Break the seal above it first.", color: "#ff8a6a" });
      return;
    }
    if (!g.camp) return finish(false, n);
    leaving.current = true;
    setBusy(true);
    try {
      const s = await descend(n);
      play("lift");
      onState(s);
    } catch (e) {
      leaving.current = false;
      pushNote({ title: "The lift is stuck", text: (e as Error).message, color: "#ff8a6a" });
    } finally {
      setBusy(false);
    }
  };
  const rideRef = useRef(rideTo);
  rideRef.current = rideTo;
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
        shockOre: config.ores.findIndex((o) => o.key === "hizagkuur"),
        glowOre: config.ores.findIndex((o) => o.key === "byeshk"),
        oreColors: config.ores.map((o) => o.color),
        depths: config.depths,
        stats: s.stats,
        tiers: tiersOf(s),
        pet: petSetup(config, s.pet),
        forgeLevel: s.forgeLevel,
        houseLevel: s.houseLevel,
        firebolt: s.firebolt,
        fireball: !!s.fireball,
        potions: s.potions,
        bombs: s.bombs ?? 0,
        greater: s.greaterPotions ?? 0,
        drink: localStorage.getItem(DRINK_KEY) === "greater" ? "greater" : "potion",
        maxTorches: s.torchStock + (trip?.torches.length ?? 0),
        overload: config.overload,
      },
      trip,
      performance.now(),
      !trip && firstLoad.current,
    );
    firstLoad.current = false;
    setBlessings(g, s.blessings);
    if (!trip && s.nodesBroken === 0) sayOnce(g, "arrival", ARRIVAL, "#e8dcc0");
    setTorchCap(g.maxTorches);
    gameRef.current = g;
    const draw = createRenderer(canvas, text);

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const scale =
        Math.max(2, Math.min(4, Math.round(Math.min(w / 420, h / 220)))) / viewOf(stateRef.current.stats.setBonus);
      canvas.width = Math.ceil(w / scale) * FINE;
      canvas.height = Math.ceil(h / scale) * FINE;
      canvas.style.width = `${(canvas.width / FINE) * scale}px`;
      canvas.style.height = `${(canvas.height / FINE) * scale}px`;
      const dpr =
        (window.devicePixelRatio || 1) * ((stage as HTMLElement & { currentCSSZoom?: number }).currentCSSZoom ?? 1);
      text.width = Math.round((canvas.width / FINE) * scale * dpr);
      text.height = Math.round((canvas.height / FINE) * scale * dpr);
      text.style.width = canvas.style.width;
      text.style.height = canvas.style.height;
    };
    resize();
    resizeRef.current = resize;
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
    let wasBombs = -1;
    let wasGreater = -1;
    let wasTorches = -1;
    let seenHurt = g.player.lastHurt;
    let wasLow = false;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = (now: number) => {
      acc += Math.min(100, now - last);
      last = now;
      while (acc >= STEP_MS) {
        if (startedRef.current) step(g, STEP_MS, keys.current, aim.current);
        else {
          g.now += STEP_MS;
          g.lastInput = g.now;
        }
        acc -= STEP_MS;
      }
      for (const name of g.sfx) play(name);
      g.sfx.length = 0;
      for (const n of g.notes) pushNote(n);
      g.notes.length = 0;
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
        setOpened(null);
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
      if ((g.greater ?? 0) !== wasGreater) {
        wasGreater = g.greater ?? 0;
        setGreater(wasGreater);
      }
      if ((g.bombs ?? 0) !== wasBombs) {
        wasBombs = g.bombs ?? 0;
        setBombs(wasBombs);
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
        if (!g.camp && (stateRef.current.revives ?? 0) > 0) {
          downedRef.current = true;
          setDowned(true);
        } else void finishRef.current(true);
      } else if (!g.fainted && fainted) fainted = false;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      if (!startedRef.current) {
        if (down && !ignoreKeys(e) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          begin();
        }
        return;
      }
      if (down) {
        noteInput(g);
        startMusic();
      }
      if (ignoreKeys(e)) return;
      if (downedRef.current) {
        if (down && !e.repeat && e.code === "KeyR") void standRef.current(true);
        if (down && !e.repeat && (e.code === "KeyE" || e.code === "Escape")) void standRef.current(false);
        return;
      }
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
        setOpened(null);
        g.bombArmed = false;
      }
      if (e.code === "KeyT" && !g.camp) placeTorch(g);
      if (e.code === "KeyF") castBolt(g, g.hover);
      if (e.code === "KeyQ") drinkPotion(g);
      if (e.code === "KeyB") bombKey(g);
      if (e.code === "KeyR" && !g.camp && !g.fainted && (stateRef.current.recalls ?? 0) > 0) void finishRef.current(false, 0, true);
      const floor = /^Digit\d$/.test(e.code) ? Number(e.code.slice(5)) || 10 : 0;
      if (floor && stationAt(g) === "lift") void rideRef.current(floor);
      const station = e.code === "KeyE" ? stationAt(g) : null;
      if (station && !g.camp && station === "lift") void finishRef.current(false);
      else if (station) setOpened((cur) => (cur === station ? null : station));
    };
    const kd = onKey(true);
    const ku = onKey(false);
    const wake = () => {
      if (!startedRef.current) return;
      noteInput(g);
      startMusic();
    };
    const bye = () => {
      const rest = g.camp || leaving.current ? null : takePending(g);
      if (rest) void dig(rest, true).catch(() => undefined);
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
    window.addEventListener("pagehide", bye);
    const id = setInterval(() => void flushRef.current(), FLUSH_MS);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      resizeRef.current = null;
      clearInterval(id);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("wheel", wake);
      window.removeEventListener("blur", release);
      window.removeEventListener("pagehide", bye);
      const rest = g.camp ? null : takePending(g);
      if (rest && !leaving.current) void dig(rest).catch(() => undefined);
      gameRef.current = null;
    };
  }, [config, trip, begin]);

  const aimAt = (e: React.PointerEvent<HTMLCanvasElement>): Aim => {
    const c = e.currentTarget;
    const r = c.getBoundingClientRect();
    return {
      x: (((e.clientX - r.left) / r.width) * (c.width / FINE) + cam.current.camX) / T,
      y: (((e.clientY - r.top) / r.height) * (c.height / FINE) + cam.current.camY) / T,
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
      g.fireball = !!s.fireball;
      g.potions = s.potions;
      g.bombs = s.bombs ?? 0;
      g.greater = s.greaterPotions ?? 0;
      g.boons = new Set(s.trip?.boons ?? []);
      if (item === "torch") {
        g.maxTorches++;
        setTorchCap(g.maxTorches);
      }
    }
    setPotions(s.potions);
    setMossWares(s.trip?.wares ?? null);
    onState({ ...s, trip: stateRef.current.trip });
    const [title, message] = TRADE_NOTES[item] ?? TRADE_NOTES.potion;
    pushNote({ title, text: message, color: "#ffd77a" });
  };

  const onTakePile = async (take: OreCounts) => {
    await inflight.current;
    await flush();
    try {
      const s = await takePile(take);
      onState({ ...s, trip: stateRef.current.trip });
      play("buy");
      const now = s.trip?.satchel ?? {};
      setSatchel(now);
      const g = gameRef.current;
      if (g) g.carried = total(now);
      pileSize.current = total(s.trip?.pile ?? {});
      setPile(s.trip?.pile ?? {});
      setPileOpen(false);
    } catch (e) {
      pushNote({ title: "Can't take that", text: (e as Error).message, color: "#ff8a6a" });
    }
  };

  const onMossSell = async (key: string, amount: number) => {
    await inflight.current;
    await flush();
    const s = await mossSell(key, amount);
    play("buy");
    const left = s.trip?.satchel ?? {};
    setSatchel(left);
    const g = gameRef.current;
    if (g) g.carried = total(left);
    onState({ ...s, trip: stateRef.current.trip });
  };

  const onDrop = async (drop: OreCounts) => {
    await inflight.current;
    await flush();
    let s: MiningState | null = null;
    try {
      for (const [key, n] of Object.entries(drop)) if (n > 0) s = await dropOre(key, n);
    } catch (e) {
      pushNote({ title: "Can't drop that", text: (e as Error).message, color: "#ff8a6a" });
      s = await getMiningState().catch(() => null);
    }
    if (!s?.trip) return;
    play("land");
    const left = s.trip.satchel;
    setSatchel(left);
    const g = gameRef.current;
    if (g) g.carried = total(left);
    pileSize.current = total(s.trip.pile ?? {});
    setPile(s.trip.pile ?? {});
  };

  const swap = async (work: () => Promise<MiningState>) => {
    try {
      onState(await work());
      play("buy");
    } catch (e) {
      pushNote({ title: "Can't swap that", text: (e as Error).message, color: "#ff8a6a" });
    }
  };

  const carried = total(satchel);
  const full = carried > state.stats.capacity;
  const maxCarry = Math.floor(state.stats.capacity * config.overload);
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
        {!started && (
          <button type="button" className={styles.startScreen} onClick={begin}>
            <span className={styles.eyebrow}>Saltbell Isle · beneath the Anvil</span>
            <span className={styles.startTitle}>The Deepdelve</span>
            <span className={styles.startHint}>Click to start</span>
            <span className={styles.dim}>or press any key</span>
          </button>
        )}
        <div ref={flashRef} className={styles.hurtFlash} aria-hidden />

        <div className={styles.hudLeft}>
          <span className={styles.hudTitle}>
            {trip ? `Depth ${depth} · ${config.depths[depth - 1]?.name ?? ""}` : "Camp · Saltbell Isle"}
          </span>
          {!trip && <Purse coins={state.coins} />}
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
              {full && (
                <span className={styles.encumbered}>
                  Encumbered: the more you carry, the slower you go.{" "}
                  {carried - state.stats.capacity >= (maxCarry - state.stats.capacity) * OVERLOADED
                    ? "Overloaded: no jumping or dashing."
                    : `Past ${compact(Math.ceil(state.stats.capacity + (maxCarry - state.stats.capacity) * OVERLOADED))} you can't jump.`}{" "}
                  {carried >= maxCarry ? "Can't carry more." : `Max ${compact(maxCarry)}.`}
                </span>
              )}
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
              {carried > 0 && (
                <button
                  type="button"
                  className={`glass-btn-secondary ${styles.hudBtn} ${styles.hudLeftAct}`}
                  aria-pressed={panel === "drop"}
                  onClick={() => togglePanel("drop")}
                >
                  {panel === "drop" ? "Hide drop ore" : "Drop ore"}
                </button>
              )}
              {panel === "drop" && carried > 0 && (
                <div className={`${styles.hudLeftAct} ${styles.hudLeftPanel}`}>
                  <DropOre
                    config={config}
                    satchel={satchel}
                    capacity={state.stats.capacity}
                    onDrop={onDrop}
                    onClose={() => setPanel(null)}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <NoteLog />
        <div className={styles.hudRight}>
          <div className={styles.btnRow}>
            {trip && total(pile) > 0 && !pileOpen && (
              <button type="button" className={`glass-btn-primary ${styles.hudBtn}`} onClick={() => setPileOpen(true)}>
                Loot pile · {compact(total(pile))}
              </button>
            )}
            {!trip && (
              <button
                type="button"
                className={`glass-btn-secondary ${styles.hudBtn}`}
                onClick={() => togglePanel("pouch")}
              >
                {panel === "pouch" ? "Hide ore pouch" : "Ore pouch"}
              </button>
            )}
            {hasJobs && !jobsOpen && (
              <button type="button" className={`glass-btn-secondary ${styles.hudBtn}`} onClick={() => showJobs(true)}>
                Show jobs
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
              className={`${panel === "character" ? "glass-btn-primary" : "glass-btn-secondary"} ${styles.gearBtn}`}
              aria-label="Character"
              aria-pressed={panel === "character"}
              onClick={() => togglePanel("character")}
            >
              <IconUserShield size={18} />
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

          {trip && pileOpen && total(pile) > 0 && (
            <LootPile
              key={JSON.stringify(pile)}
              config={config}
              pile={pile}
              carried={carried}
              capacity={state.stats.capacity}
              maxCarry={maxCarry}
              onTake={onTakePile}
              onClose={() => setPileOpen(false)}
            />
          )}

          {panel === "character" && <CharacterPanel config={config} state={state} onClose={() => setPanel(null)} />}

          {panel === "trophies" && (
            <TrophyPanel list={achievements} read={readAch} unlocked={unlocked} onClose={() => setPanel(null)} />
          )}

          {panel === "settings" && <SoundSettings onClose={() => setPanel(null)} />}

          {panel === "controls" && (
            <section className={styles.hudPanel} aria-label="Controls">
              <PanelHead title="Controls" onClose={() => setPanel(null)} />
              <span className={styles.dim}>
                {trip
                  ? "Dig for ore and walk back to the lift to bank it. Break the gold-runed floor to go deeper."
                  : "Walk to the lift, the forge, Thora's smithy or Pip's stall."}
              </span>
              <span className={styles.dim}>
                Monsters flash a red ! before they bite: step back or dash away. Every third hit in a row smashes, and
                hits from a jump land harder.
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
                  <kbd>Shift</kbd> dash, dodges hits and strikes anything you pass through
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
                  <kbd>E</kbd> talk, use, or ride the lift up
                </span>
                <span>
                  <kbd>1</kbd>–<kbd>0</kbd> at the lift: ride to that depth
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

          {hasJobs && jobsOpen && (
            <QuestTracker config={config} state={state} satchel={trip ? satchel : undefined} onClose={() => showJobs(false)} />
          )}
        </div>

        {near && !(report && !trip) && !(trip && near === "lift") && opened !== near && (
          <button type="button" className={`glass-btn-primary ${styles.talkBtn}`} onClick={() => setOpened(near)}>
            <kbd>E</kbd> {TALK[near]}
          </button>
        )}

        {near && !(report && !trip) && ((trip && near === "lift") || opened === near) && (
          <section className={styles.menu} aria-label={MENU_TITLES[near][0]}>
            {trip && near === "trader" ? (
              <>
                <div className={styles.menuHead}>
                  <h2 className={styles.h2}>{MENU_TITLES.trader[0]}</h2>
                  <span className={styles.dim}>{MENU_TITLES.trader[1]} Press E or walk away to close.</span>
                </div>
                <TraderMenu
                  config={config}
                  state={{ ...state, potions, trip: trip && { ...trip, wares: mossWares ?? trip.wares } }}
                  satchel={satchel}
                  onTrade={onTrade}
                  onSell={onMossSell}
                />
              </>
            ) : trip ? (
              <div className={styles.liftUp}>
                <div>
                  <h2 className={styles.h2}>The lift</h2>
                  <p className={styles.dim}>
                    {carried ? `Ride up and bank ${compact(carried)} ore.` : "Ride up to camp. Your satchel is empty."}{" "}
                    Or press a depth's number key to bank and ride straight down there.
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
                  <span className={styles.dim}>{MENU_TITLES[near][1]} Press E or walk away to close.</span>
                </div>
                {near === "lift" && <LiftMenu {...props} />}
                {near === "forge" && <ForgeMenu {...props} />}
                {near === "smith" && <SmithMenu {...props} />}
                {near === "market" && <MarketMenu {...props} />}
                {near === "shop" && <PetMenu {...props} />}
                {near === "house" && <HouseMenu {...props} />}
                {near === "church" && <ChurchMenu {...props} />}
                {near === "ship" && <ShipMenu {...props} />}
              </>
            )}
          </section>
        )}

        {downed && trip && (
          <section className={styles.found} aria-label="You're going down">
            <span className={styles.eyebrow}>You're going down</span>
            <span>
              The dark closes in. A Scroll of Second Breath would put you back on your feet at full health, right here, satchel and all.
              You carry {state.revives ?? 0}.
            </span>
            <div className={styles.btnRow}>
              <button type="button" className={`glass-btn-primary ${styles.actBtn}`} onClick={() => void standUp(true)}>
                Read the scroll (R)
              </button>
              <button type="button" className={`glass-btn-secondary ${styles.actBtn}`} onClick={() => void standUp(false)}>
                Let go and faint (E)
              </button>
            </div>
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
          greater={greater}
          drink={drink}
          onDrink={pickDrink}
          bombs={bombs}
          torchesLeft={trip ? torchCap - torchesUsed : state.torchStock}
          inMine={!!trip}
          boltRef={boltRef}
          onEquip={(slot, tier) => swap(() => equipGear(slot, tier))}
          onPet={(key) => swap(() => followPet(key))}
          onRecall={() => void finish(false, 0, true)}
          top={
            <>
              <Effects gameRef={gameRef} />
              <div className={styles.hpDock}>
                <span className={styles.hudLabel}>Health</span>
                <div ref={hpBar} className={`${styles.bar} ${styles.hpBar}`}>
                  <div ref={hpLag} className={styles.hpLag} />
                  <div ref={hpRef} className={styles.hpFill} />
                </div>
                <span ref={hpText} className={styles.barText} />
              </div>
            </>
          }
        />

        {report && !trip && <TripSummary {...props} report={report} onClose={() => setReport(null)} />}

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

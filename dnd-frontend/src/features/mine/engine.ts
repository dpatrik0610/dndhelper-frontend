import type { Break, DepthInfo, MiningStats, MiningTrip } from "@services/miningService";
import { itemName, SETS, type Tiers } from "./art/gear";
import { canSolo, type PetArt } from "./art/pets";
import { ENEMIES, type Enemy, RARE } from "./art/world";
import { boltHit, compact, critHit, dashHit } from "./mine";
import type { Sfx } from "./sound";

export const T = 16;
export const OPEN = 46;
export const BEDROCK = 35;
export const SEAL = 61;
export const STONE = 48;
export const ORE0 = 65;
export const LEDGER = 42;
export const CHEST = 36;
export const MIMIC = 38;
export const IRON_CHEST = 43;
export const GILDED_CHEST = 94;
export const GEODE = 37;
export const DIAMOND_CELL = 64;
export const CHESTS = [CHEST, IRON_CHEST, GILDED_CHEST];
export const isChest = (c: number) => c === MIMIC || CHESTS.includes(c);
const MOTHERLODE_RADIUS = 4.5;
const HUM_RADIUS = 12;
export const MIMIC_KIND = 11;
export const GRAB_NEED = 10;
export const GRAB_MS = 6000;
const GRAB_BITE_MS = 1000;
export const CUBE_KIND = 8;
export const SALAMANDER_KIND = 7;
const CUBE_GENS = 2;
export const BOLT_MS = 2500;
export const FIREBALL_RADIUS = 2;

const WALK_MS = 170;
const CLIMB_MS = 200;
const FALL_MS = 90;
const JUMP_MS = 140;
const HANG_MS = 260;
const AFK_MS = 60_000;
const SPAWN_GRACE_MS = 12_000;
const ENCUMBERED_SLOW: [number, number] = [1.5, 4];
const ENCUMBERED_SWING: [number, number] = [1.15, 1.6];
export const OVERLOADED = 0.5;
const scaled = ([lo, hi]: [number, number], b: number) => lo + (hi - lo) * b;

export const hardCap = (g: Game) => Math.floor(g.stats.capacity * g.overload);
export const encumbered = (g: Game) => !g.camp && g.carried > g.stats.capacity;
export const burden = (g: Game) =>
  encumbered(g) ? Math.min(1, (g.carried - g.stats.capacity) / Math.max(1, hardCap(g) - g.stats.capacity)) : 0;
const DASH_MS = 110;
export const dashCooldown = (g: Game) => g.stats.dashMs ?? 1200;
export const dashColor = (set: number) => (set > 0 ? (SETS[set].gem ?? SETS[set].base) : "#9fe6ff");
const IFRAME_MS = 380;
const COMBO_MS = 1100;
const HITSTUN_MS = 260;
const SWEAT_MS = 1100;
const LOW_HP = 0.3;

export type Keys = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  attack: boolean;
  dash?: boolean;
};
export type Aim = { x: number; y: number } | null;

export const CAMP = { W: 78, H: 10, ground: 8, lift: 5, forge: 19, market: 31, shop: 42, house: 54, church: 67 };
export type Station = "lift" | "forge" | "market" | "shop" | "house" | "church" | "trader";
export type Blessing = "shield" | "regen" | "glow";
export const SHIELD_CUT = 0.3;
export const BOMB_RADIUS = 7;
export const BOMB_FUSE_MS = 2000;
export const BOMB_SELF_DMG = 200;
const BOMB_HIT = 8;
export const BLESSED_REGEN = 0.02;
export const GLOW_BOOST = 1.5;

type Tween = { x: number; y: number; fromX: number; fromY: number; t: number; dur: number };

export interface Player extends Tween {
  face: 1 | -1;
  hp: number;
  nextSwing: number;
  strikeUntil: number;
  slowUntil: number;
  burnUntil: number;
  nextBurn: number;
  poisonUntil: number;
  nextPoison: number;
  lastHurt: number;
  hurtUntil: number;
  hangUntil: number;
  jumpAt: number;
  jumpH: number;
  jumpTop: number;
  fell: number;
  landAt: number;
  nextDash: number;
  dashUntil: number;
  invulnUntil: number;
  combo: number;
  comboUntil: number;
  nextSweat: number;
  swingAt: number;
  heavyAt: number;
  critStreak: number;
  rootUntil: number;
}

export interface Monster extends Tween {
  id: number;
  def: Enemy;
  kind: number;
  hp: number;
  maxHp: number;
  dmg: number;
  moveMs: number;
  nextMove: number;
  nextHit: number;
  lungeUntil: number;
  flashUntil: number;
  stunUntil: number;
  revived: boolean;
  petBlocked: boolean;
  leaving: number;
  lost: number;
  cell: number;
  slowUntil: number;
  burnUntil: number;
  nextBurn: number;
  windupUntil: number;
  ward: number;
  poise: number;
  gen: number;
  slamAt: number;
  nextSlam: number;
  grappled: boolean;
  rare: boolean;
}

export interface Grab {
  m: Monster;
  until: number;
  got: number;
  next: -1 | 1;
  nextBite: number;
  left: boolean;
  right: boolean;
}

export interface PetActor {
  art: PetArt;
  key: string;
  px: number;
  py: number;
  face: 1 | -1;
  nextHit: number;
  hopUntil: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface Bolt {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  big: boolean;
}

export interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface Pending {
  breaks: Break[];
  ladders: number[];
  torches: number[];
  kills: number;
  salamanders: number;
  mimics: number[];
  drank: number;
  bombs: { i: number; after: number }[];
  feats: Record<string, number>;
  unlocked: string[];
  hp?: number;
  pos?: number;
}

export interface GameSetup {
  W: number;
  H: number;
  liftX: number;
  liftY: number;
  oreHp: number[];
  oreNames: string[];
  hotOre: number;
  oreColors: string[];
  depths: DepthInfo[];
  stats: MiningStats;
  tiers: Tiers;
  pet: { art: PetArt; key: string } | null;
  forgeLevel: number;
  houseLevel: number;
  firebolt: boolean;
  fireball?: boolean;
  blessings?: Partial<Record<Blessing, number>>;
  bombs?: number;
  potions: number;
  maxTorches: number;
  overload: number;
}

export interface Game extends GameSetup {
  camp: boolean;
  hover: Aim;
  target: number;
  splash: number[];
  aimPoint: { x: number; y: number };
  depth: number;
  info: DepthInfo;
  map: Uint8Array;
  dmg: Map<number, { d: number; s: number; c: number; t: number }>;
  ladders: Set<number>;
  torches: Set<number>;
  seen: Uint8Array;
  dist: Int16Array;
  player: Player;
  petActor: PetActor | null;
  monsters: Monster[];
  nextSpawn: number;
  startedAt: number;
  now: number;
  parts: Particle[];
  texts: FloatText[];
  zs: { x: number; y: number; big: boolean; life: number }[];
  nextZ: number;
  pending: Pending;
  asleep: boolean;
  lastInput: number;
  carried: number;
  fainted: boolean;
  riding: boolean;
  sent: { hp: number; pos: number };
  beetle: number;
  nextBeetle: number;
  warned: Set<string>;
  seq: number;
  found: number;
  bolts: Bolt[];
  nextBolt: number;
  nextPotion: number;
  trader: number;
  boons: Set<string>;
  sfx: Sfx[];
  motherlode: number;
  richFound: boolean;
  traps: Trap[];
  dimUntil: number;
  embers: Map<number, number>;
  bombArmed: boolean;
  fuses: { i: number; at: number }[];
  grab: Grab | null;
  shakeUntil: number;
  shakeMag: number;
  feats: Record<string, number>;
}

type Kind = { hp: number; dmg: number; move: number; windup: number; poise: number; ward?: number; tunnel?: boolean };

export const KINDS: Record<number, Kind> = {
  1: { hp: 0.8, dmg: 0.8, move: 150, windup: 420, poise: 1 },
  2: { hp: 1, dmg: 1.15, move: 520, windup: 400, poise: 1, tunnel: true },
  3: { hp: 0.9, dmg: 1, move: 340, windup: 380, poise: 1 },
  4: { hp: 1.1, dmg: 1, move: 480, windup: 380, poise: 2 },
  5: { hp: 0.8, dmg: 1, move: 300, windup: 340, poise: 1 },
  6: { hp: 1.2, dmg: 1.3, move: 420, windup: 340, poise: 2, ward: 2 },
  7: { hp: 1.1, dmg: 1.1, move: 400, windup: 300, poise: 2 },
  8: { hp: 1.6, dmg: 1.6, move: 800, windup: 440, poise: 3 },
  9: { hp: 1.3, dmg: 1.2, move: 560, windup: 300, poise: 2, tunnel: true },
  10: { hp: 2, dmg: 1.6, move: 520, windup: 320, poise: 3 },
  11: { hp: 5, dmg: 1.5, move: 430, windup: 360, poise: 99 },
};

export const SKITTER_KIND = 1;
export const KOBOLD_KIND = 2;
export const SALAMANDER_TRAIL_MS = 3000;
export const ENGULF_MS = 1000;
const ENGULF_GRACE_MS = 2000;
export const XORN_KIND = 9;
export const GOLEM_KIND = 10;
export const SLAM_RANGE = 3;
export const SLAM_WINDUP_MS = 900;
const SLAM_EVERY_MS = 5000;
const SKITTER_CHANCE = 0.35;
export const RARE_CHANCE = 0.12;
export const ROT_RANGE = 2;
export const POISON_MS = 5000;
const POISON_TICK_MS = 800;
export const isZombie = (m: Monster) => m.rare && m.kind === 4;

export const PET_LIGHT: Record<string, number> = { moth: 3.5, wisp: 5, fox: 10 };

const rand = Math.random;

export const cellAt = (g: Game, x: number, y: number) =>
  x < 0 || y < 0 || x >= g.W || y >= g.H ? BEDROCK : g.map[y * g.W + x];
export const isOpen = (g: Game, x: number, y: number) => cellAt(g, x, y) === OPEN;
export const oreOf = (c: number) => (c >= ORE0 && c < ORE0 + 20 ? c - ORE0 : -1);

export const OUTCLASS_TIERS = 3;

export const minSwings = (c: number, pickTier: number, depth: number) =>
  (c === STONE ? 2 : c === CHEST || c === IRON_CHEST || c === LEDGER ? 4 : c === GILDED_CHEST || c === GEODE || c === SEAL || c === DIAMOND_CELL ? 5 : 3) -
  (pickTier - (depth - 1) >= OUTCLASS_TIERS ? 1 : 0);

export const hpOf = (g: Game, c: number) =>
  c === STONE
    ? g.info.stoneHp
    : c === SEAL
      ? g.info.sealHp
      : c === LEDGER
        ? g.info.stoneHp * 6
        : c === CHEST || c === MIMIC
          ? g.info.stoneHp * 3
          : c === IRON_CHEST
            ? g.info.stoneHp * 4
            : c === GILDED_CHEST
              ? g.info.stoneHp * 6
              : c === GEODE
                ? g.info.stoneHp * 5
                : c === DIAMOND_CELL
                  ? g.info.stoneHp * 8
                  : oreOf(c) >= 0
            ? g.oreHp[oreOf(c)]
            : Number.POSITIVE_INFINITY;

const tweenTo = (a: Tween, x: number, y: number, dur: number) => {
  a.fromX = a.x;
  a.fromY = a.y;
  a.x = x;
  a.y = y;
  a.t = 0;
  a.dur = dur;
};

export const drawPos = (a: Tween) => {
  const k = a.dur > 0 ? Math.min(1, a.t / a.dur) : 1;
  return { x: a.fromX + (a.x - a.fromX) * k, y: a.fromY + (a.y - a.fromY) * k };
};

export function playerPos(g: Game) {
  const p = g.player;
  const pos = drawPos(p);
  const rise = JUMP_MS * (p.jumpH > 1 ? 1.6 : 1) + HANG_MS * 0.85;
  const since = g.now - p.jumpAt;
  if (p.jumpH && !p.fell && since < rise && p.y === p.jumpTop) {
    const k = 1 - (1 - since / rise) ** 2;
    return { x: pos.x, y: p.jumpTop + p.jumpH * (1 - k) };
  }
  if (p.fell === 1 && p.t < p.dur) {
    const k = p.t / p.dur;
    return { x: pos.x, y: p.fromY + (p.y - p.fromY) * k * k };
  }
  return pos;
}

export type EffectKey = "poison" | "burn" | "slow" | "root" | "dim" | Blessing;

export function effects(g: Game): { key: EffectKey; left: number }[] {
  const p = g.player;
  const b = g.blessings ?? {};
  const all: [EffectKey, number][] = [
    ["shield", b.shield ?? 0],
    ["regen", b.regen ?? 0],
    ["glow", b.glow ?? 0],
    ...(g.camp
      ? []
      : ([
          ["poison", p.poisonUntil],
          ["burn", p.burnUntil],
          ["slow", p.slowUntil],
          ["root", p.rootUntil],
          ["dim", g.dimUntil],
        ] as [EffectKey, number][])),
  ];
  return all.filter(([, until]) => g.now < until).map(([key, until]) => ({ key, left: until - g.now }));
}

export function stretch(g: Game): [number, number] {
  const p = g.player;
  const land = (g.now - p.landAt) / 140;
  if (p.landAt && land < 1) return [1 + 0.12 * (1 - land), 1 - 0.12 * (1 - land)];
  if (p.jumpH && g.now - p.jumpAt < 140) return [0.92, 1.1];
  if (p.fell > 1) return [0.94, 1.08];
  return [1, 1];
}

const say = (g: Game, x: number, y: number, text: string, color: string, life = 1100) =>
  g.texts.push({ x, y, text, color, life });

export function showLoot(g: Game, i: number, ores: { index: number; n: number }[]) {
  const cx = ((i % g.W) + 0.5) * T;
  const cy = (Math.floor(i / g.W) + 0.5) * T;
  if (!ores.length) {
    say(g, cx, cy, "Satchel full! The loot is lost.", "#ff8a6a", 2200);
    return;
  }
  const sorted = [...ores].sort((a, b) => a.index - b.index);
  for (const [k, o] of sorted.entries())
    say(g, cx, cy - k * 10, `+${compact(o.n)} ${g.oreNames[o.index]}`, g.oreColors[o.index], 2600 + k * 120);
}

export const sayOnce = (g: Game, key: string, text: string, color = "#ffb347", life = 1800) => {
  if (g.warned.has(key)) return;
  g.warned.add(key);
  const p = g.player;
  say(g, (p.x + 0.5) * T, (p.y - 2) * T, text, color, life);
};

const shake = (g: Game, mag: number, ms: number) => {
  if (g.now >= g.shakeUntil || mag >= g.shakeMag) g.shakeMag = mag;
  g.shakeUntil = Math.max(g.shakeUntil, g.now + ms);
};

const dust = (g: Game, x: number, y: number, n: number) => {
  for (let i = 0; i < n; i++)
    g.parts.push({
      x: x * T + (Math.random() - 0.5) * 8,
      y: y * T - 1,
      vx: (Math.random() - 0.5) * 1.4,
      vy: -Math.random() * 0.9,
      life: 200 + Math.random() * 160,
      color: Math.random() < 0.5 ? "#8a7f70" : "#b8ad9c",
    });
};

const burst = (g: Game, x: number, y: number, color: string, n: number, spread = 1.6) => {
  for (let i = 0; i < n; i++)
    g.parts.push({
      x,
      y,
      vx: (rand() - 0.5) * spread * 2,
      vy: -rand() * spread * 1.6,
      life: 300 + rand() * 250,
      color,
    });
};

export function createGame(setup: GameSetup, trip: MiningTrip | null, now: number, home = false): Game {
  const g = {
    ...setup,
    dmg: new Map(),
    monsters: [],
    parts: [],
    texts: [],
    zs: [],
    nextZ: 0,
    pending: emptyPending(),
    feats: {},
    bolts: [],
    nextBolt: 0,
    nextPotion: 0,
    trader: -1,
    boons: new Set(),
    traps: [],
    dimUntil: 0,
    embers: new Map(),
    bombArmed: false,
    fuses: [],
    grab: null,
    sfx: [],
    shakeUntil: 0,
    shakeMag: 0,
    asleep: false,
    lastInput: now,
    now,
    fainted: false,
    riding: false,
    sent: { hp: -1, pos: -1 },
    beetle: -1,
    nextBeetle: 0,
    warned: new Set(),
    seq: 0,
    found: 0,
    hover: null,
    target: -1,
    splash: [],
    aimPoint: { x: 0, y: 0 },
  } as unknown as Game;
  if (trip) loadTrip(g, trip, now);
  else loadCamp(g, now, home);
  return g;
}

function loadCamp(g: Game, now: number, home: boolean) {
  Object.assign(g, {
    camp: true,
    W: CAMP.W,
    H: CAMP.H,
    liftX: CAMP.lift,
    liftY: CAMP.ground - 1,
    depth: 1,
    info: g.depths[0],
  });
  g.map = Uint8Array.from({ length: CAMP.W * CAMP.H }, (_, i) => {
    const x = i % CAMP.W;
    return Math.floor(i / CAMP.W) >= CAMP.ground || x === 0 || x === CAMP.W - 1 ? BEDROCK : OPEN;
  });
  g.ladders = new Set();
  g.torches = new Set();
  g.seen = new Uint8Array(CAMP.W * CAMP.H).fill(1);
  g.dist = new Int16Array(CAMP.W * CAMP.H);
  g.carried = 0;
  g.monsters = [];
  g.bolts = [];
  g.trader = -1;
  g.boons = new Set();
  g.traps = [];
  g.embers = new Map();
  g.fuses = [];
  g.bombArmed = false;
  g.grab = null;
  g.motherlode = -1;
  g.startedAt = now;
  g.nextSpawn = Number.POSITIVE_INFINITY;
  place(g, home ? CAMP.house : g.liftX + 1);
}

function place(g: Game, x: number) {
  g.player = {
    x,
    y: g.liftY,
    fromX: x,
    fromY: g.liftY,
    t: 0,
    dur: 0,
    face: 1,
    hp: g.player?.hp ?? g.stats.maxHp,
    nextSwing: 0,
    strikeUntil: 0,
    slowUntil: 0,
    burnUntil: 0,
    nextBurn: 0,
    poisonUntil: 0,
    nextPoison: 0,
    lastHurt: 0,
    hurtUntil: 0,
    hangUntil: 0,
    jumpAt: 0,
    jumpH: 0,
    jumpTop: 0,
    fell: 0,
    landAt: 0,
    nextDash: 0,
    dashUntil: 0,
    invulnUntil: 0,
    combo: 0,
    comboUntil: 0,
    nextSweat: 0,
    swingAt: -1e9,
    heavyAt: -1e9,
    critStreak: 0,
    rootUntil: 0,
  };
  g.petActor = g.pet
    ? { art: g.pet.art, key: g.pet.key, px: x - 1, py: g.liftY, face: 1, nextHit: 0, hopUntil: 0 }
    : null;
}

export const stationAt = (g: Game): Station | null => {
  const x = g.player.x;
  if (!g.camp) {
    if (atLift(g)) return "lift";
    const t = g.trader;
    return t >= 0 && Math.abs((t % g.W) - x) <= 2 && Math.abs(Math.floor(t / g.W) - g.player.y) <= 1 ? "trader" : null;
  }
  if (Math.abs(x - CAMP.lift) <= 2) return "lift";
  if (Math.abs(x - CAMP.forge) <= 2) return "forge";
  if (Math.abs(x - CAMP.market) <= 2) return "market";
  if (Math.abs(x - CAMP.shop) <= 2) return "shop";
  if (Math.abs(x - CAMP.house) <= 3) return "house";
  if (Math.abs(x - CAMP.church) <= 2) return "church";
  return null;
};

export function loadTrip(g: Game, trip: MiningTrip, now: number) {
  g.camp = false;
  g.depth = trip.depth;
  g.info = g.depths[trip.depth - 1];
  g.map = Uint8Array.from(trip.map, (ch) => ch.charCodeAt(0));
  g.ladders = new Set(trip.ladders);
  g.torches = new Set(trip.torches);
  g.seen = new Uint8Array(g.W * g.H);
  g.dist = new Int16Array(g.W * g.H);
  g.dmg.clear();
  g.carried = Object.values(trip.satchel).reduce((a, b) => a + b, 0);
  g.monsters = [];
  g.bolts = [];
  g.trader = trip.trader ?? -1;
  g.boons = new Set(trip.boons ?? []);
  g.traps = placeTraps(g, trip.map);
  g.dimUntil = 0;
  g.embers = new Map();
  g.fuses = [];
  g.bombArmed = false;
  g.grab = null;
  g.motherlode = trip.motherlode ?? -1;
  g.richFound = false;
  g.startedAt = now;
  g.nextSpawn = now + SPAWN_GRACE_MS;
  g.warned.clear();
  place(g, g.liftX);
  const p = g.player;
  if (trip.pos != null && g.map[trip.pos] === OPEN) {
    p.x = p.fromX = trip.pos % g.W;
    p.y = p.fromY = Math.floor(trip.pos / g.W);
  }
  if (trip.hp != null) p.hp = Math.min(g.stats.maxHp, trip.hp);
  if (p.hp <= 0) g.fainted = true;
  g.sent = vitals(g);
  for (const i of g.torches) markSeen(g, i % g.W, Math.floor(i / g.W), TORCH_LIGHT);
  markSeen(g, g.liftX + 1, g.liftY - 1, LIFT_LIGHT);
}

export const emptyPending = (): Pending => ({
  breaks: [],
  ladders: [],
  torches: [],
  kills: 0,
  salamanders: 0,
  mimics: [],
  drank: 0,
  bombs: [],
  feats: {},
  unlocked: [],
});

const vitals = (g: Game) => ({ hp: Math.round(g.player.hp * 10) / 10, pos: g.player.y * g.W + g.player.x });

export function takePending(g: Game): Pending | null {
  const p = g.pending;
  const now = vitals(g);
  const still = now.hp === g.sent.hp && now.pos === g.sent.pos;
  const quiet = !Object.keys(p.feats).length && !p.unlocked.length;
  if (!p.breaks.length && !p.ladders.length && !p.torches.length && !p.kills && !p.mimics.length && !p.drank && !p.bombs.length && quiet && still)
    return null;
  g.pending = emptyPending();
  g.sent = now;
  return { ...p, ...now };
}

export function resetPending(g: Game) {
  g.pending = { ...emptyPending(), feats: g.pending.feats, unlocked: g.pending.unlocked };
}

export function feat(g: Game, key: string, n = 1) {
  g.feats[key] = (g.feats[key] ?? 0) + n;
  g.pending.feats[key] = (g.pending.feats[key] ?? 0) + n;
}

export const TORCH_LIGHT = 4;
const REST_MS = 3000;

export const lightRadius = (g: Game) =>
  g.camp
    ? g.stats.light
    : g.stats.light *
      Math.max(0.6, 1 - 0.045 * (g.depth - 1)) *
      (g.boons.has("oil") ? 1.5 : 1) *
      (g.now < g.dimUntil ? 0.5 : 1) *
      (blessed(g, "glow") ? GLOW_BOOST : 1);

export const blessed = (g: Game, b: Blessing) => g.now < (g.blessings?.[b] ?? 0);

export const setBlessings = (g: Game, left: Partial<Record<Blessing, number>> | undefined) => {
  g.blessings = Object.fromEntries(Object.entries(left ?? {}).map(([k, ms]) => [k, g.now + (ms ?? 0)]));
};

export const CHARTED = [CHEST, IRON_CHEST, GILDED_CHEST, MIMIC, GEODE, DIAMOND_CELL, LEDGER];

export const LIFT_LIGHT = 5;
export const byLiftTorch = (g: Game, x: number, y: number) =>
  !g.camp && (x - g.liftX - 1) ** 2 + (y - g.liftY + 1) ** 2 <= LIFT_LIGHT * LIFT_LIGHT;

export const inTorchlight = (g: Game, x: number, y: number) => {
  if (byLiftTorch(g, x, y)) return true;
  for (const t of g.torches) if (((t % g.W) - x) ** 2 + (Math.floor(t / g.W) - y) ** 2 <= TORCH_LIGHT * TORCH_LIGHT) return true;
  return false;
};

export const atLift = (g: Game) => g.player.y === g.liftY && Math.abs(g.player.x - g.liftX) <= 1;

export function noteInput(g: Game) {
  g.lastInput = g.now;
  if (g.asleep) {
    g.asleep = false;
    g.nextSpawn = Math.max(g.nextSpawn, g.now + 6000);
  }
}

function markSeen(g: Game, cx: number, cy: number, r: number) {
  const R = Math.ceil(r);
  for (let y = cy - R; y <= cy + R; y++)
    for (let x = cx - R; x <= cx + R; x++)
      if (x >= 0 && y >= 0 && x < g.W && y < g.H && (x - cx) ** 2 + (y - cy) ** 2 <= r * r) g.seen[y * g.W + x] = 1;
}

function addLadder(g: Game, x: number, y: number) {
  const i = y * g.W + x;
  if (!isOpen(g, x, y) || g.ladders.has(i)) return;
  g.ladders.add(i);
  g.pending.ladders.push(i);
  feat(g, "ladder");
  if (g.feats.ladder === 40) feat(g, "stairway");
}

export function placeTorch(g: Game) {
  const p = g.player;
  const i = (p.y - 1) * g.W + p.x;
  if (g.torches.has(i) || !isOpen(g, p.x, p.y - 1)) return;
  if (g.torches.size >= g.maxTorches) return sayOnce(g, "torches", "Out of torches. Hesk sells them up at camp.", "#ff8a6a");
  g.torches.add(i);
  g.pending.torches.push(i);
  g.sfx.push("torch");
  feat(g, "torch");
  markSeen(g, p.x, p.y - 1, TORCH_LIGHT);
}

function swing(g: Game) {
  const p = g.player;
  const slow = (g.now < p.slowUntil ? 1.5 : 1) * (encumbered(g) ? scaled(ENCUMBERED_SWING, burden(g)) : 1);
  p.nextSwing = g.now + g.stats.swingMs * slow;
  p.strikeUntil = g.now + 140;
  p.swingAt = g.now;
  return rand() < g.stats.critZone;
}

function hitCell(g: Game, x: number, y: number) {
  const p = g.player;
  const c = cellAt(g, x, y);
  if (c === OPEN || g.camp) return;
  if (c === BEDROCK) return sayOnce(g, "bedrock", "Solid bedrock. Nothing gets through that.");
  const pick = g.tiers.pickaxe;
  if (c === SEAL && pick < g.depth)
    return sayOnce(g, "seal", `Breaking the seal needs a ${itemName("pickaxe", g.depth)}`);
  if (g.now < p.nextSwing) return;
  const i = y * g.W + x;
  if (c === MIMIC) return wakeMimic(g, x, y);
  const crit = swing(g);
  crack(g, i, crit, false);
  const splash = splashOf(g, i);
  for (const j of splash) crack(g, j, crit, true);
  if (crit && g.stats.chainCrit) chainSpark(g, i, splash);
  settle(g);
}

const exposed = (g: Game, x: number, y: number) =>
  isOpen(g, x - 1, y) || isOpen(g, x + 1, y) || isOpen(g, x, y - 1) || isOpen(g, x, y + 1);

export function splashOf(g: Game, i: number) {
  if (!g.stats.wide) return [];
  const p = g.player;
  const cx = i % g.W;
  const cy = Math.floor(i / g.W);
  const side = cy === p.y || cy === p.y - 1;
  const fx = g.aimPoint.x - (cx + 0.5);
  const sx = side ? Math.sign(cx - p.x) || p.face : Math.abs(fx) > 0.05 ? Math.sign(fx) : p.face;
  const sy = side ? (cy === p.y ? -1 : 1) : cy > p.y ? 1 : -1;
  return [i + sx, i + sy * g.W, i + sx + sy * g.W].filter((j) => {
    const c = g.map[j];
    return Math.abs((j % g.W) - cx) <= 1 && j >= 0 && j < g.map.length && (c === STONE || oreOf(c) >= 0);
  });
}

function chainSpark(g: Game, i: number, splash: number[]) {
  const near = [i - 1, i + 1, i - g.W, i + g.W].filter((j) => {
    const c = g.map[j];
    return Math.abs((j % g.W) - (i % g.W)) <= 1 && !splash.includes(j) && (c === STONE || oreOf(c) >= 0);
  });
  if (!near.length) return;
  const j = near[Math.floor(rand() * near.length)];
  crack(g, j, true, true);
  const ax = ((i % g.W) + 0.5) * T;
  const ay = (Math.floor(i / g.W) + 0.5) * T;
  const bx = ((j % g.W) + 0.5) * T;
  const by = (Math.floor(j / g.W) + 0.5) * T;
  for (let k = 0; k <= 6; k++)
    g.parts.push({
      x: ax + ((bx - ax) * k) / 6,
      y: ay + ((by - ay) * k) / 6,
      vx: 0,
      vy: 0,
      life: 160 + k * 20,
      color: "#ffe066",
    });
}

function crack(g: Game, i: number, crit: boolean, splash: boolean) {
  const e = g.dmg.get(i) ?? { d: 0, s: 0, c: 0, t: 0 };
  e.t = g.now;
  const cap = Math.ceil(hpOf(g, g.map[i]) / minSwings(g.map[i], g.tiers.pickaxe, g.depth));
  e.d += crit ? Math.min(critHit(g.stats), cap * 2) : Math.min(g.stats.power, cap);
  e.s++;
  if (crit) e.c++;
  g.dmg.set(i, e);
  const cx = ((i % g.W) + 0.5) * T;
  const cy = (Math.floor(i / g.W) + 0.5) * T;
  burst(g, cx, cy, crit ? "#ffe066" : "#d6d0c4", splash ? 2 : crit ? 8 : 3);
  if (!splash) g.sfx.push(crit ? "crit" : "dig");
  if (crit && !splash) say(g, cx, cy - 6, "CRIT", "#ffe066", 600);
}

function settle(g: Game) {
  for (let changed = true; changed; ) {
    changed = false;
    for (const [i, e] of g.dmg) {
      const c = g.map[i];
      if (e.d < hpOf(g, c) || !exposed(g, i % g.W, Math.floor(i / g.W))) continue;
      breakCell(g, i, c, e);
      changed = true;
    }
  }
}

function echoVein(g: Game, from: number, c: number) {
  const seen = new Set([from]);
  const queue = [from];
  const hits: number[] = [];
  for (let head = 0; head < queue.length && hits.length < 3 && head < 40; head++) {
    const i = queue[head];
    for (const j of [i - 1, i + 1, i - g.W, i + g.W]) {
      if (seen.has(j) || g.map[j] !== c || Math.abs((j % g.W) - (i % g.W)) > 1) continue;
      seen.add(j);
      queue.push(j);
      if (hits.length < 3) hits.push(j);
    }
  }
  const color = g.oreColors[oreOf(c)];
  for (const j of hits) {
    for (let k = 0; k < minSwings(c, g.tiers.pickaxe, g.depth); k++) crack(g, j, false, true);
    burst(g, ((j % g.W) + 0.5) * T, (Math.floor(j / g.W) + 0.5) * T, color, 6, 1.4);
  }
}

function breakCell(g: Game, i: number, c: number, e: { s: number; c: number } | null) {
  g.dmg.delete(i);
  g.map[i] = OPEN;
  if (e) g.pending.breaks.push({ i, s: e.s, c: e.c });
  const cx = ((i % g.W) + 0.5) * T;
  const cy = (Math.floor(i / g.W) + 0.5) * T;
  const ore = oreOf(c);
  const found = { [GEODE]: "geode", [GILDED_CHEST]: "gilded", [IRON_CHEST]: "iron", [CHEST]: "chest" }[c];
  if (found) feat(g, found);
  if (e || (c !== STONE && ore < 0))
    g.sfx.push(
    c === SEAL
      ? "seal"
      : c === GILDED_CHEST || c === DIAMOND_CELL
        ? "jackpot"
        : isChest(c)
          ? "chest"
          : c === GEODE
            ? "geode"
            : c === LEDGER
              ? "ledger"
              : ore >= 0
                ? "ore"
                : "break",
  );
  if (c === SEAL) {
    say(g, cx, cy - 8, "The seal cracks open…", "#ffd77a", 1600);
    burst(g, cx, cy, "#ffd77a", 24, 2.4);
  } else if (c === GILDED_CHEST) {
    say(g, cx, cy - 10, "A GILDED CHEST!", "#fff0a0", 2000);
    burst(g, cx, cy, "#fff0a0", 40, 3.2);
    burst(g, cx, cy, "#ffd77a", 30, 2.4);
  } else if (c === IRON_CHEST) {
    say(g, cx, cy - 8, "An iron-bound chest!", "#dfe3ea", 1600);
    burst(g, cx, cy, "#dfe3ea", 28, 2.6);
  } else if (c === CHEST) {
    say(g, cx, cy - 8, "Treasure!", "#ffd77a", 1400);
    burst(g, cx, cy, "#ffd77a", 22, 2.4);
  } else if (c === GEODE) {
    say(g, cx, cy - 8, "The geode shatters!", "#c9a6ff", 1800);
    for (const color of ["#c9a6ff", "#7fe3ff", "#ff9ad5", "#ffffff"]) burst(g, cx, cy, color, 12, 2.8);
  } else if (c === DIAMOND_CELL) {
    say(g, cx, cy - 10, "A DIAMOND!", "#c4f4ff", 2400);
    for (const color of ["#ffffff", "#c4f4ff", "#6cc6ea"]) burst(g, cx, cy, color, 20, 3);
  } else if (c === LEDGER) {
    say(g, cx, cy - 8, "A ledger page!", "#f4e2b8", 1600);
    burst(g, cx, cy, "#f4e2b8", 18, 2.2);
    g.found = g.depth;
  } else if (ore >= 0) {
    burst(g, cx, cy, g.oreColors[ore], 14, 2);
    if (g.stats.vein && e) echoVein(g, i, c);
    if (!g.richFound && inMotherlode(g, i)) {
      g.richFound = true;
      g.sfx.push("motherlode");
      feat(g, "motherlode");
      say(g, cx, cy - 14, "MOTHERLODE!", g.oreColors[ore], 2400);
      burst(g, cx, cy, g.oreColors[ore], 50, 3.4);
    }
    if (g.carried >= hardCap(g)) {
      if (!g.warned.has("full")) {
        g.sfx.push("full");
        feat(g, "fullBag");
      }
      sayOnce(g, "full", "You can't carry another crumb. Head back to the lift.", "#ff8a6a");
    } else {
      if (e) say(g, cx, cy - 6, `+ ${g.oreNames[ore]}`, g.oreColors[ore]);
      const was = encumbered(g);
      g.carried += Math.floor(g.stats.yield) + (g.pet?.key === "ferret" ? 1 : 0);
      if (!was && encumbered(g)) {
        g.sfx.push("full");
        say(g, (g.player.x + 0.5) * T, (g.player.y - 2) * T, "Encumbered!", "#ffb347", 1600);
        sayOnce(g, "heavy", "Your satchel is overstuffed. You'll move slowly until you bank it.", "#ffb347", 3200);
      }
    }
  }
}

const distTo = (g: Game, i: number, x: number, y: number) => Math.hypot((i % g.W) - x, Math.floor(i / g.W) - y);

const inMotherlode = (g: Game, i: number) =>
  g.motherlode >= 0 && distTo(g, i, g.motherlode % g.W, Math.floor(g.motherlode / g.W)) <= MOTHERLODE_RADIUS;

export const nearMotherlode = (g: Game) =>
  !g.camp && !g.richFound && g.motherlode >= 0 && distTo(g, g.motherlode, g.player.x, g.player.y) <= HUM_RADIUS;

export function addMonster(g: Game, kind: number, x: number, y: number, gen = 0) {
  const spec = KINDS[kind];
  const hp = Math.max(1, Math.round(g.info.monsterHp * spec.hp * 0.5 ** gen));
  const m: Monster = {
    id: ++g.seq,
    def: ENEMIES[kind - 1],
    kind,
    x,
    y,
    fromX: x,
    fromY: y,
    t: 0,
    dur: 0,
    hp,
    maxHp: hp,
    dmg: gen >= CUBE_GENS ? 0 : Math.round(g.info.monsterDamage * spec.dmg * 0.5 ** gen),
    moveMs: spec.move * 0.75 ** gen,
    nextMove: g.now + 600,
    nextHit: 0,
    lungeUntil: 0,
    flashUntil: 0,
    stunUntil: 0,
    revived: false,
    petBlocked: false,
    leaving: 0,
    lost: 0,
    cell: y * g.W + x,
    slowUntil: 0,
    burnUntil: 0,
    nextBurn: 0,
    windupUntil: 0,
    ward: spec.ward ?? 0,
    poise: gen ? 1 : spec.poise,
    gen,
    slamAt: 0,
    nextSlam: g.now + 2000,
    grappled: false,
    rare: false,
  };
  g.monsters.push(m);
  return m;
}

function wakeMimic(g: Game, x: number, y: number) {
  swing(g);
  g.map[y * g.W + x] = OPEN;
  const m = addMonster(g, MIMIC_KIND, x, y);
  m.nextMove = g.now + 900;
  m.nextHit = g.now + 900;
  const cx = (x + 0.5) * T;
  const cy = y * T;
  burst(g, cx, cy + 8, "#c9a04a", 18, 2.6);
  say(g, cx, cy - 10, "It's a MIMIC!", "#ff6a5a", 1800);
  g.sfx.push("mimic");
  feat(g, "mimicWake");
  if (!g.firebolt) sayOnce(g, "nofire", "Your pick just bounces off. Only fire hurts it. Run!", "#ff8a6a");
}

export const bombCell = (g: Game) => {
  const h = g.hover;
  if (!h || g.camp) return -1;
  const x = Math.floor(h.x);
  const y = Math.floor(h.y);
  const i = y * g.W + x;
  return isOpen(g, x, y) && g.seen[i] && !g.fuses.some((f) => f.i === i) ? i : -1;
};

export function bombKey(g: Game) {
  if (g.camp || g.fainted || g.asleep) return;
  if (!g.bombArmed) {
    if ((g.bombs ?? 0) <= 0) return sayOnce(g, "nobomb", "No bombs left. Moss sells them down here.", "#ff8a6a");
    g.bombArmed = true;
    sayOnce(g, "bombAim", "Point at an open spot and press B again to light it. Esc puts it away.", "#ffb347", 3200);
    return;
  }
  const i = bombCell(g);
  const p = g.player;
  if (i < 0) return void say(g, (p.x + 0.5) * T, (p.y - 2) * T, "Can't set it there", "#ff8a6a", 700);
  g.bombArmed = false;
  g.bombs = (g.bombs ?? 1) - 1;
  g.fuses.push({ i, at: g.now + BOMB_FUSE_MS });
  g.sfx.push("torch");
  feat(g, "bomb");
}

const inBlast = (dx: number, dy: number) => dx * dx + dy * dy <= BOMB_RADIUS * BOMB_RADIUS;

function explode(g: Game, at: number) {
  const cx = at % g.W;
  const cy = Math.floor(at / g.W);
  g.pending.bombs.push({ i: at, after: g.pending.breaks.length });
  for (let y = Math.max(0, cy - BOMB_RADIUS); y <= Math.min(g.H - 1, cy + BOMB_RADIUS); y++)
    for (let x = Math.max(0, cx - BOMB_RADIUS); x <= Math.min(g.W - 1, cx + BOMB_RADIUS); x++) {
      if (!inBlast(x - cx, y - cy)) continue;
      const i = y * g.W + x;
      const c = g.map[i];
      if (c === OPEN || c === BEDROCK || c === SEAL || c === MIMIC) continue;
      breakCell(g, i, c, null);
    }
  markSeen(g, cx, cy, BOMB_RADIUS + 1);
  for (const m of liveMonsters(g))
    if (inBlast(m.x - cx, m.y - cy)) damageMonster(g, m, Math.round(g.stats.power * BOMB_HIT), false, null, true);
  const p = g.player;
  if (inBlast(p.x - cx, p.y - cy) || inBlast(p.x - cx, p.y - 1 - cy)) hurt(g, BOMB_SELF_DMG, "#ff8a2a");
  const px = (cx + 0.5) * T;
  const py = (cy + 0.5) * T;
  for (let k = 0; k < 64; k++) {
    const a = (k / 64) * Math.PI * 2;
    const v = (BOMB_RADIUS * T) / 420;
    g.parts.push({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 420, color: k % 3 ? "#ff8a2a" : "#fff3a0" });
  }
  for (const color of ["#fff3a0", "#ff8a2a", "#c22a1a", "#5a5060"]) burst(g, px, py, color, 30, 3.2);
  say(g, px, py - 12, "BOOM!", "#ffb347", 1200);
  shake(g, 7, 450);
  g.sfx.push("smash", "seal");
  feat(g, "bombBlast");
}

function stepFuses(g: Game) {
  if (!g.fuses.length) return;
  const due = g.fuses.filter((f) => g.now >= f.at);
  if (!due.length) return;
  g.fuses = g.fuses.filter((f) => g.now < f.at);
  for (const f of due) explode(g, f.i);
}

export function castBolt(g: Game, aim: Aim) {
  const p = g.player;
  if (!g.firebolt || g.camp || g.asleep || g.now < g.nextBolt) return false;
  const ox = p.x + 0.5;
  const oy = p.y - 0.4;
  const tx = aim ? aim.x : ox + p.face;
  const ty = aim ? aim.y : oy;
  const len = Math.hypot(tx - ox, ty - oy) || 1;
  const v = 0.012;
  g.nextBolt = g.now + BOLT_MS;
  if (Math.abs(tx - ox) >= 0.3) p.face = tx < ox ? -1 : 1;
  g.sfx.push("bolt");
  feat(g, "bolt");
  g.bolts.push({ x: ox, y: oy, vx: ((tx - ox) / len) * v, vy: ((ty - oy) / len) * v, life: 1400, big: !!g.fireball });
  return true;
}

export function revive(g: Game) {
  const p = g.player;
  g.fainted = false;
  p.hp = g.stats.maxHp;
  p.invulnUntil = g.now + 2500;
  p.poisonUntil = p.burnUntil = p.slowUntil = p.rootUntil = 0;
  g.grab = null;
  feat(g, "revive");
  shake(g, 3, 220);
  burst(g, (p.x + 0.5) * T, (p.y - 0.5) * T, "#ffe066", 24, 2.4);
  burst(g, (p.x + 0.5) * T, (p.y - 0.5) * T, "#ffffff", 12, 1.6);
  say(g, (p.x + 0.5) * T, (p.y - 2.5) * T, "Revived!", "#ffe066", 1400);
  g.sfx.push("potion");
}

export function drinkPotion(g: Game) {
  const p = g.player;
  if (g.camp || g.potions <= 0 || g.now < g.nextPotion || p.hp >= g.stats.maxHp) return false;
  g.potions--;
  g.pending.drank++;
  g.nextPotion = g.now + 1000;
  const heal = Math.round(g.stats.maxHp * 0.6);
  p.hp = Math.min(g.stats.maxHp, p.hp + heal);
  g.sfx.push("potion");
  feat(g, "potion");
  say(g, (p.x + 0.5) * T, (p.y - 1.5) * T, `+${heal}`, "#7ee08a", 900);
  burst(g, (p.x + 0.5) * T, p.y * T, "#ff6a8a", 10, 1.4);
  return true;
}

function stepBolts(g: Game, dt: number) {
  for (const b of g.bolts) {
    b.life -= dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    const cx = Math.floor(b.x);
    const cy = Math.floor(b.y);
    if (rand() < 0.5) g.parts.push({ x: b.x * T, y: b.y * T, vx: 0, vy: -0.2, life: 220, color: "#ff8a2a" });
    markSeen(g, cx, cy, 1.6);
    const foe = liveMonsters(g).find((m) => {
      const mp = drawPos(m);
      return Math.abs(mp.x + 0.5 - b.x) < 0.7 && Math.abs(mp.y + 0.5 - b.y) < 0.8;
    });
    if (foe || !isOpen(g, cx, cy)) {
      b.life = 0;
      boltImpact(g, b, foe ?? null);
    }
  }
  g.bolts = g.bolts.filter((b) => b.life > 0);
}

function boltImpact(g: Game, b: Bolt, foe: Monster | null) {
  const near = (m: Monster) => {
    const mp = drawPos(m);
    return Math.hypot(mp.x + 0.5 - b.x, mp.y + 0.5 - b.y) <= FIREBALL_RADIUS;
  };
  const targets = b.big ? liveMonsters(g).filter(near) : foe ? [foe] : [];
  if (b.big) {
    burst(g, b.x * T, b.y * T, "#ff5a2a", 36, 4);
    burst(g, b.x * T, b.y * T, "#ffe066", 18, 2.4);
    shake(g, 3, 200);
    g.sfx.push("smash");
    if (targets.length >= 3) feat(g, "fireballTrio");
  } else burst(g, b.x * T, b.y * T, foe ? "#ffb347" : "#ff8a2a", foe ? 16 : 10, foe ? 2.2 : 1.6);
  for (const m of targets) {
    const crit = rand() < g.stats.critZone;
    damageMonster(g, m, boltHit(g.stats, b.big, crit), crit, null, true);
    if (g.stats.setBonus === 7 && m.hp > 0) {
      m.burnUntil = g.now + 3000;
      m.nextBurn = g.now + 600;
    }
  }
}

const touches = (p: Player, x: number, y: number) =>
  (Math.abs(x - p.x) <= 1 && (y === p.y || y === p.y - 1)) || (x === p.x && (y === p.y + 1 || y === p.y - 2));

const reaches = (p: Player, m: Monster, dir?: number) => {
  if (dir === undefined) return touches(p, m.x, m.y);
  const dx = m.x - p.x;
  return (m.y === p.y || m.y === p.y - 1) && (dx === dir || dx === 0);
};

const liveMonsters = (g: Game) => g.monsters.filter((m) => !m.leaving && m.hp > 0);

const strikeSpots = (m: Monster) => {
  const d = drawPos(m);
  return [
    [m.x, m.y],
    [Math.round(d.x), Math.round(d.y)],
  ];
};

export const strikable = (p: Player, m: Monster, dir?: number) =>
  strikeSpots(m).some(([x, y]) => {
    const dx = x - p.x;
    if (dir === undefined) return touches(p, x, y) || (Math.abs(dx) === 1 && y === p.y + 1);
    return ((y === p.y || y === p.y - 1) && (dx === dir || dx === 0)) || (y === p.y + 1 && dx === dir);
  });

function killMonster(g: Game, m: Monster, by: string | null) {
  m.hp = 0;
  g.monsters = g.monsters.filter((x) => x !== m);
  g.sfx.push("kill");
  if (m.kind === MIMIC_KIND) {
    g.pending.mimics.push(m.cell);
    burst(g, (m.x + 0.5) * T, (m.y + 0.5) * T, "#ffd77a", 30, 3);
  } else if (!m.gen) {
    g.pending.kills++;
    if (m.kind === SALAMANDER_KIND) g.pending.salamanders++;
  }
  if (!m.gen) feat(g, `kill${m.kind}`);
  if (m.gen >= CUBE_GENS) feat(g, "cubelet");
  if (by) feat(g, "petKill");
  if (g.player.hp <= g.stats.maxHp * 0.1) feat(g, "closeShave");
  const cx = (m.x + 0.5) * T;
  const cy = (m.y + 0.5) * T;
  burst(g, cx, cy, "#d6d0c4", 14, 2.2);
  if (m.kind === CUBE_KIND && m.gen < CUBE_GENS) return splitCube(g, m);
  say(g, cx, cy - 10, by ? `${by} finished it!` : `${m.def.name} defeated`, "#ffd77a", 1300);
  if (m.kind === 5 && reaches(g.player, m)) {
    feat(g, "blasted");
    burst(g, cx, cy, "#ff8a2a", 20, 2.6);
    hurt(g, Math.round(m.dmg * 0.5), "#ff8a2a");
  }
}

function splitCube(g: Game, m: Monster) {
  const cx = (m.x + 0.5) * T;
  const cy = (m.y + 0.5) * T;
  say(g, cx, cy - 10, m.gen ? "It splits again!" : "It splits!", "#9be07a", 1100);
  burst(g, cx, cy, "#9be07a", 18, 2.4);
  g.sfx.push("squish");
  for (const dir of [-1, 1]) {
    const c = addMonster(g, CUBE_KIND, m.x, m.y, m.gen + 1);
    c.nextMove = g.now + 500;
    c.nextHit = g.now + 700;
    c.stunUntil = g.now + 250;
    const nx = m.x + dir;
    const free = !g.monsters.some((o) => o !== c && o.x === nx && o.y === m.y) && !touches(g.player, nx, m.y);
    if (isOpen(g, nx, m.y) && free) tweenTo(c, nx, m.y, 160);
  }
}

function shove(g: Game, m: Monster) {
  const p = g.player;
  if (g.now < p.invulnUntil) return void say(g, (p.x + 0.5) * T, (p.y - 1.5) * T, "Dodged!", "#9fe6ff", 600);
  const dir = Math.sign(p.x - m.x) || -p.face;
  say(g, (p.x + 0.5) * T, (p.y - 1.5) * T, "Boing!", "#9be07a", 600);
  g.sfx.push("squish");
  feat(g, "bounced");
  shake(g, 1, 80);
  if (p.t >= p.dur && isOpen(g, p.x + dir, p.y) && isOpen(g, p.x + dir, p.y - 1)) tweenTo(p, p.x + dir, p.y, 120);
}

function damageMonster(g: Game, m: Monster, dmg: number, crit: boolean, byPet: string | null, fire = false) {
  const cx = (m.x + 0.5) * T;
  const cy = m.y * T;
  m.flashUntil = g.now + 120;
  if (m.kind === MIMIC_KIND && !fire) {
    if (!byPet) feat(g, "clang");
    m.stunUntil = g.now + (byPet ? 200 : 450);
    say(g, cx, cy - 4, "Clang!", "#c8c0b0", 500);
    g.sfx.push("clang");
    if (!m.petBlocked) {
      m.petBlocked = true;
      say(g, cx, cy - 14, g.firebolt ? "Only fire hurts it! (F)" : "Only fire hurts it!", "#ffb347", 1600);
    }
    return;
  }
  if (m.ward > 0) {
    if (fire) {
      m.ward--;
      burst(g, cx, cy + 8, "#9fe6ff", m.ward ? 12 : 30, m.ward ? 1.8 : 3);
      if (m.ward) say(g, cx, cy - 4, "The ward cracks!", "#9fe6ff", 900);
      else {
        say(g, cx, cy - 6, "Ward shattered!", "#9fe6ff", 1300);
        g.sfx.push("shatter");
        feat(g, "wardBreak");
        m.stunUntil = g.now + 700;
        m.windupUntil = 0;
      }
      return;
    }
    say(g, cx, cy - 4, "Warded!", "#9fe6ff", 500);
    g.sfx.push("clang");
    sayOnce(g, "ward", g.firebolt ? "Its ward turns steel. Break it with firebolt (F)!" : "Its ward turns steel. Only fire breaks it. Run!", "#9fe6ff");
    return;
  }
  if (byPet && !canSolo(g.pet?.art.tier ?? 0, g.depth) && m.hp - dmg <= 0) {
    if (m.hp > 1) m.hp = 1;
    else if (!m.petBlocked) {
      m.petBlocked = true;
      say(g, cx, cy - 8, "Needs your pickaxe!", "#ffb347");
    }
    return;
  }
  const hide = m.kind === XORN_KIND && !crit && !fire;
  const dealt = hide ? Math.max(1, Math.round(dmg / 2)) : dmg;
  if (hide && !byPet) sayOnce(g, "stonehide", "Its stone hide turns half the blow. Crits and fire bite in full.", "#c9b8a0");
  m.hp -= dealt;
  g.sfx.push(crit ? "crit" : hide ? "clang" : "hit");
  say(g, cx, cy, String(Math.round(dealt)), crit ? "#ffe066" : hide ? "#a59c8e" : "#ffffff", 600);
  burst(g, cx, cy + 8, "#ffffff", crit ? 6 : 3);
  if (m.hp > 0) return;
  if (m.kind === 4 && !crit && !m.revived && !byPet) {
    m.revived = true;
    m.hp = Math.ceil(m.maxHp / 2);
    say(g, cx, cy - 8, "It pulls itself back together!", "#e8e0cc", 1400);
    return;
  }
  killMonster(g, m, byPet);
}

function knockback(g: Game, m: Monster, tiles: number) {
  const dir = Math.sign(m.x - g.player.x) || g.player.face;
  let to = m.x;
  for (let k = 0; k < tiles; k++) {
    const nx = to + dir;
    if (!isOpen(g, nx, m.y) || g.monsters.some((o) => o !== m && o.x === nx && o.y === m.y)) break;
    to = nx;
  }
  if (to !== m.x) tweenTo(m, to, m.y, 90);
}

function attack(g: Game, m: Monster) {
  const p = g.player;
  if (g.now < p.nextSwing) return;
  const crit = swing(g);
  p.critStreak = crit ? p.critStreak + 1 : 0;
  if (p.critStreak === 3) feat(g, "hatTrick");
  const airborne = !supported(g, p.x, p.y);
  p.combo = g.now < p.comboUntil ? p.combo + 1 : 1;
  p.comboUntil = g.now + COMBO_MS;
  const heavy = p.combo >= 3;
  let dmg = crit ? critHit(g.stats) : g.stats.power;
  const pet = g.petActor;
  if (crit && pet?.key === "blinkdog" && Math.abs(pet.px - m.x) < 2) dmg *= 1.5;
  if (crit && pet?.key === "fox") {
    dmg *= 1.25;
    burst(g, (m.x + 0.5) * T, m.y * T, "#fff3b0", 10, 2);
  }
  const cx = (m.x + 0.5) * T;
  const cy = m.y * T;
  if (airborne) {
    dmg *= 1.5;
    feat(g, "jumpStrike");
    say(g, cx, cy - 16, "JUMP STRIKE!", "#9fe6ff", 900);
  }
  if (heavy) {
    p.combo = 0;
    p.heavyAt = g.now;
    dmg *= 1.5;
    say(g, cx, cy - 22, "SMASH!", "#ffb347", 900);
    burst(g, cx, cy + 8, "#ffb347", 14, 2.6);
    g.sfx.push("smash");
    feat(g, "smash");
  } else if (p.combo === 2) say(g, cx + 10, cy - 12, "x2", "#ffe066", 600);
  damageMonster(g, m, Math.round(dmg), crit, null);
  if (m.hp <= 0 && heavy) feat(g, "smashKill");
  if (m.hp <= 0 && airborne) feat(g, "jumpKill");
  if (crit || heavy || airborne) shake(g, heavy ? 3 : 2, heavy ? 180 : 120);
  if (m.hp <= 0 || m.kind === MIMIC_KIND || m.ward > 0) return;
  const poise = KINDS[m.kind].poise;
  m.poise = (m.poise || poise) - 1;
  if (crit || heavy || m.poise <= 0) {
    m.poise = poise;
    m.windupUntil = 0;
    if (m.slamAt) {
      m.slamAt = 0;
      say(g, (m.x + 0.5) * T, m.y * T - 6, "Slam broken!", "#9db6ff", 900);
    }
    m.stunUntil = Math.max(m.stunUntil, g.now + HITSTUN_MS * (heavy ? 2 : 1));
    knockback(g, m, heavy || crit ? 2 : 1);
  }
  if (!crit) return;
  const set = g.stats.setBonus;
  if (set === 6) {
    m.slowUntil = g.now + 3000;
    burst(g, (m.x + 0.5) * T, m.y * T, "#f0a8ff", 8, 1.4);
  }
  if (set === 7) {
    m.burnUntil = g.now + 3000;
    m.nextBurn = g.now + 600;
  }
}

function dashStrike(g: Game, m: Monster) {
  const set = g.stats.setBonus;
  const crit = set === 10;
  const dmg = dashHit(g.stats);
  say(g, (m.x + 0.5) * T, m.y * T - 12, "Dash strike!", dashColor(set), 600);
  damageMonster(g, m, Math.round(dmg), crit, null, set === 7);
  if (m.hp <= 0) {
    feat(g, "dashKill");
    return;
  }
  if (set === 4) m.slowUntil = g.now + 2000;
  if (set === 7) {
    m.burnUntil = g.now + 3000;
    m.nextBurn = g.now + 600;
  }
  if (set === 6 || set === 9) m.stunUntil = Math.max(m.stunUntil, g.now + 500);
  if (set === 2 || set === 9) knockback(g, m, set === 9 ? 2 : 1);
}

function dash(g: Game, keys: Keys) {
  const p = g.player;
  const set = g.stats.setBonus;
  const d = keys.left ? -1 : keys.right ? 1 : p.face;
  let to = p.x;
  for (let k = 1; k <= (g.stats.dashTiles ?? 2); k++) {
    const nx = p.x + d * k;
    if (!isOpen(g, nx, p.y) || !isOpen(g, nx, p.y - 1)) break;
    to = nx;
  }
  if (to === p.x) return false;
  const from = p.x;
  p.nextDash = g.now + dashCooldown(g);
  p.dashUntil = g.now + DASH_MS;
  p.invulnUntil = g.now + IFRAME_MS;
  dust(g, p.x + 0.5, p.y + 1, 6);
  g.sfx.push("dash");
  feat(g, "dash");
  tweenTo(p, to, p.y, DASH_MS);
  if (set > 0)
    for (let x = from; x !== to + d; x += d) burst(g, (x + 0.5) * T, (p.y + 0.5) * T, dashColor(set), set >= 8 ? 5 : 3, 1.2);
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  for (const m of liveMonsters(g)) if (m.x >= lo && m.x <= hi && (m.y === p.y || m.y === p.y - 1)) dashStrike(g, m);
  return true;
}

function hurt(g: Game, amount: number, color = "#ff5a4a") {
  const p = g.player;
  if (g.now < p.invulnUntil) {
    say(g, (p.x + 0.5) * T, (p.y - 1.5) * T, "Dodged!", "#9fe6ff", 600);
    feat(g, "dodge");
    if (p.hp < g.stats.maxHp * LOW_HP) feat(g, "notToday");
    return;
  }
  const dmg = Math.max(
    1,
    Math.round(amount * (g.pet?.key === "owlbear" ? 0.7 : 1) * (1 - g.stats.armor) * (blessed(g, "shield") ? 1 - SHIELD_CUT : 1)),
  );
  p.hp -= dmg;
  p.lastHurt = g.now;
  p.hurtUntil = g.now + 160;
  g.sfx.push("hurt");
  shake(g, 2, 140);
  burst(g, (p.x + 0.5) * T, (p.y - 0.5) * T, color, 6, 1.6);
  say(g, (p.x + 0.5) * T, (p.y - 1.5) * T, `-${dmg}`, color, 800);
  if (p.hp <= 0) {
    p.hp = 0;
    g.fainted = true;
  }
}

function foeToward(g: Game, aim: { x: number; y: number }) {
  const p = g.player;
  const { x, y } = p;
  const dx = aim.x - (x + 0.5);
  const dy = aim.y - y;
  const live = liveMonsters(g).filter((m) => strikable(p, m));
  const off = (m: Monster) => {
    const d = drawPos(m);
    return Math.hypot(d.x + 0.5 - aim.x, d.y + 0.5 - aim.y);
  };
  const closest = live.reduce<Monster | undefined>((a, m) => (!a || off(m) < off(a) ? m : a), undefined);
  if (closest && off(closest) <= 1.2) return closest;
  return Math.abs(dx) >= Math.abs(dy)
    ? live.find((m) => strikable(p, m, dx < 0 ? -1 : 1))
    : live.find((m) => strikeSpots(m).some(([sx, sy]) => sx === x && (dy > 0 ? sy > y : sy < y - 1)));
}

function attackToward(g: Game, aim: { x: number; y: number }) {
  const foe = foeToward(g, aim);
  if (foe) return attack(g, foe);
  const cell = aimCell(g, aim);
  if (cell >= 0) return hitCell(g, cell % g.W, Math.floor(cell / g.W));
  swing(g);
}

function aimCell(g: Game, aim: { x: number; y: number }) {
  if (g.camp) return -1;
  const { x, y } = g.player;
  const dx = aim.x - (x + 0.5);
  const dy = aim.y - y;
  const cx = Math.floor(aim.x);
  const cy = Math.floor(aim.y);
  const solid = (cx2: number, cy2: number) => !isOpen(g, cx2, cy2) && cellAt(g, cx2, cy2) !== BEDROCK;
  const adjacent =
    (Math.abs(cx - x) === 1 && (cy === y || cy === y - 1)) || (cx === x && (cy === y + 1 || cy === y - 2));
  if (adjacent && solid(cx, cy)) return cy * g.W + cx;
  const far = Math.max(Math.abs(cx - x), cy < y - 1 ? y - 1 - cy : cy > y ? cy - y : 0);
  if (far <= g.stats.reach && solid(cx, cy) && exposed(g, cx, cy) && clearLine(g, cx, cy)) return cy * g.W + cx;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const nx = x + (dx < 0 ? -1 : 1);
    const row = (dy < 0 ? [y - 1, y] : [y, y - 1]).find((r) => !isOpen(g, nx, r));
    return row !== undefined && solid(nx, row) ? row * g.W + nx : -1;
  }
  const ry = dy > 0 ? y + 1 : y - 2;
  return solid(x, ry) ? ry * g.W + x : -1;
}

function clearLine(g: Game, cx: number, cy: number) {
  const { x, y } = g.player;
  const ax = x + 0.5;
  const ay = y - 0.5;
  const n = Math.ceil(Math.hypot(cx + 0.5 - ax, cy + 0.5 - ay) * 5);
  for (let k = 1; k < n; k++) {
    const px = Math.floor(ax + ((cx + 0.5 - ax) * k) / n);
    const py = Math.floor(ay + ((cy + 0.5 - ay) * k) / n);
    if ((px === cx && py === cy) || (px === x && (py === y || py === y - 1))) continue;
    if (!isOpen(g, px, py)) return false;
  }
  return true;
}

function previewTarget(g: Game, keys: Keys) {
  const p = g.player;
  const { x, y } = p;
  if (g.camp || g.asleep || p.t < p.dur) return -1;
  if (g.hover) return aimCell(g, g.hover);
  if (keys.down) return aimCell(g, { x: x + 0.5, y: y + 1.5 });
  if (keys.up) return aimCell(g, { x: x + 0.5, y: y - 1.5 });
  const d = keys.left ? -1 : keys.right ? 1 : p.face;
  return aimCell(g, { x: x + 0.5 + d, y: y - 0.5 });
}

function act(g: Game, keys: Keys, aim: Aim, grounded: boolean) {
  const p = g.player;
  const { x, y } = p;
  const ready = g.now >= p.nextSwing;
  const moving = keys.left || keys.right || keys.up || keys.down || keys.jump;

  const heavy = encumbered(g) && burden(g) >= OVERLOADED;
  if ((keys.jump || keys.dash) && heavy && grounded)
    sayOnce(g, "nojump", "Overloaded: too heavy to jump or dash. Bank the ore, or sell some to Moss.", "#ffb347");
  if (keys.dash && grounded && !heavy && g.now >= p.nextDash && dash(g, keys)) return;

  if (aim) {
    const dx = aim.x - (x + 0.5);
    if (Math.abs(dx) >= 0.3) p.face = dx < 0 ? -1 : 1;
    if (ready) {
      const foe = foeToward(g, aim);
      if (foe) return attack(g, foe);
      const cell = aimCell(g, aim);
      if (cell >= 0) return hitCell(g, cell % g.W, Math.floor(cell / g.W));
      if (!moving) return void swing(g);
    } else if (!moving) return;
  }
  if (keys.attack && ready) return attackToward(g, { x: x + 0.5 + p.face, y: y - 0.5 });

  if (g.now < p.rootUntil && (keys.jump || keys.left || keys.right || keys.up || keys.down)) return;

  if (keys.jump && grounded && !heavy && isOpen(g, x, y - 2)) {
    const high = g.stats.setBonus === 8 && isOpen(g, x, y - 3);
    const h = high ? 2 : 1;
    const d = keys.left ? -1 : keys.right ? 1 : 0;
    const over =
      d !== 0 &&
      Array.from({ length: h + 1 }, (_, i) => y - 1 - i).every((r) => isOpen(g, x + d, r)) &&
      !liveMonsters(g).some((mm) => mm.x === x + d && mm.y <= y - 1 && mm.y >= y - 1 - h && mm.dmg > 0);
    if (d && !aim) p.face = d;
    p.hangUntil = g.now + JUMP_MS * (high ? 1.6 : 1) + HANG_MS;
    p.jumpAt = g.now;
    p.jumpH = h;
    p.jumpTop = y - h;
    g.sfx.push("jump");
    dust(g, x + 0.5, y + 1, 3);
    return tweenTo(p, over ? x + d : x, y - h, JUMP_MS * (high ? 1.6 : 1) * (over ? 1.15 : 1));
  }

  if (keys.left || keys.right) {
    const d = keys.left ? -1 : 1;
    if (!aim) p.face = d;
    const foe = liveMonsters(g).find((mm) => strikable(p, mm, d));
    if (foe && ready && !aim) return attack(g, foe);
    const nx = x + d;
    const blocked = liveMonsters(g).some(
      (mm) => mm.x === nx && (mm.y === y || mm.y === y - 1) && g.now >= mm.stunUntil && mm.dmg > 0,
    );
    if (blocked) return;
    if (isOpen(g, nx, y) && isOpen(g, nx, y - 1)) {
      if (grounded) dust(g, x + 0.5 - d * 0.3, y + 1, 1);
      return tweenTo(p, nx, y, WALK_MS);
    }
    return hitCell(g, nx, isOpen(g, nx, y - 1) ? y : y - 1);
  }

  if (keys.down) {
    if (isOpen(g, x, y + 1)) return tweenTo(p, x, y + 1, CLIMB_MS);
    return hitCell(g, x, y + 1);
  }

  if (keys.up && !g.camp) {
    addLadder(g, x, y);
    if (isOpen(g, x, y - 2)) {
      addLadder(g, x, y - 1);
      return tweenTo(p, x, y - 1, CLIMB_MS);
    }
    return hitCell(g, x, y - 2);
  }
}

export interface DwarfPose {
  bodyDy: number;
  lean: number;
  leftDy: number;
  rightDy: number;
  leftDx: number;
  rightDx: number;
  blink: boolean;
  glance: boolean;
  dashing: boolean;
  flicker: boolean;
  air: boolean;
  stride: number;
}

export function dwarfPose(g: Game): DwarfPose {
  const p = g.player;
  const now = g.now;
  const k = p.dur > 0 ? Math.min(1, p.t / p.dur) : 1;
  const tweening = k < 1;
  const air = p.fell > 0 || !supported(g, p.x, p.y) || (tweening && p.y < p.fromY && !g.ladders.has(p.fromY * g.W + p.x));
  const walking = tweening && p.fromY === p.y && p.fromX !== p.x && now >= p.dashUntil;
  const climbing = tweening && p.fromX === p.x && !air;
  const lead = p.x % 2 === 0;
  const step = walking ? Math.round(Math.sin(k * Math.PI) * 2) : 0;
  const climb = climbing ? (k < 0.5 ? 1 : 0) : 0;
  const idle = !tweening && !air && now - p.landAt > 160;
  const breathe = idle && Math.floor(now / 900) % 2 === 0 ? -1 : 0;
  const squash = now - p.landAt < 140 ? 1 : 0;
  const lean = (now < p.strikeUntil ? 1 : 0) + (now < p.dashUntil ? 1 : 0) - (now < p.hurtUntil ? 1 : 0);
  return {
    bodyDy: breathe + squash + (walking && step > 0 ? -1 : 0) + (air ? -1 : 0),
    lean,
    leftDy: air ? -1 : -(lead ? step : 0) - climb,
    rightDy: air ? -1 : -(lead ? 0 : step) - (climbing ? 1 - climb : 0),
    leftDx: walking ? (lead ? 1 : -1) * (step > 0 ? 1 : 0) : air ? 1 : 0,
    rightDx: walking ? (lead ? -1 : 1) * (step > 0 ? 1 : 0) : air ? -1 : 0,
    blink: now % 3600 < 130,
    glance: idle && now - g.lastInput > 5000 && Math.floor(now / 2200) % 3 === 2,
    dashing: now < p.dashUntil,
    flicker: now < p.invulnUntil && Math.floor(now / 60) % 2 === 0,
    air,
    stride: walking ? Math.sin(k * Math.PI) * (lead ? 1 : -1) : 0,
  };
}

const FLIERS = new Set([3, 5]);

const supported = (g: Game, x: number, y: number) => !isOpen(g, x, y + 1) || g.ladders.has(y * g.W + x);

function moves(g: Game, x: number, y: number, fly: boolean): [number, number][] {
  if (fly)
    return (
      [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ] as [number, number][]
    ).filter(([a, b]) => isOpen(g, a, b));
  if (!supported(g, x, y)) return [[x, y + 1]];
  const out: [number, number][] = [];
  for (const d of [-1, 1]) {
    if (isOpen(g, x + d, y)) out.push([x + d, y]);
    else if (isOpen(g, x + d, y - 1) && isOpen(g, x, y - 1)) out.push([x + d, y - 1]);
  }
  if (g.ladders.has(y * g.W + x)) {
    if (isOpen(g, x, y - 1)) out.push([x, y - 1]);
    if (isOpen(g, x, y + 1)) out.push([x, y + 1]);
  }
  return out;
}

function route(g: Game, m: Monster, fly: boolean) {
  const W = g.W;
  const prev = new Int32Array(W * g.H).fill(-1);
  const start = m.y * W + m.x;
  const blocked = new Set(
    liveMonsters(g)
      .filter((o) => o !== m)
      .map((o) => o.y * W + o.x),
  );
  const q = [start];
  prev[start] = start;
  for (let head = 0; head < q.length && head < 2500; head++) {
    const i = q[head];
    const x = i % W;
    const y = Math.floor(i / W);
    if (i !== start && touches(g.player, x, y) && !blocked.has(i)) {
      let k = i;
      while (prev[k] !== start) k = prev[k];
      return k;
    }
    for (const [nx, ny] of moves(g, x, y, fly)) {
      const j = ny * W + nx;
      if (prev[j] !== -1 || (blocked.has(j) && prev[i] === i)) continue;
      prev[j] = i;
      q.push(j);
    }
  }
  return -1;
}

function distanceField(g: Game) {
  const p = g.player;
  const key = p.y * g.W + p.x;
  const d = g.dist;
  d.fill(-1);
  const q = new Int32Array(g.W * g.H);
  let head = 0;
  let tail = 0;
  for (const i of [key, key - g.W]) {
    if (i < 0 || g.map[i] !== OPEN) continue;
    d[i] = 0;
    q[tail++] = i;
  }
  while (head < tail) {
    const i = q[head++];
    const x = i % g.W;
    for (const j of [x > 0 ? i - 1 : -1, x < g.W - 1 ? i + 1 : -1, i - g.W, i + g.W]) {
      if (j < 0 || j >= d.length || d[j] !== -1 || g.map[j] !== OPEN) continue;
      d[j] = Math.min(32000, d[i] + 1);
      q[tail++] = j;
    }
  }
}

const unlit = (g: Game, x: number, y: number) => {
  const p = g.player;
  const lit = lightRadius(g) + 1.5;
  if ((x - p.x) ** 2 + (y - p.y) ** 2 <= lit * lit) return false;
  if (Math.abs(x - g.liftX) <= 5 && Math.abs(y - g.liftY) <= 4) return false;
  for (const t of g.torches) if (((t % g.W) - x) ** 2 + (Math.floor(t / g.W) - y) ** 2 < (TORCH_LIGHT + 1.5) ** 2) return false;
  return true;
};

function spawn(g: Game, alarm = false) {
  const p = g.player;
  const cap = 2 + Math.floor(g.depth / 3) + (alarm ? 2 : 0);
  const dark = inTorchlight(g, p.x, p.y - 1) ? 1 : 0.55;
  g.nextSpawn = g.now + Math.max(10_000, 26_000 - g.depth * 1500) * (0.7 + rand() * 0.6) * dark;
  if (liveMonsters(g).length >= cap) return;
  const kind = g.depth > 1 && rand() < 0.3 ? g.depth - 1 : g.depth;
  const spec = KINDS[kind];
  const cells: number[] = [];
  for (let i = 0; i < g.dist.length; i++) {
    const x = i % g.W;
    const y = Math.floor(i / g.W);
    if (!unlit(g, x, y)) continue;
    if (spec.tunnel) {
      if (g.map[i] !== BEDROCK && Math.max(Math.abs(x - p.x), Math.abs(y - p.y)) === 8) cells.push(i);
      continue;
    }
    if (g.dist[i] < 7 || g.dist[i] > 22) continue;
    if (kind === 3 ? isOpen(g, x, y - 1) : !FLIERS.has(kind) && !supported(g, x, y)) continue;
    cells.push(i);
  }
  if (!cells.length) return;
  const at = cells[Math.floor(rand() * cells.length)];
  const x = at % g.W;
  rarify(g, addMonster(g, kind, x, Math.floor(at / g.W)));
  const pack = (rand() < 0.2 + g.depth * 0.04 ? 1 : 0) + (g.depth >= 5 && rand() < 0.15 ? 1 : 0);
  const near = cells
    .filter((i) => i !== at && Math.abs((i % g.W) - x) + Math.abs(Math.floor(i / g.W) - Math.floor(at / g.W)) <= 4)
    .sort(() => rand() - 0.5);
  for (const i of near.slice(0, Math.min(pack, cap - liveMonsters(g).length)))
    rarify(g, addMonster(g, kind, i % g.W, Math.floor(i / g.W)));
  const pet = g.petActor;
  if (pet?.key === "bat")
    say(g, (pet.px + 0.5) * T, (pet.py - 1) * T, x < p.x ? "← Squeak!" : "Squeak! →", "#d07a8c", 1600);
}

export function rarify(g: Game, m: Monster, force = false) {
  const def = RARE[m.kind];
  if (!def || (!force && rand() >= RARE_CHANCE)) return m;
  m.rare = true;
  m.def = def;
  m.hp = m.maxHp = Math.round(m.maxHp * 1.4);
  burst(g, (m.x + 0.5) * T, m.y * T + 8, m.kind === 3 ? "#9ae05a" : "#c86aff", 10, 1.6);
  return m;
}

const inReach = (p: Player, m: Monster) =>
  isZombie(m) ? Math.abs(m.x - p.x) <= ROT_RANGE && Math.abs(m.y - (p.y - 0.5)) <= ROT_RANGE + 0.5 : reaches(p, m);

function rot(g: Game, m: Monster) {
  const cx = (m.x + 0.5) * T;
  const cy = (m.y + 0.5) * T;
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    g.parts.push({ x: cx, y: cy, vx: Math.cos(a) * 1.4, vy: Math.sin(a) * 1.4, life: 420, color: k % 2 ? "#c86aff" : "#7ee05a" });
  }
  say(g, cx, m.y * T - 10, "Necrotic burst!", "#c86aff", 800);
}

function hopBack(g: Game, m: Monster) {
  const dir = Math.sign(m.x - g.player.x) || 1;
  if (!isOpen(g, m.x + dir, m.y) || !supported(g, m.x + dir, m.y)) return;
  tweenTo(m, m.x + dir, m.y, 160);
  m.nextMove = g.now + 700;
  say(g, (m.x + 0.5) * T, m.y * T - 4, "hehe!", "#e0a060", 600);
}

export const inSlam = (g: Game, m: Monster) => {
  const p = g.player;
  return Math.abs(p.x - m.x) <= SLAM_RANGE && Math.abs(p.y - m.y) <= 1 && supported(g, p.x, p.y);
};

function golemSlam(g: Game, m: Monster) {
  const p = g.player;
  if (m.slamAt && g.now >= m.slamAt) {
    m.slamAt = 0;
    m.nextSlam = g.now + SLAM_EVERY_MS;
    m.nextHit = g.now + 900;
    shake(g, 4, 320);
    g.sfx.push("break");
    for (let dx = -SLAM_RANGE; dx <= SLAM_RANGE; dx++) burst(g, (m.x + dx + 0.5) * T, (m.y + 1) * T, "#9db6ff", 5, 1.8);
    if (inSlam(g, m)) hurt(g, m.dmg * 0.8, "#9db6ff");
    else if (Math.abs(p.x - m.x) <= SLAM_RANGE) feat(g, "sidestep");
    return true;
  }
  if (m.slamAt) return true;
  if (g.now < m.nextSlam || !supported(g, m.x, m.y)) return false;
  if (Math.abs(p.x - m.x) > SLAM_RANGE || Math.abs(p.y - m.y) > 1) return false;
  m.slamAt = g.now + SLAM_WINDUP_MS;
  say(g, (m.x + 0.5) * T, m.y * T - 6, "RUMBLE", "#9db6ff", SLAM_WINDUP_MS);
  sayOnce(g, "slam", "The golem raises its fists. Jump, or stagger it!", "#9db6ff");
  return true;
}

function stepEmbers(g: Game) {
  if (!g.embers.size) return;
  const p = g.player;
  for (const [i, until] of g.embers) if (g.now >= until) g.embers.delete(i);
  if (g.embers.has(p.y * g.W + p.x) && supported(g, p.x, p.y)) {
    p.burnUntil = Math.max(p.burnUntil, g.now + 1500);
    sayOnce(g, "embers", "Salamanders leave burning embers where they crawl.", "#ff8a2a");
  }
}

function stepMonsters(g: Game, dt: number) {
  const p = g.player;
  for (const m of g.monsters) {
    m.t += dt;
    if (m.leaving) continue;
    if (g.now < m.burnUntil && g.now >= m.nextBurn && m.hp > 0) {
      m.nextBurn = g.now + 600;
      burst(g, (m.x + 0.5) * T, (m.y + 0.5) * T, "#ff8a2a", 5, 1.2);
      damageMonster(g, m, Math.max(1, Math.round(g.stats.power * 0.4)), false, null, true);
    }
    if (m.hp <= 0) continue;
    if (g.asleep) {
      m.leaving = g.now;
      continue;
    }
    if (m.t < m.dur) continue;
    const spec = KINDS[m.kind];
    const fly = FLIERS.has(m.kind);
    if (!spec.tunnel && !fly && !supported(g, m.x, m.y)) {
      tweenTo(m, m.x, m.y + 1, FALL_MS);
      continue;
    }
    if (g.grab?.m === m) continue;
    if (g.now < m.stunUntil) continue;
    if (m.windupUntil && g.now >= m.windupUntil) {
      m.windupUntil = 0;
      m.nextHit = g.now + 1100;
      m.lungeUntil = g.now + 180;
      if (isZombie(m)) rot(g, m);
      if (reaches(p, m) && !m.dmg) shove(g, m);
      else if (inReach(p, m)) {
        const before = p.hp;
        hurt(g, m.dmg, isZombie(m) ? "#c86aff" : undefined);
        if (p.hp < before && m.kind === 3 && m.rare) {
          if (g.now >= p.poisonUntil) say(g, (p.x + 0.5) * T, (p.y - 2) * T, "Poisoned!", "#9ae05a", 900);
          p.poisonUntil = g.now + POISON_MS;
          p.nextPoison = Math.max(p.nextPoison, g.now + POISON_TICK_MS);
        } else if (p.hp < before && m.kind === 3) p.slowUntil = g.now + 3000;
        if (p.hp < before && m.kind === 7) p.burnUntil = g.now + 3000;
        if (p.hp < before && m.kind === CUBE_KIND && g.now > p.rootUntil + ENGULF_GRACE_MS) {
          p.rootUntil = g.now + ENGULF_MS;
          say(g, (p.x + 0.5) * T, (p.y - 2) * T, "Engulfed!", "#9be07a", ENGULF_MS);
        }
        if (m.kind === KOBOLD_KIND) hopBack(g, m);
        if (p.hp > 0 && m.kind === MIMIC_KIND && !m.grappled && !g.grab) startGrab(g, m);
      } else {
        say(g, (m.x + 0.5) * T, m.y * T, "miss", "#a59c8e", 500);
        feat(g, "sidestep");
      }
      continue;
    }
    if (m.windupUntil) continue;
    if (m.kind === GOLEM_KIND && golemSlam(g, m)) continue;
    if (inReach(p, m)) {
      m.lost = 0;
      if (g.now >= m.nextHit) m.windupUntil = g.now + KINDS[m.kind].windup;
      continue;
    }
    if (g.now < m.nextMove) continue;
    m.nextMove = g.now + m.moveMs * (g.now < m.slowUntil ? 2 : 1);
    if (spec.tunnel) {
      const occupied = (x: number, y: number) => g.monsters.some((o) => o !== m && o.x === x && o.y === y);
      const dx = Math.sign(p.x - m.x);
      const dy = Math.sign(p.y - 1 - m.y);
      const [nx, ny] = Math.abs(p.x - m.x) >= Math.abs(p.y - m.y) && dx ? [m.x + dx, m.y] : [m.x, m.y + (dy || dx)];
      if (cellAt(g, nx, ny) !== BEDROCK && !occupied(nx, ny)) tweenTo(m, nx, ny, m.moveMs * 0.9);
      continue;
    }
    let next = route(g, m, fly);
    if (next >= 0 && m.kind === SKITTER_KIND && rand() < SKITTER_CHANCE) {
      const dir = (next % g.W) - m.x || (rand() < 0.5 ? -1 : 1);
      if (isOpen(g, m.x - dir, m.y)) next = m.y * g.W + m.x - dir;
    }
    if (next >= 0) {
      m.lost = 0;
      if (m.kind === SALAMANDER_KIND) g.embers.set(m.y * g.W + m.x, g.now + SALAMANDER_TRAIL_MS);
      const nx = next % g.W;
      const ny = Math.floor(next / g.W);
      tweenTo(m, nx, ny, ny > m.y && !fly && !g.ladders.has(m.y * g.W + m.x) ? FALL_MS : m.moveMs * 0.9);
      continue;
    }
    if (!m.lost) m.lost = g.now;
    else if (g.now - m.lost > 10_000 && unlit(g, m.x, m.y)) m.leaving = g.now;
  }
  g.monsters = g.monsters.filter((m) => {
    if (!m.leaving || g.now - m.leaving < 900) return true;
    const home = m.cell;
    if (m.kind === MIMIC_KIND && g.map[home] === OPEN && !touches(p, home % g.W, Math.floor(home / g.W)))
      g.map[home] = MIMIC;
    return false;
  });
}

function stepPet(g: Game, dt: number) {
  const pet = g.petActor;
  if (!pet) return;
  const p = g.player;
  const pos = drawPos(p);
  const fly = !!pet.art.fly && !g.asleep;
  const foe = liveMonsters(g)
    .filter((m) => Math.abs(m.x - p.x) + Math.abs(m.y - p.y) <= 4 && (m.kind !== 6 || Math.abs(m.x - p.x) <= 2))
    .sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
  const tx = foe && !g.asleep ? foe.x + (foe.x <= p.x ? -0.8 : 0.8) : pos.x - p.face * 0.9;
  const ty = foe && !g.asleep ? foe.y - (fly ? 0.6 : 0) : pos.y - (fly ? 1.2 : 0);
  const k = Math.min(1, (dt / 1000) * 7);
  const dx = tx - pet.px;
  pet.px += dx * k;
  pet.py += (ty - pet.py) * k;
  if (Math.abs(dx) > 0.05) pet.face = dx < 0 ? -1 : 1;
  if (foe) pet.face = foe.x < pet.px ? -1 : 1;
  if (!foe || g.asleep || g.now < pet.nextHit || Math.abs(pet.px - foe.x) > 1.3 || Math.abs(pet.py - foe.y) > 1.6)
    return;
  pet.nextHit = g.now + 1000;
  pet.hopUntil = g.now + 160;
  const dmg = Math.round(2 * 2.4 ** (pet.art.tier - 1));
  const name = pet.art.name;
  if (pet.key === "dragon") {
    burst(g, (pet.px + 0.5 + pet.face * 0.6) * T, (pet.py + 0.4) * T, "#ff8a2a", 10, 1.6);
    for (const m of liveMonsters(g))
      if (Math.abs(m.x - pet.px) <= 2.2 && Math.abs(m.y - pet.py) <= 1.6) damageMonster(g, m, dmg, false, name);
    return;
  }
  if (pet.key === "fox") burst(g, (foe.x + 0.5) * T, foe.y * T, "#fff3b0", 6, 1.8);
  if (pet.key === "toad") foe.stunUntil = g.now + 800;
  damageMonster(g, foe, dmg, false, name);
}

function stepEffects(g: Game, dt: number) {
  const f = dt / 16.67;
  for (const q of g.parts) q.life -= dt;
  g.parts = g.parts.filter((q) => q.life > 0);
  for (const q of g.parts) {
    q.x += q.vx * f;
    q.y += q.vy * f;
    q.vy += 0.35 * f;
  }
  for (const t of g.texts) {
    t.life -= dt;
    t.y -= 0.5 * f;
  }
  g.texts = g.texts.filter((t) => t.life > 0);
  for (const z of g.zs) z.life -= dt;
  g.zs = g.zs.filter((z) => z.life > 0);
  for (const z of g.zs) {
    z.y -= 0.4 * f;
    z.x += Math.sin(z.life / 250) * 0.25 * f;
  }
}

function stepPlayer(g: Game, dt: number, keys: Keys, aim: Aim) {
  const p = g.player;
  const max = g.stats.maxHp;
  const resting = g.now - p.lastHurt > REST_MS && inTorchlight(g, p.x, p.y - 1);
  const rest = resting ? (byLiftTorch(g, p.x, p.y - 1) ? 0.06 : 0.03) : 0;
  const poisoned = g.now < p.poisonUntil;
  const regen = poisoned ? 0 : (g.pet?.key === "wisp" ? 0.03 : 0) + rest + (blessed(g, "regen") ? BLESSED_REGEN : 0);
  p.hp = Math.min(max, p.hp + max * regen * (dt / 1000));
  if (g.now < p.burnUntil && g.now >= p.nextBurn) {
    p.nextBurn = g.now + 1000;
    hurt(g, g.info.monsterDamage * 0.2, "#ff8a2a");
  }
  if (poisoned && g.now >= p.nextPoison) {
    p.nextPoison = g.now + POISON_TICK_MS;
    hurt(g, g.info.monsterDamage * 0.15, "#7ee05a");
  }
  if (p.t < p.dur) {
    p.t += p.fell || !encumbered(g) ? dt : dt / scaled(ENCUMBERED_SLOW, burden(g));
    return;
  }
  const grounded = !isOpen(g, p.x, p.y + 1) || g.ladders.has(p.y * g.W + p.x);
  if (!grounded && g.now >= p.hangUntil) {
    p.fell++;
    const d = g.asleep || g.grab || g.now < p.rootUntil ? 0 : keys.left ? -1 : keys.right ? 1 : 0;
    const drift = d !== 0 && isOpen(g, p.x + d, p.y) && isOpen(g, p.x + d, p.y + 1);
    if (d && !aim) p.face = d;
    return tweenTo(p, drift ? p.x + d : p.x, p.y + 1, (p.fell === 1 ? FALL_MS * 2 : FALL_MS) * (drift ? 1.3 : 1));
  }
  if (grounded && p.fell > 0) {
    p.landAt = g.now;
    dust(g, p.x + 0.5, p.y + 1, Math.min(12, 3 + p.fell * 2));
    if (p.fell >= 8) feat(g, "bigFall");
    if (p.fell >= 3) {
      g.sfx.push("land");
      shake(g, 2, 120);
    }
    p.fell = 0;
  }
  if (grounded && g.hotOre >= 0 && cellAt(g, p.x, p.y + 1) === ORE0 + g.hotOre && !g.asleep) {
    p.burnUntil = Math.max(p.burnUntil, g.now + 400);
    sayOnce(g, "hotOre", "Flametouched Iron scorches your boots! Don't stand on it.", "#ff8a33");
  }
  if ((p.hp < max * LOW_HP || encumbered(g)) && g.now >= p.nextSweat && !g.asleep) {
    p.nextSweat = g.now + SWEAT_MS;
    g.parts.push({
      x: (p.x + 0.5 + p.face * 0.25) * T,
      y: (p.y - 1.4) * T,
      vx: -p.face * 0.5,
      vy: -1.1,
      life: 500,
      color: "#8fd3ff",
    });
  }
  if (!g.asleep && !stepGrab(g, keys)) act(g, keys, aim, grounded);
}

function startGrab(g: Game, m: Monster) {
  m.grappled = true;
  g.grab = {
    m,
    until: g.now + GRAB_MS,
    got: 0,
    next: -1,
    nextBite: g.now + GRAB_BITE_MS,
    left: false,
    right: false,
  };
  m.windupUntil = 0;
  const p = g.player;
  say(g, (p.x + 0.5) * T, (p.y - 3) * T, "GRABBED!", "#ff6a5a", 1200);
  sayOnce(g, "grab", "The mimic has you! Press A, D, A, D... as fast as you can to break free.", "#ff6a5a", 5000);
  shake(g, 3, 200);
  g.sfx.push("mimic");
}

function endGrab(g: Game, free: boolean) {
  const grab = g.grab;
  if (!grab) return;
  g.grab = null;
  const p = g.player;
  const m = grab.m;
  p.invulnUntil = Math.max(p.invulnUntil, g.now + 600);
  m.nextHit = g.now + 1200;
  if (!free) {
    say(g, (p.x + 0.5) * T, (p.y - 3) * T, "Spat out!", "#c9a04a", 900);
    return;
  }
  m.stunUntil = Math.max(m.stunUntil, g.now + 900);
  knockback(g, m, 1);
  burst(g, (p.x + 0.5) * T, (p.y - 0.5) * T, "#ffe066", 12, 2);
  say(g, (p.x + 0.5) * T, (p.y - 3) * T, "Broke free!", "#ffe066", 1000);
  g.sfx.push("smash");
  feat(g, "mimicEscape");
}

function stepGrab(g: Game, keys: Keys) {
  const grab = g.grab;
  if (!grab) return false;
  const m = grab.m;
  if (m.hp <= 0 || m.leaving || g.fainted) {
    g.grab = null;
    return false;
  }
  if (g.now >= grab.until) {
    endGrab(g, false);
    return true;
  }
  const pressed = keys.left && !grab.left ? -1 : keys.right && !grab.right ? 1 : 0;
  grab.left = keys.left;
  grab.right = keys.right;
  if (pressed && pressed === grab.next) {
    grab.got++;
    grab.next = grab.next === -1 ? 1 : -1;
    g.player.face = pressed;
    shake(g, 1, 60);
    if (grab.got >= GRAB_NEED) {
      endGrab(g, true);
      return true;
    }
  }
  if (g.now >= grab.nextBite) {
    grab.nextBite = g.now + GRAB_BITE_MS;
    hurt(g, Math.max(1, m.dmg * 0.3));
    m.lungeUntil = g.now + 160;
  }
  return true;
}

function stepBeetle(g: Game) {
  if (g.pet?.key !== "beetle" || g.now < g.nextBeetle) return;
  g.nextBeetle = g.now + 1500;
  const p = g.player;
  let best = -1;
  let bestOre = -1;
  for (let y = Math.max(0, p.y - 12); y <= Math.min(g.H - 1, p.y + 12); y++)
    for (let x = Math.max(0, p.x - 12); x <= Math.min(g.W - 1, p.x + 12); x++) {
      const o = oreOf(g.map[y * g.W + x]);
      if (o > bestOre) {
        bestOre = o;
        best = y * g.W + x;
      }
    }
  g.beetle = best;
}

export type TrapKey = "spikes" | "tripwire" | "frost" | "geyser" | "draft" | "magma" | "bones" | "rune" | "shards";

export interface Trap {
  i: number;
  key: TrapKey;
  phase: number;
  armedAt: number;
  sprung: boolean;
  fireAt: number;
  firedAt: number;
  hitCycle: number;
  target: number;
}

export const TRAPS: { key: TrapKey; depth: number; name: string; does: string }[] = [
  { key: "spikes", depth: 2, name: "Spike plate", does: "A pressure plate hidden in the floor. Step on it and spikes jab up, then it re-arms." },
  { key: "tripwire", depth: 3, name: "Rockfall tripwire", does: "A wire across the tunnel. Snap it and rocks come down a moment later on the three tiles around it." },
  { key: "frost", depth: 4, name: "Frost vent", does: "Breathes freezing mist up the tunnel on a rhythm. Caught in it, you're slowed and chilled." },
  { key: "geyser", depth: 5, name: "Fire geyser", does: "Hisses, then erupts in a column of fire that leaves you burning." },
  { key: "draft", depth: 6, name: "Guttering draft", does: "A cold gust from a crack in the floor. It does no harm, but your lantern gutters to half for a few seconds." },
  { key: "magma", depth: 7, name: "Magma crust", does: "A thin skin over molten rock. It burns for as long as you stand on it." },
  { key: "bones", depth: 8, name: "Bone rattle", does: "A string of old bones across the way. Brush it and the clatter calls monsters to you." },
  { key: "rune", depth: 9, name: "Rune mine", does: "A faint glyph on the floor. It flares a second after you step on it, then blows." },
  { key: "shards", depth: 10, name: "Star-shard field", does: "Bits of the fallen star rain down here. Watch for the glowing marks and step off them." },
];

const TRAP_CYCLE: Partial<Record<TrapKey, number>> = { frost: 4200, geyser: 3600, draft: 6000 };
const TRAP_ACTIVE_MS = 900;
const TRAP_WARN_MS = 700;
const DIM_MS = 4000;

const seeded = (text: string) => {
  let h = 2166136261;
  for (let k = 0; k < text.length; k++) h = Math.imul(h ^ text.charCodeAt(k), 16777619);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export function placeTraps(g: Game, seed: string): Trap[] {
  const pool = TRAPS.filter((t) => t.depth <= g.depth);
  if (!pool.length) return [];
  const newest = pool[pool.length - 1];
  const r = seeded(`${g.depth}:${seed}`);
  const spots: number[] = [];
  for (let i = g.W; i < g.map.length - g.W; i++) {
    if (i % g.W <= g.liftX + 8 || g.map[i] !== OPEN || g.map[i + g.W] === OPEN || i === g.trader) continue;
    spots.push(i);
  }
  const out: Trap[] = [];
  const want = 3 + g.depth;
  for (let tries = 0; out.length < want && tries < want * 20 && spots.length; tries++) {
    const i = spots[Math.floor(r() * spots.length)];
    const close = out.some(
      (t) => Math.abs((t.i % g.W) - (i % g.W)) + Math.abs(Math.floor(t.i / g.W) - Math.floor(i / g.W)) < 5,
    );
    if (close) continue;
    const key = r() < 0.4 ? newest.key : pool[Math.floor(r() * pool.length)].key;
    out.push({ i, key, phase: Math.floor(r() * 6000), armedAt: 0, sprung: false, fireAt: 0, firedAt: -1e9, hitCycle: -1, target: -1 });
  }
  return out;
}

export const trapCycle = (g: Game, t: Trap) => {
  const period = TRAP_CYCLE[t.key];
  if (!period) return null;
  const at = (g.now + t.phase) % period;
  return {
    n: Math.floor((g.now + t.phase) / period),
    active: at >= period - TRAP_ACTIVE_MS,
    warn: at >= period - TRAP_ACTIVE_MS - TRAP_WARN_MS,
  };
};

const trapName = (key: TrapKey) => TRAPS.find((t) => t.key === key)?.name ?? key;

function springLater(g: Game, t: Trap, tx: number, ty: number) {
  const p = g.player;
  const hit = g.info.monsterDamage;
  t.fireAt = 0;
  t.firedAt = g.now;
  shake(g, 3, 220);
  if (t.key === "tripwire") {
    for (let dx = -1; dx <= 1; dx++) burst(g, (tx + dx + 0.5) * T, (ty - 1) * T, "#8a7f72", 8, 2);
    if (Math.abs(p.x - tx) <= 1 && Math.abs(p.y - ty) <= 1) hurt(g, hit * 0.9);
  } else {
    burst(g, (tx + 0.5) * T, (ty + 0.5) * T, "#ff6a3a", 30, 3);
    burst(g, (tx + 0.5) * T, (ty + 0.5) * T, "#ffd23f", 16, 2.4);
    if (Math.abs(p.x - tx) <= 2 && Math.abs(p.y - ty) <= 2) hurt(g, hit * 1.2);
  }
}

function stepShards(g: Game, t: Trap, tx: number, ty: number) {
  const p = g.player;
  if (Math.abs(p.x - tx) > 8 || Math.abs(p.y - ty) > 5 || g.now < t.armedAt) return;
  if (t.target < 0) {
    const inField = Math.abs(p.x - tx) <= 3 && Math.abs(p.y - ty) <= 2;
    const x = inField && rand() < 0.6 ? p.x : tx + Math.floor(rand() * 7) - 3;
    let y = inField ? p.y : ty;
    while (y < g.H - 1 && isOpen(g, x, y + 1)) y++;
    if (!isOpen(g, x, y)) return;
    t.target = y * g.W + x;
    t.armedAt = g.now + 700;
    return;
  }
  const sx = t.target % g.W;
  const sy = Math.floor(t.target / g.W);
  burst(g, (sx + 0.5) * T, (sy + 0.5) * T, "#c9d6ff", 14, 2.2);
  if (p.x === sx && Math.abs(p.y - sy) <= 1) {
    hurt(g, g.info.monsterDamage * 0.6, "#9db6ff");
    sayOnce(g, "trap-shards", "Star-shard field!", "#ff8a6a");
  }
  t.target = -1;
  t.armedAt = g.now + 700;
}

function stepTraps(g: Game) {
  if (g.camp || g.asleep || !g.traps.length) return;
  const p = g.player;
  const hit = g.info.monsterDamage;
  for (const t of g.traps) {
    const tx = t.i % g.W;
    const ty = Math.floor(t.i / g.W);
    const cx = (tx + 0.5) * T;
    const cy = (ty + 0.5) * T;
    const on = p.x === tx && p.y === ty;
    const warn = () => sayOnce(g, `trap-${t.key}`, `${trapName(t.key)}!`, "#ff8a6a");
    if (t.key === "shards") {
      stepShards(g, t, tx, ty);
      continue;
    }
    if (t.fireAt && g.now >= t.fireAt) {
      springLater(g, t, tx, ty);
      warn();
      continue;
    }
    if (t.key === "spikes" && on && g.now >= t.armedAt) {
      t.armedAt = g.now + 2500;
      t.firedAt = g.now;
      burst(g, cx, cy + 6, "#d6d0c4", 8, 1.4);
      hurt(g, hit * 0.5);
      warn();
    } else if ((t.key === "tripwire" || t.key === "rune") && on && !t.sprung) {
      t.sprung = true;
      t.fireAt = g.now + (t.key === "rune" ? 900 : 700);
      say(g, cx, cy - 10, t.key === "rune" ? "The glyph flares!" : "*snap*", "#ffb347", 900);
      g.sfx.push("break");
    } else if (t.key === "bones" && Math.abs(p.x - tx) <= 1 && Math.abs(p.y - ty) <= 1 && !t.sprung) {
      t.sprung = true;
      t.firedAt = g.now;
      say(g, cx, cy - 10, "The bones rattle. Something heard that.", "#e8dcc0", 2200);
      g.sfx.push("clang");
      spawn(g, true);
      spawn(g, true);
    } else if (t.key === "magma" && on && g.now >= t.armedAt) {
      t.armedAt = g.now + 600;
      hurt(g, hit * 0.2, "#ff8a2a");
      p.burnUntil = Math.max(p.burnUntil, g.now + 1500);
      sayOnce(g, "trap-magma", "The crust is burning through your boots!", "#ff8a2a");
    } else {
      const cyc = trapCycle(g, t);
      if (!cyc?.active || cyc.n === t.hitCycle) continue;
      const caught =
        t.key === "draft"
          ? Math.abs(p.x - tx) <= 3 && Math.abs(p.y - ty) <= 2
          : p.x === tx && p.y <= ty && p.y >= ty - 2;
      if (!caught) continue;
      t.hitCycle = cyc.n;
      if (t.key === "frost") {
        p.slowUntil = g.now + 2500;
        hurt(g, hit * 0.25, "#9fe6ff");
      } else if (t.key === "geyser") {
        p.burnUntil = g.now + 3000;
        hurt(g, hit * 0.5, "#ff8a2a");
      } else {
        g.dimUntil = g.now + DIM_MS;
        say(g, (p.x + 0.5) * T, (p.y - 2) * T, "Your lantern gutters!", "#c9b8ff", 1400);
      }
      warn();
    }
  }
}

export function step(g: Game, dt: number, keys: Keys, aim: Aim) {
  g.now += dt;
  if (g.fainted || g.riding) return stepEffects(g, dt);
  if (!g.asleep && g.now - g.lastInput > AFK_MS) g.asleep = true;
  distanceField(g);
  stepPlayer(g, dt, keys, aim);
  const p2 = g.player;
  if (g.hover && !keys.left && !keys.right && p2.t >= p2.dur && Math.abs(g.hover.x - (p2.x + 0.5)) >= 0.3)
    p2.face = g.hover.x < p2.x + 0.5 ? -1 : 1;
  g.target = previewTarget(g, keys);
  g.splash = g.target >= 0 ? splashOf(g, g.target) : [];
  g.aimPoint = g.hover
    ? g.hover
    : g.target >= 0
      ? { x: (g.target % g.W) + 0.5, y: Math.floor(g.target / g.W) + 0.5 }
      : { x: p2.x + 0.5 + p2.face * 2, y: p2.y - 0.4 };
  const p = g.player;
  markSeen(g, p.x, p.y - 1, lightRadius(g));
  if (g.petActor && PET_LIGHT[g.petActor.key])
    markSeen(g, Math.round(g.petActor.px), Math.round(g.petActor.py), PET_LIGHT[g.petActor.key]);
  if (!g.camp && !g.asleep && g.now >= g.nextSpawn && g.now - g.startedAt > SPAWN_GRACE_MS) spawn(g);
  if (!g.camp && g.now - g.startedAt > 4000 && !inTorchlight(g, p.x, p.y - 1))
    sayOnce(g, "dark", "Dark out here. Wounds only mend in torchlight, and monsters stir faster (T plants a torch).", "#ffc98a", 4200);
  stepBolts(g, dt);
  stepFuses(g);
  stepMonsters(g, dt);
  stepEmbers(g);
  stepTraps(g);
  stepPet(g, dt);
  stepBeetle(g);
  if (nearMotherlode(g)) sayOnce(g, "hum", "The rock hums here. Something rich is close…", "#ffe9a8");
  if (g.asleep && g.now >= g.nextZ) {
    g.nextZ = g.now + 700;
    const pos = drawPos(p);
    g.zs.push({ x: pos.x * T + 11, y: (pos.y + 1) * T - 22, big: g.zs.length % 2 === 0, life: 1600 });
    const pet = g.petActor;
    if (pet && g.zs.length % 3 === 0)
      g.zs.push({ x: pet.px * T + 8, y: (pet.py + 1) * T - 14, big: false, life: 1100 });
  }
  stepEffects(g, dt);
}

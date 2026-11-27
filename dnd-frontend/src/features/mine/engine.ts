import type { Break, DepthInfo, MiningStats, MiningTrip } from "@services/miningService";
import { itemName, type Tiers } from "./art/gear";
import { canSolo, type PetArt } from "./art/pets";
import { ENEMIES, type Enemy } from "./art/world";
import { critHit } from "./mine";

export const T = 16;
export const OPEN = 46;
export const BEDROCK = 35;
export const SEAL = 61;
export const STONE = 48;
export const ORE0 = 65;
export const LEDGER = 42;
export const CHEST = 36;
export const MIMIC = 38;
export const MIMIC_KIND = 11;
export const BOLT_MS = 2500;

const WALK_MS = 170;
const CLIMB_MS = 200;
const FALL_MS = 90;
const JUMP_MS = 140;
const HANG_MS = 260;
const AFK_MS = 60_000;
const SPAWN_GRACE_MS = 12_000;

export type Keys = { left: boolean; right: boolean; up: boolean; down: boolean; jump: boolean; attack: boolean };
export type Aim = { x: number; y: number } | null;

export const CAMP = { W: 44, H: 10, ground: 8, lift: 5, forge: 21, shop: 35 };
export type Station = "lift" | "forge" | "shop" | "trader";

type Tween = { x: number; y: number; fromX: number; fromY: number; t: number; dur: number };

export interface Player extends Tween {
  face: 1 | -1;
  hp: number;
  nextSwing: number;
  strikeUntil: number;
  slowUntil: number;
  burnUntil: number;
  nextBurn: number;
  lastHurt: number;
  hurtUntil: number;
  hangUntil: number;
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
  mimics: number[];
  drank: number;
}

export interface GameSetup {
  W: number;
  H: number;
  liftX: number;
  liftY: number;
  oreHp: number[];
  oreNames: string[];
  oreColors: string[];
  depths: DepthInfo[];
  stats: MiningStats;
  tiers: Tiers;
  pet: { art: PetArt; key: string } | null;
  forgeLevel: number;
  firebolt: boolean;
  potions: number;
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
  beetle: number;
  nextBeetle: number;
  warned: Set<string>;
  seq: number;
  found: number;
  bolts: Bolt[];
  nextBolt: number;
  nextPotion: number;
  trader: number;
}

const KINDS: Record<number, { hp: number; dmg: number; move: number; tunnel?: boolean }> = {
  1: { hp: 0.8, dmg: 0.8, move: 380 },
  2: { hp: 1, dmg: 0.9, move: 520, tunnel: true },
  3: { hp: 0.9, dmg: 1, move: 340 },
  4: { hp: 1, dmg: 1, move: 480 },
  5: { hp: 0.8, dmg: 1, move: 300 },
  6: { hp: 1.2, dmg: 1.3, move: 420 },
  7: { hp: 1, dmg: 1, move: 400 },
  8: { hp: 1.4, dmg: 1.6, move: 800 },
  9: { hp: 1.2, dmg: 1.1, move: 560, tunnel: true },
  10: { hp: 1.6, dmg: 1.5, move: 520 },
  11: { hp: 5, dmg: 1.5, move: 430 },
};

export const PET_LIGHT: Record<string, number> = { moth: 2, wisp: 2.5, fox: 3 };

const rand = Math.random;

export const cellAt = (g: Game, x: number, y: number) =>
  x < 0 || y < 0 || x >= g.W || y >= g.H ? BEDROCK : g.map[y * g.W + x];
export const isOpen = (g: Game, x: number, y: number) => cellAt(g, x, y) === OPEN;
export const oreOf = (c: number) => (c >= ORE0 && c < ORE0 + 20 ? c - ORE0 : -1);

export const hpOf = (g: Game, c: number) =>
  c === STONE
    ? g.info.stoneHp
    : c === SEAL
      ? g.info.sealHp
      : c === LEDGER
        ? g.info.stoneHp * 6
        : c === CHEST || c === MIMIC
          ? g.info.stoneHp * 3
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

const say = (g: Game, x: number, y: number, text: string, color: string, life = 1100) =>
  g.texts.push({ x, y, text, color, life });

const sayOnce = (g: Game, key: string, text: string, color = "#ffb347") => {
  if (g.warned.has(key)) return;
  g.warned.add(key);
  const p = g.player;
  say(g, (p.x + 0.5) * T, (p.y - 2) * T, text, color, 1800);
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

export function createGame(setup: GameSetup, trip: MiningTrip | null, now: number): Game {
  const g = {
    ...setup,
    dmg: new Map(),
    monsters: [],
    parts: [],
    texts: [],
    zs: [],
    nextZ: 0,
    pending: { breaks: [], ladders: [], torches: [], kills: 0, mimics: [], drank: 0 },
    bolts: [],
    nextBolt: 0,
    nextPotion: 0,
    trader: -1,
    asleep: false,
    lastInput: now,
    now,
    fainted: false,
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
  else loadCamp(g, now);
  return g;
}

function loadCamp(g: Game, now: number) {
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
  g.startedAt = now;
  g.nextSpawn = Number.POSITIVE_INFINITY;
  place(g, g.liftX + 1);
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
    lastHurt: 0,
    hurtUntil: 0,
    hangUntil: 0,
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
  if (Math.abs(x - CAMP.shop) <= 2) return "shop";
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
  g.startedAt = now;
  g.nextSpawn = now + SPAWN_GRACE_MS;
  g.warned.clear();
  place(g, g.liftX);
  for (const i of g.torches) markSeen(g, i % g.W, Math.floor(i / g.W), 2.5);
}

export function takePending(g: Game): Pending | null {
  const p = g.pending;
  if (!p.breaks.length && !p.ladders.length && !p.torches.length && !p.kills && !p.mimics.length && !p.drank)
    return null;
  g.pending = { breaks: [], ladders: [], torches: [], kills: 0, mimics: [], drank: 0 };
  return p;
}

export const lightRadius = (g: Game) => g.stats.light;

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
}

export function placeTorch(g: Game) {
  const p = g.player;
  const i = (p.y - 1) * g.W + p.x;
  if (g.torches.has(i) || !isOpen(g, p.x, p.y - 1)) return;
  g.torches.add(i);
  g.pending.torches.push(i);
  markSeen(g, p.x, p.y - 1, 2.5);
}

function swing(g: Game) {
  const p = g.player;
  const slow = g.now < p.slowUntil ? 1.5 : 1;
  p.nextSwing = g.now + g.stats.swingMs * slow;
  p.strikeUntil = g.now + 140;
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
  for (const j of splashOf(g, i)) crack(g, j, crit, true);
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

function crack(g: Game, i: number, crit: boolean, splash: boolean) {
  const e = g.dmg.get(i) ?? { d: 0, s: 0, c: 0, t: 0 };
  e.t = g.now;
  e.d += crit ? critHit(g.stats) : g.stats.power;
  e.s++;
  if (crit) e.c++;
  g.dmg.set(i, e);
  const cx = ((i % g.W) + 0.5) * T;
  const cy = (Math.floor(i / g.W) + 0.5) * T;
  burst(g, cx, cy, crit ? "#ffe066" : "#d6d0c4", splash ? 2 : crit ? 8 : 3);
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

function breakCell(g: Game, i: number, c: number, e: { s: number; c: number }) {
  g.dmg.delete(i);
  g.map[i] = OPEN;
  g.pending.breaks.push({ i, s: e.s, c: e.c });
  const cx = ((i % g.W) + 0.5) * T;
  const cy = (Math.floor(i / g.W) + 0.5) * T;
  const ore = oreOf(c);
  if (c === SEAL) {
    say(g, cx, cy - 8, "The seal cracks open…", "#ffd77a", 1600);
    burst(g, cx, cy, "#ffd77a", 24, 2.4);
  } else if (c === CHEST) {
    say(g, cx, cy - 8, "Treasure!", "#ffd77a", 1400);
    burst(g, cx, cy, "#ffd77a", 22, 2.4);
  } else if (c === LEDGER) {
    say(g, cx, cy - 8, "A ledger page!", "#f4e2b8", 1600);
    burst(g, cx, cy, "#f4e2b8", 18, 2.2);
    g.found = g.depth;
  } else if (ore >= 0) {
    burst(g, cx, cy, g.oreColors[ore], 14, 2);
    if (g.carried >= g.stats.capacity) sayOnce(g, "full", "Satchel full! Head back to the lift.", "#ff8a6a");
    else {
      say(g, cx, cy - 6, `+ ${g.oreNames[ore]}`, g.oreColors[ore]);
      g.carried += Math.floor(g.stats.yield) + (g.pet?.key === "ferret" ? 1 : 0);
    }
  }
}

function addMonster(g: Game, kind: number, x: number, y: number) {
  const spec = KINDS[kind];
  const hp = Math.round(g.info.monsterHp * spec.hp);
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
    dmg: Math.round(g.info.monsterDamage * spec.dmg),
    moveMs: spec.move,
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
  if (!g.firebolt) sayOnce(g, "nofire", "Your pick just bounces off. Only fire hurts it. Run!", "#ff8a6a");
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
  g.bolts.push({ x: ox, y: oy, vx: ((tx - ox) / len) * v, vy: ((ty - oy) / len) * v, life: 1400 });
  return true;
}

export function drinkPotion(g: Game) {
  const p = g.player;
  if (g.camp || g.potions <= 0 || g.now < g.nextPotion || p.hp >= g.stats.maxHp) return false;
  g.potions--;
  g.pending.drank++;
  g.nextPotion = g.now + 1000;
  const heal = Math.round(g.stats.maxHp * 0.6);
  p.hp = Math.min(g.stats.maxHp, p.hp + heal);
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
    if (foe) {
      b.life = 0;
      burst(g, b.x * T, b.y * T, "#ffb347", 16, 2.2);
      damageMonster(g, foe, Math.round(g.stats.power * 3), false, null, true);
    } else if (!isOpen(g, cx, cy)) {
      b.life = 0;
      burst(g, b.x * T, b.y * T, "#ff8a2a", 10, 1.6);
    }
  }
  g.bolts = g.bolts.filter((b) => b.life > 0);
}

const touches = (p: Player, x: number, y: number) =>
  (Math.abs(x - p.x) <= 1 && (y === p.y || y === p.y - 1)) || (x === p.x && (y === p.y + 1 || y === p.y - 2));

const reaches = (p: Player, m: Monster, dir?: number) => {
  if (dir === undefined) return touches(p, m.x, m.y);
  const dx = m.x - p.x;
  return (m.y === p.y || m.y === p.y - 1) && (dx === dir || dx === 0);
};

const liveMonsters = (g: Game) => g.monsters.filter((m) => !m.leaving && m.hp > 0);

function killMonster(g: Game, m: Monster, by: string | null) {
  m.hp = 0;
  g.monsters = g.monsters.filter((x) => x !== m);
  if (m.kind === MIMIC_KIND) {
    g.pending.mimics.push(m.cell);
    burst(g, (m.x + 0.5) * T, (m.y + 0.5) * T, "#ffd77a", 30, 3);
  } else g.pending.kills++;
  const cx = (m.x + 0.5) * T;
  const cy = (m.y + 0.5) * T;
  burst(g, cx, cy, "#d6d0c4", 14, 2.2);
  say(g, cx, cy - 10, by ? `${by} finished it!` : `${m.def.name} defeated`, "#ffd77a", 1300);
  if (m.kind === 5 && reaches(g.player, m)) {
    burst(g, cx, cy, "#ff8a2a", 20, 2.6);
    hurt(g, Math.round(m.dmg * 0.5), "#ff8a2a");
  }
}

function damageMonster(g: Game, m: Monster, dmg: number, crit: boolean, byPet: string | null, fire = false) {
  const cx = (m.x + 0.5) * T;
  const cy = m.y * T;
  m.flashUntil = g.now + 120;
  if (m.kind === MIMIC_KIND && !fire) {
    m.stunUntil = g.now + (byPet ? 200 : 450);
    say(g, cx, cy - 4, "Clang!", "#c8c0b0", 500);
    if (!m.petBlocked) {
      m.petBlocked = true;
      say(g, cx, cy - 14, g.firebolt ? "Only fire hurts it! (F)" : "Only fire hurts it!", "#ffb347", 1600);
    }
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
  m.hp -= dmg;
  say(g, cx, cy, String(Math.round(dmg)), crit ? "#ffe066" : "#ffffff", 600);
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

function attack(g: Game, m: Monster) {
  if (g.now < g.player.nextSwing) return;
  const crit = swing(g);
  let dmg = crit ? critHit(g.stats) : g.stats.power;
  const pet = g.petActor;
  if (crit && pet?.key === "blinkdog" && Math.abs(pet.px - m.x) < 2) dmg *= 1.5;
  if (crit && pet?.key === "fox") {
    dmg *= 1.25;
    burst(g, (m.x + 0.5) * T, m.y * T, "#fff3b0", 10, 2);
  }
  damageMonster(g, m, Math.round(dmg), crit, null);
}

function hurt(g: Game, amount: number, color = "#ff5a4a") {
  const p = g.player;
  const dmg = Math.max(1, Math.round(amount * (g.pet?.key === "owlbear" ? 0.7 : 1)));
  p.hp -= dmg;
  p.lastHurt = g.now;
  p.hurtUntil = g.now + 160;
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
  const cx = Math.floor(aim.x);
  const cy = Math.floor(aim.y);
  const live = liveMonsters(g);
  return (
    live.find((m) => m.x === cx && m.y === cy && reaches(p, m)) ??
    (Math.abs(dx) >= Math.abs(dy)
      ? live.find((m) => reaches(p, m, dx < 0 ? -1 : 1))
      : live.find((m) => m.x === x && reaches(p, m) && (dy > 0 ? m.y > y : m.y < y - 1)))
  );
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

  if (aim) {
    const dx = aim.x - (x + 0.5);
    const dy = aim.y - y;
    if (Math.abs(dx) >= 0.3) p.face = dx < 0 ? -1 : 1;
    const foe = foeToward(g, aim);
    if (foe) return attack(g, foe);
    const cell = aimCell(g, aim);
    if (cell >= 0) return hitCell(g, cell % g.W, Math.floor(cell / g.W));
    const sideways = Math.abs(dx) >= Math.abs(dy);
    keys = {
      ...keys,
      left: keys.left || (sideways && dx < -0.6),
      right: keys.right || (sideways && dx > 0.6),
      down: keys.down || (!sideways && dy > 1),
      up: keys.up || (!sideways && dy < -1.5),
    };
  }
  if (keys.attack && g.now >= p.nextSwing) return attackToward(g, { x: x + 0.5 + p.face, y: y - 0.5 });

  if (keys.jump && grounded && isOpen(g, x, y - 2)) {
    p.hangUntil = g.now + JUMP_MS + HANG_MS;
    return tweenTo(p, x, y - 1, JUMP_MS);
  }

  if (keys.left || keys.right) {
    const d = keys.left ? -1 : 1;
    p.face = d;
    const m = liveMonsters(g).find((mm) => reaches(p, mm, d));
    if (m) return attack(g, m);
    const nx = x + d;
    if (isOpen(g, nx, y) && isOpen(g, nx, y - 1)) return tweenTo(p, nx, y, WALK_MS);
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
  for (const t of g.torches) if (((t % g.W) - x) ** 2 + (Math.floor(t / g.W) - y) ** 2 < 30) return false;
  return true;
};

function spawn(g: Game) {
  const p = g.player;
  const cap = 1 + Math.floor(g.depth / 3);
  g.nextSpawn = g.now + Math.max(10_000, 26_000 - g.depth * 1500) * (0.7 + rand() * 0.6);
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
  addMonster(g, kind, x, Math.floor(at / g.W));
  const pet = g.petActor;
  if (pet?.key === "bat")
    say(g, (pet.px + 0.5) * T, (pet.py - 1) * T, x < p.x ? "← Squeak!" : "Squeak! →", "#d07a8c", 1600);
}

function stepMonsters(g: Game, dt: number) {
  const p = g.player;
  for (const m of g.monsters) {
    m.t += dt;
    if (m.leaving) continue;
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
    if (g.now < m.stunUntil) continue;
    if (reaches(p, m)) {
      m.lost = 0;
      if (g.now >= m.nextHit) {
        m.nextHit = g.now + 1100;
        m.lungeUntil = g.now + 180;
        hurt(g, m.dmg);
        if (m.kind === 3) p.slowUntil = g.now + 3000;
        if (m.kind === 7) p.burnUntil = g.now + 3000;
      }
      continue;
    }
    if (g.now < m.nextMove) continue;
    m.nextMove = g.now + m.moveMs;
    if (spec.tunnel) {
      const occupied = (x: number, y: number) => g.monsters.some((o) => o !== m && o.x === x && o.y === y);
      const dx = Math.sign(p.x - m.x);
      const dy = Math.sign(p.y - 1 - m.y);
      const [nx, ny] = Math.abs(p.x - m.x) >= Math.abs(p.y - m.y) && dx ? [m.x + dx, m.y] : [m.x, m.y + (dy || dx)];
      if (cellAt(g, nx, ny) !== BEDROCK && !occupied(nx, ny)) tweenTo(m, nx, ny, m.moveMs * 0.9);
      continue;
    }
    const next = route(g, m, fly);
    if (next >= 0) {
      m.lost = 0;
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
  const regen = (g.pet?.key === "wisp" ? 0.03 : 0) + (g.now - p.lastHurt > 5000 ? 0.02 : 0);
  p.hp = Math.min(max, p.hp + max * regen * (dt / 1000));
  if (g.now < p.burnUntil && g.now >= p.nextBurn) {
    p.nextBurn = g.now + 1000;
    hurt(g, g.info.monsterDamage * 0.2, "#ff8a2a");
  }
  if (p.t < p.dur) {
    p.t += dt;
    return;
  }
  const grounded = !isOpen(g, p.x, p.y + 1) || g.ladders.has(p.y * g.W + p.x);
  if (!grounded && g.now >= p.hangUntil) return tweenTo(p, p.x, p.y + 1, FALL_MS);
  if (!g.asleep) act(g, keys, aim, grounded);
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

export function step(g: Game, dt: number, keys: Keys, aim: Aim) {
  g.now += dt;
  if (g.fainted) return stepEffects(g, dt);
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
  stepBolts(g, dt);
  stepMonsters(g, dt);
  stepPet(g, dt);
  stepBeetle(g);
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

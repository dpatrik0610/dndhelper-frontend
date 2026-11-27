import { dwarfParts, type GearSlot, item, SETS, sleeper } from "./art/gear";
import { type Grid, hex, mix, tint } from "./art/pixel";
import { FORGE_H, FORGE_LEVELS, FORGE_SPOTS, forgeSprite } from "./art/forge";
import { gnomeSprite, petSprite, zGlyph } from "./art/pets";
import { chestSprite, cracks, enemySprite, oreTile, stoneTile, traderSprite } from "./art/world";
import {
  BEDROCK,
  CAMP,
  CHEST,
  CHESTS,
  GEODE,
  GILDED_CHEST,
  IRON_CHEST,
  isChest,
  nearMotherlode,
  drawPos,
  dwarfPose,
  type Game,
  hpOf,
  LEDGER,
  MIMIC,
  lightRadius,
  OPEN,
  ORE0,
  oreOf,
  PET_LIGHT,
  SEAL,
  stationAt,
  T,
} from "./engine";
import { compact, hpColor } from "./mine";
import { wickSprite } from "./story";

const CRACK_ALL = cracks(4);
const CRACK = CRACK_ALL.map((_, n) => CRACK_ALL[(n % 4) * 7 + Math.floor(n / 4)]);

const canvasCache = new WeakMap<Grid, HTMLCanvasElement>();
const gridCache = new Map<string, Grid>();
const partsCache = new Map<string, ReturnType<typeof dwarfParts>>();

const shrink = (grid: Grid, k: number): Grid =>
  Array.from({ length: Math.max(1, Math.round(grid.length * k)) }, (_, y) =>
    Array.from({ length: Math.max(1, Math.round(grid[0].length * k)) }, (_, x) => grid[Math.floor(y / k)][Math.floor(x / k)]),
  );

const HAND_X = 14;
const HAND_Y = 13;
const GRIP_X = 3;
const GRIP_Y = 12;
const HEAD_DX = 6;
const HEAD_DY = -9;
const PICK_REST = -0.55;
const RAISE_MS = 40;
const STRIKE_MS = 70;
const SETTLE_MS = 150;

const GEAR_ANCHORS: [GearSlot, number, number][] = [
  ["helm", 8, 2],
  ["charm", 8, 12],
  ["gauntlets", 1, 14],
  ["gauntlets", 14, 14],
  ["satchel", 11, 16],
];

const AURA: Record<number, { rgb: number[]; color: string; alt: string }> = {
  6: { rgb: [200, 140, 255], color: "#d9b8ff", alt: "#f0a8ff" },
  7: { rgb: [255, 150, 50], color: "#ffd23f", alt: "#ff7a2a" },
  8: { rgb: [200, 230, 255], color: "#ffffff", alt: "#bfe6ff" },
  9: { rgb: [255, 60, 50], color: "#ffcf5a", alt: "#ff5a4a" },
  10: { rgb: [170, 190, 255], color: "#ffffff", alt: "#cfe0ff" },
};

const wave = (now: number, seed: number, period: number) => (((now + seed * 7919) % period) + period) % period / period;

function gearAura(ctx: CanvasRenderingContext2D, x: number, y: number, tier: number, now: number, seed: number) {
  const a = AURA[tier];
  const flick = tier === 7 ? 0.75 + 0.25 * Math.sin(now / 70 + seed) * Math.sin(now / 23 + seed) : 1;
  const pulse = tier === 9 ? 0.55 + 0.45 * Math.sin(now / 260 + seed) : 1;
  glow(ctx, x, y, tier === 7 ? 11 : 9, a.rgb, (tier === 7 ? 0.2 : 0.13) * flick * pulse);
}

function gearSparks(ctx: CanvasRenderingContext2D, x: number, y: number, tier: number, now: number, seed: number) {
  const a = AURA[tier];
  if (tier === 6 || tier === 7) {
    for (let k = 0; k < (tier === 7 ? 3 : 1); k++) {
      const t = wave(now, seed * 3 + k, tier === 7 ? 900 + k * 130 : 2400);
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = t < 0.4 ? a.color : a.alt;
      ctx.fillRect(Math.round(x + Math.sin(t * 7 + k * 2 + seed) * 3), Math.round(y - t * (tier === 7 ? 14 : 10)), 1, 1);
    }
  } else if (tier === 8) {
    const t = wave(now, seed, 1700);
    if (t < 0.12) {
      ctx.globalAlpha = 1 - t / 0.12;
      ctx.fillStyle = a.color;
      ctx.fillRect(Math.round(x) - 2, Math.round(y), 5, 1);
      ctx.fillRect(Math.round(x), Math.round(y) - 2, 1, 5);
    }
  } else if (tier === 10) {
    for (let k = 0; k < 2; k++) {
      const t = wave(now, seed * 5 + k * 3, 1300 + k * 400);
      if (t > 0.35) continue;
      ctx.globalAlpha = Math.sin((t / 0.35) * Math.PI);
      ctx.fillStyle = k ? a.alt : a.color;
      const ang = seed * 2.4 + k * 2.1 + Math.floor(now / (1300 + k * 400));
      ctx.fillRect(Math.round(x + Math.cos(ang) * 6), Math.round(y + Math.sin(ang) * 5), 1, 1);
    }
  }
  ctx.globalAlpha = 1;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));

export function pickSwing(e: number, heavy: boolean) {
  const raised = heavy ? -1.6 : -1.25;
  const hit = heavy ? 1.1 : 0.6;
  if (e < 0 || e >= RAISE_MS + STRIKE_MS + SETTLE_MS) return { active: false, off: PICK_REST, trail: false, spark: false };
  if (e < RAISE_MS) return { active: true, off: lerp(PICK_REST, raised, e / RAISE_MS), trail: false, spark: false };
  if (e < RAISE_MS + STRIKE_MS) {
    const t = (e - RAISE_MS) / STRIKE_MS;
    return { active: true, off: lerp(raised, hit, t * t), trail: true, spark: heavy && t > 0.7 };
  }
  const t = (e - RAISE_MS - STRIKE_MS) / SETTLE_MS;
  return { active: true, off: lerp(hit, PICK_REST, 1 - (1 - t) ** 3), trail: false, spark: heavy && t < 0.3 };
}

const cached = (key: string, make: () => Grid) => {
  let g = gridCache.get(key);
  if (!g) {
    g = make();
    gridCache.set(key, g);
  }
  return g;
};

export const oreIcon = (i: number) => cached(`icon${i}`, () => oreTile(i, Math.floor(i / 2) + 1));

export const toCanvas = (grid: Grid) => {
  let c = canvasCache.get(grid);
  if (c) return c;
  c = document.createElement("canvas");
  c.width = grid[0]?.length || 1;
  c.height = grid.length;
  const x = c.getContext("2d");
  if (x)
    grid.forEach((row, y) => {
      row.forEach((col, i) => {
        if (!col) return;
        x.fillStyle = col;
        x.fillRect(i, y, 1, 1);
      });
    });
  canvasCache.set(grid, c);
  return c;
};

const LADDER: Grid = (() => {
  const w = "#7d5433";
  const W = "#a8784a";
  return Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => (x === 3 || x === 12 ? w : x > 3 && x < 12 && y % 5 === 2 ? W : null)),
  );
})();

const torchGrid = (f: boolean): Grid => {
  const Y = "#fff3a0";
  const O = "#ffd23f";
  const R = "#ff8a2a";
  const w = "#6b4423";
  const W = "#8a5a30";
  const k = "#2a2a32";
  return [
    [null, f ? Y : null, null, null],
    [null, f ? O : Y, f ? null : O, null],
    [f ? R : O, Y, O, f ? null : R],
    [null, O, f ? R : O, null],
    [null, W, w, null],
    [k, W, w, k],
    [null, W, w, null],
    [null, W, w, null],
    [null, w, w, null],
  ];
};
export const TORCH = [torchGrid(false), torchGrid(true)];

const sealTile = (depth: number): Grid => {
  const g = stoneTile(depth, 99).map((row) => row.map((c) => mix(c as string, "#000000", 0.35)));
  for (let x = 0; x < 16; x++) if (x % 4 !== 3) g[2][x] = "#c9a04a";
  for (const [x, y] of [
    [2, 6],
    [3, 7],
    [2, 8],
    [7, 5],
    [8, 6],
    [7, 7],
    [8, 8],
    [12, 6],
    [13, 7],
    [12, 8],
  ])
    g[y][x] = "#ffd77a";
  for (let x = 0; x < 16; x++) if (x % 4 !== 1) g[12][x] = "#c9a04a";
  return g;
};

const ledgerTile = (depth: number): Grid => {
  const g = stoneTile(depth, 77);
  const P = "#f4e2b8";
  const p = "#c9b07a";
  const k = "#6b4423";
  for (let y = 4; y < 12; y++)
    for (let x = 4; x < 12; x++) g[y][x] = x === 4 || y === 4 || x === 11 || y === 11 ? k : (x + y) % 5 ? P : p;
  for (const y of [6, 8, 10]) for (let x = 6; x < 10; x++) g[y][x] = "#8a6a4a";
  g[3][7] = "#ffe9a8";
  return g;
};

const geodeTile = (depth: number): Grid => {
  const g = stoneTile(depth, 91);
  const rim = "#3a2f48";
  const shell = "#6b5a80";
  const gems = ["#c9a6ff", "#7fe3ff", "#ff9ad5"];
  for (let y = 2; y < 14; y++)
    for (let x = 2; x < 14; x++) {
      const d = Math.hypot(x - 7.5, y - 7.5);
      if (d > 5.8) continue;
      g[y][x] = d > 4.8 ? rim : d > 3.6 ? shell : gems[(x * 3 + y * 5) % 3];
    }
  for (const [x, y] of [
    [6, 6],
    [9, 8],
    [7, 9],
  ])
    g[y][x] = "#ffffff";
  return g;
};

const glow = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: number[], a: number) => {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb.join(",")},${a})`);
  g.addColorStop(0.55, `rgba(${rgb.join(",")},${a * 0.85})`);
  g.addColorStop(1, `rgba(${rgb.join(",")},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
};

export function createRenderer(canvas: HTMLCanvasElement, overlay?: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const octx = overlay?.getContext("2d") ?? null;
  const words: { text: string; x: number; y: number; color: string; alpha: number; size: number }[] = [];
  const write = (text: string, x: number, y: number, color: string, alpha = 1, size = 8) =>
    words.push({ text, x, y, color, alpha, size });
  const flushWords = () => {
    const out = octx ?? ctx;
    const k = octx && overlay ? overlay.width / canvas.width : 1;
    if (octx && overlay) octx.clearRect(0, 0, overlay.width, overlay.height);
    out.textAlign = "center";
    for (const w of words) {
      out.font = `600 ${w.size * k}px "Pixelify Sans", monospace`;
      out.globalAlpha = w.alpha;
      out.fillStyle = "#000";
      out.fillText(w.text, (w.x + 1) * k, (w.y + 1) * k);
      out.fillStyle = w.color;
      out.fillText(w.text, w.x * k, w.y * k);
    }
    out.globalAlpha = 1;
    words.length = 0;
  };
  const dark = document.createElement("canvas");
  const dctx = dark.getContext("2d") as CanvasRenderingContext2D;

  const draw = (grid: Grid, x: number, y: number, flip = false, alpha = 1) => {
    const c = toCanvas(grid);
    ctx.globalAlpha = alpha;
    if (!flip) ctx.drawImage(c, Math.round(x), Math.round(y));
    else {
      ctx.save();
      ctx.translate(Math.round(x) + c.width, Math.round(y));
      ctx.scale(-1, 1);
      ctx.drawImage(c, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  };

  const label = (text: string, x: number, y: number, on: boolean) => write(text, x, y, on ? "#ffb347" : "#a59c8e");

  const forgeSmoke = (lv: number, cx: number, top: number, now: number) => {
    const fire = FORGE_LEVELS[lv - 1].look.fire;
    if (lv >= 3 && lv <= 7)
      for (let k = 0; k < 4; k++) {
        const p = (now / 2200 + k / 4) % 1;
        ctx.globalAlpha = (1 - p) * 0.35;
        ctx.fillStyle = "#968c96";
        ctx.fillRect(Math.round(cx - 1 + Math.sin(p * 5 + k) * 2 + p * 8), Math.round(top + FORGE_SPOTS.chimney - 2 - p * 22), 2, 2);
      }
    for (let k = 0; k < Math.max(0, lv - 3); k++) {
      const p = (now / (1100 + k * 173) + k * 0.37) % 1;
      ctx.globalAlpha = 1 - p;
      ctx.fillStyle = p < 0.5 ? fire[2] : fire[1];
      const y = lv >= 3 ? top + FORGE_SPOTS.chimney - 2 : top + FORGE_SPOTS.mouth;
      ctx.fillRect(Math.round(cx + Math.sin(p * 7 + k * 2) * 4), Math.round(y - p * 18), 1, 1);
    }
    ctx.globalAlpha = 1;
  };

  const campBackdrop = (g: Game, ox: number, oy: number, VW: number, VH: number, flick: boolean) => {
    const gy = CAMP.ground * T + oy;
    const near = stationAt(g);
    const sky = ctx.createLinearGradient(0, 0, 0, gy);
    sky.addColorStop(0, "#07061a");
    sky.addColorStop(1, "#2a1f44");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VW, gy);
    for (let k = 0; k < 90; k++) {
      ctx.fillStyle = (Math.floor(g.now / 400) + k) % 11 === 0 ? "#8a86b0" : "#d8d4f0";
      ctx.fillRect(
        Math.floor((((k * 97 + 13) % 701) / 701) * VW),
        Math.floor((((k * 53 + 7) % 409) / 409) * gy * 0.8),
        1,
        1,
      );
    }
    ctx.fillStyle = "#1a1428";
    for (let x = 0; x < VW; x += 2) {
      const h = Math.round(Math.sin((x - ox * 0.3) / 23) * 5 + Math.sin((x - ox * 0.3) / 7) * 2);
      ctx.fillRect(x, gy - 18 - h, 2, 20 + h);
    }
    ctx.fillStyle = "#3a2a20";
    ctx.fillRect(0, gy, VW, VH - gy);
    ctx.fillStyle = "#2f4a2a";
    ctx.fillRect(0, gy, VW, 2);
    ctx.fillStyle = "#4a3426";
    for (let x = 3; x < g.W * T; x += 11) ctx.fillRect(x + ox, gy + 6 + ((x * 7) % 13), 2, 1);

    const hx = CAMP.lift * T + 8 + ox - 15;
    ctx.fillStyle = "#050308";
    ctx.fillRect(hx + 4, gy, 22, VH - gy);
    ctx.fillStyle = "#6b4423";
    ctx.fillRect(hx, gy - 52, 3, 52);
    ctx.fillRect(hx + 27, gy - 52, 3, 52);
    ctx.fillRect(hx - 2, gy - 54, 34, 3);
    ctx.fillStyle = "#8a5a30";
    ctx.fillRect(hx + 10, gy - 62, 10, 10);
    ctx.fillStyle = "#3a2414";
    ctx.fillRect(hx + 13, gy - 59, 4, 4);
    ctx.fillStyle = "#4a3020";
    ctx.fillRect(hx + 7, gy - 51, 1, 50);
    ctx.fillRect(hx + 22, gy - 51, 1, 50);
    ctx.fillStyle = "#a8784a";
    ctx.fillRect(hx + 3, gy - 1, 24, 2);
    label("Lift", hx + 15, gy - 66, near === "lift");
    const wick = cached("wick", wickSprite);
    draw(wick, hx - 16, gy - wick.length - (Math.floor(g.now / 900) % 5 === 0 ? 1 : 0));
    if (near === "lift") write("Old Wick", hx - 10, gy - wick.length - 4, "#ffb347", 1, 6);

    const lv = g.forgeLevel;
    const ft = lv >= 7 ? Math.floor(g.now / 150) % 20 : 0;
    const forge = cached(`forge${lv}${flick}${ft}`, () => forgeSprite(lv, flick, ft));
    const fx = CAMP.forge * T + ox - FORGE_SPOTS.x + 1;
    const fy = gy - FORGE_H;
    draw(forge, fx, fy);
    forgeSmoke(lv, fx + FORGE_SPOTS.x, fy, g.now);
    label("Forge", fx + FORGE_SPOTS.x, fy + (lv >= 3 ? FORGE_SPOTS.chimney - 8 : FORGE_SPOTS.hood - 4), near === "forge");

    const sx = CAMP.shop * T + 8 + ox - 16;
    ctx.fillStyle = "#6b4423";
    ctx.fillRect(sx, gy - 30, 2, 30);
    ctx.fillRect(sx + 30, gy - 30, 2, 30);
    for (let k = 0; k < 6; k++) {
      ctx.fillStyle = k % 2 ? "#e8dcc0" : "#3d7a4a";
      ctx.fillRect(sx - 2 + k * 6, gy - 34, 6, 5);
    }
    ctx.fillStyle = "#5a3a22";
    ctx.fillRect(sx, gy - 10, 32, 3);
    draw(cached("gnome", gnomeSprite), sx + 10, gy - 16 - (Math.floor(g.now / 160) % 6 === 0 ? 1 : 0));
    label("Pip's Menagerie", sx + 16, gy - 38, near === "shop");
  };

  return (g: Game) => {
    const VW = canvas.width;
    const VH = canvas.height;
    if (dark.width !== VW || dark.height !== VH) {
      dark.width = VW;
      dark.height = VH;
    }
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#030206";
    ctx.fillRect(0, 0, VW, VH);

    const p = g.player;
    const pos = drawPos(p);
    const camX = (pos.x + 0.5) * T - VW / 2;
    const camY = pos.y * T - VH / 2;
    const quake = g.now < g.shakeUntil ? g.shakeMag : 0;
    const ox = -Math.round(camX) + Math.round((Math.random() - 0.5) * 2 * quake);
    const oy = -Math.round(camY) + Math.round((Math.random() - 0.5) * 2 * quake);
    const c0 = Math.max(0, Math.floor(camX / T));
    const c1 = Math.min(g.W - 1, Math.ceil((camX + VW) / T));
    const r0 = Math.max(0, Math.floor(camY / T));
    const r1 = Math.min(g.H - 1, Math.ceil((camY + VH) / T));
    const d = g.depth;
    const flick = Math.floor(g.now / 120) % 2 === 0;
    const lx = g.liftX * T + ox;
    const ly = (g.liftY + 1) * T + oy;

    const glints: number[] = [];
    if (g.camp) campBackdrop(g, ox, oy, VW, VH, flick);
    else {
      for (let r = r0; r <= r1; r++)
        for (let c = c0; c <= c1; c++) {
          const i = r * g.W + c;
          const cell = g.map[i];
          if (cell === LEDGER || cell === GILDED_CHEST) glints.push(i);
          const v = (c * 7 + r * 13) % 4;
          const chest = isChest(cell);
          const grid =
            cell === OPEN || chest
              ? cached(`w${d}-${v}`, () =>
                  stoneTile(d, v).map((row) => row.map((x) => mix(x as string, "#07060a", 0.74))),
                )
              : cell === BEDROCK
                ? cached(`b${d}-${v}`, () =>
                    stoneTile(d, v + 21).map((row) => row.map((x) => mix(x as string, "#000000", 0.62))),
                  )
                : cell === SEAL
                  ? cached(`seal${d}`, () => sealTile(d))
                  : cell === LEDGER
                    ? cached(`ledger${d}`, () => ledgerTile(d))
                    : cell === GEODE
                      ? cached(`geode${d}`, () => geodeTile(d))
                      : oreOf(cell) >= 0
                      ? cached(`o${d}-${oreOf(cell)}`, () => oreTile(oreOf(cell), d))
                      : cached(`s${d}-${v}`, () => stoneTile(d, v + 11));
          draw(grid, c * T + ox, r * T + oy);
          if (chest) {
            const breath = cell === MIMIC && Math.floor((g.now + i * 377) / 300) % 12 === 0;
            const tier = Math.max(0, CHESTS.indexOf(cell));
            const box = cached(`chest${cell}${breath}`, () => chestSprite(cell === MIMIC, breath, tier));
            draw(box, c * T + ox, (r + 1) * T + oy - box.length);
          }
          if (cell !== OPEN && !chest) {
            const X = c * T + ox;
            const Y = r * T + oy;
            ctx.fillStyle = "rgba(0,0,0,0.55)";
            if (g.map[i + g.W] === OPEN) ctx.fillRect(X, Y + T - 2, T, 2);
            if (c > 0 && g.map[i - 1] === OPEN) ctx.fillRect(X, Y, 1, T);
            if (c < g.W - 1 && g.map[i + 1] === OPEN) ctx.fillRect(X + T - 1, Y, 1, T);
            ctx.fillStyle = "rgba(255,255,255,0.12)";
            if (r > 0 && g.map[i - g.W] === OPEN) ctx.fillRect(X, Y, T, 1);
          }
          if (g.ladders.has(i)) draw(LADDER, c * T + ox, r * T + oy);
          const hit = g.dmg.get(i);
          if (hit) {
            const age = g.now - hit.t;
            const jx = age < 120 ? (Math.floor(age / 40) % 2 ? 1 : -1) : 0;
            const pts = CRACK;
            const shown = Math.ceil(pts.length * Math.min(1, hit.d / hpOf(g, cell)));
            ctx.fillStyle = "rgba(10,8,12,0.85)";
            for (let k = 0; k < shown; k++) ctx.fillRect(c * T + ox + pts[k][0] + jx, r * T + oy + pts[k][1], 1, 1);
            if (age < 160) {
              ctx.fillStyle = `rgba(255,240,210,${0.35 * (1 - age / 160)})`;
              ctx.fillRect(c * T + ox, r * T + oy, T, T);
            }
          }
        }

      const bar = (i: number) => {
        const cell = g.map[i];
        const hp = hpOf(g, cell);
        const left = 1 - (g.dmg.get(i)?.d ?? 0) / hp;
        const X = (i % g.W) * T + ox + 1;
        const Y = Math.floor(i / g.W) * T + oy + 1;
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(X, Y, T - 2, 3);
        ctx.fillStyle = hpColor(left);
        ctx.fillRect(X + 1, Y + 1, Math.max(1, Math.round((T - 4) * left)), 1);
      };
      for (const i of g.dmg.keys()) if (i !== g.target && g.map[i] !== OPEN) bar(i);
      if (g.target >= 0) {
        const cell = g.map[g.target];
        const o = oreOf(cell);
        const name =
          cell === SEAL
            ? "Rune seal"
            : cell === LEDGER
              ? "Ledger page"
              : cell === GILDED_CHEST
                ? "Gilded chest"
                : cell === IRON_CHEST
                  ? "Iron chest"
                  : cell === CHEST || cell === MIMIC
                    ? "Chest"
                    : cell === GEODE
                      ? "Geode"
                      : o >= 0
                  ? g.oreNames[o]
                  : "Stone";
        bar(g.target);
        write(
          `${name} · hardness ${compact(hpOf(g, cell))}`,
          (g.target % g.W) * T + ox + T / 2,
          Math.floor(g.target / g.W) * T + oy - 3,
          o >= 0 || cell === LEDGER || cell === GEODE || isChest(cell) ? "#ffd77a" : "#d6d0c4",
          1,
          6,
        );
      }
      const brackets = (i: number, alpha: number) => {
        const X = (i % g.W) * T + ox;
        const Y = Math.floor(i / g.W) * T + oy;
        ctx.fillStyle = `rgba(255,232,160,${(Math.floor(g.now / 260) % 2 ? 0.95 : 0.6) * alpha})`;
        for (const [a, b] of [
          [0, 0],
          [T - 3, 0],
          [0, T - 1],
          [T - 3, T - 1],
        ])
          ctx.fillRect(X + a, Y + b, 3, 1);
        for (const [a, b] of [
          [0, 0],
          [T - 1, 0],
          [0, T - 3],
          [T - 1, T - 3],
        ])
          ctx.fillRect(X + a, Y + b, 1, 3);
      };
      if (g.target >= 0) brackets(g.target, 1);
      for (const i of g.splash) brackets(i, 0.45);
      for (const i of g.torches) draw(TORCH[flick ? 1 : 0], (i % g.W) * T + ox + 6, Math.floor(i / g.W) * T + oy + 5);
      if (g.trader >= 0) {
        const moss = cached("moss", traderSprite);
        const X = (g.trader % g.W) * T + ox + 8 - Math.floor(moss[0].length / 2);
        const Y = (Math.floor(g.trader / g.W) + 1) * T + oy - moss.length;
        draw(moss, X, Y - (Math.floor(g.now / 700) % 4 === 0 ? 1 : 0));
        if (stationAt(g) === "trader") write("Moss", X + moss[0].length / 2, Y - 4, "#ffb347", 1, 6);
      }

      ctx.fillStyle = "#4a3020";
      ctx.fillRect(lx - 6, oy, 1, ly - oy - 3);
      ctx.fillRect(lx + 21, oy, 1, ly - oy - 3);
      ctx.fillStyle = "#7d5433";
      ctx.fillRect(lx - 8, ly - 3, 32, 3);
      ctx.fillStyle = "#a8784a";
      ctx.fillRect(lx - 8, ly - 3, 32, 1);
      draw(TORCH[flick ? 0 : 1], lx + 22, ly - 26);
    }

    for (const m of g.monsters) {
      const mp = drawPos(m);
      const ek = `${m.kind}g${m.gen}`;
      const sprite = cached(`e${ek}`, () => (m.gen ? shrink(enemySprite(m.def), 0.7 ** m.gen) : enemySprite(m.def)));
      const flash = g.now < m.flashUntil;
      const body = flash ? cached(`ef${ek}`, () => tint(sprite, "#ffffff")) : sprite;
      const w = body[0].length;
      const h = body.length;
      const lunge = g.now < m.lungeUntil ? (p.x < m.x ? -3 : 3) : 0;
      const bob = m.kind === 5 ? -4 + Math.round(Math.sin(g.now / 160) * 2) : Math.floor(g.now / 200) % 2 ? 0 : -1;
      const hidden = m.kind === 6 && Math.abs(m.x - p.x) > 2 ? 0.14 : 1;
      const winding = m.windupUntil > g.now;
      const fade = m.leaving ? Math.max(0, 1 - (g.now - m.leaving) / 900) : 1;
      const coil = winding ? (p.x < m.x ? 2 : -2) : 0;
      const shownBody = winding && Math.floor(g.now / 70) % 2 ? cached(`ew${ek}`, () => tint(sprite, "#ff8a6a")) : body;
      draw(shownBody, mp.x * T + (T - w) / 2 + ox + lunge + coil, (mp.y + 1) * T - h + oy + bob, p.x > m.x, hidden * fade);
      if (m.ward > 0) {
        const cx = mp.x * T + T / 2 + ox;
        const cy = (mp.y + 1) * T - h / 2 + oy + bob;
        const r = Math.max(w, h) / 2 + 3 + Math.sin(g.now / 180);
        ctx.globalAlpha = hidden * fade;
        ctx.fillStyle = "rgba(120,210,255,0.12)";
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = m.ward > 1 ? "rgba(160,230,255,0.85)" : "rgba(160,230,255,0.45)";
        ctx.setLineDash(m.ward > 1 ? [] : [3, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
      if (winding) write("!", (mp.x + 0.5) * T + ox, (mp.y + 1) * T - h + oy - 6, "#ff5a4a", 1, 11);
      if (m.hp < m.maxHp && hidden === 1) {
        const bx = mp.x * T + ox;
        const by = (mp.y + 1) * T - h + oy - 4;
        ctx.fillStyle = "#1a0a0a";
        ctx.fillRect(bx, by, 16, 2);
        ctx.fillStyle = "#e0503a";
        ctx.fillRect(bx, by, Math.max(1, Math.round((16 * m.hp) / m.maxHp)), 2);
      }
    }

    for (const b of g.bolts) {
      const bx = Math.round(b.x * T + ox);
      const by = Math.round(b.y * T + oy);
      ctx.fillStyle = "#ff8a2a";
      ctx.fillRect(bx - 2, by - 1, 5, 3);
      ctx.fillRect(bx - 1, by - 2, 3, 5);
      ctx.fillStyle = "#fff3a0";
      ctx.fillRect(bx - 1, by - 1, 3, 3);
    }

    const tiers = g.tiers;
    const auras: { x: number; y: number; tier: number; seed: number }[] = [];
    const px = pos.x * T + ox;
    const feet = (pos.y + 1) * T + oy;
    if (g.asleep) {
      draw(
        cached(`pick${tiers.pickaxe}`, () => item("pickaxe", tiers.pickaxe)),
        px + 13,
        feet - 16,
      );
      draw(
        cached(`sleep${JSON.stringify(tiers)}`, () => sleeper(tiers)),
        px,
        feet - 19,
      );
    } else {
      const hurt = g.now < p.hurtUntil;
      const pose = dwarfPose(g);
      const key = `d${JSON.stringify(tiers)}`;
      let parts = partsCache.get(key);
      if (!parts) {
        parts = dwarfParts(tiers);
        partsCache.set(key, parts);
      }
      const look = (grid: Grid, name: string) => (hurt ? cached(`${key}${name}hurt`, () => tint(grid, "#ff6a5a")) : grid);
      const face = pose.glance ? -p.face : p.face;
      const bx = (face < 0 ? px - 14 : px) + pose.lean * face;
      const top = feet - 20;
      const alpha = pose.flicker ? 0.45 : 1;
      if (pose.dashing) {
        const ghost = cached(`${key}ghost`, () => tint(parts.body, "#9fe6ff"));
        for (const k of [0.66, 0.33]) {
          const gx = (p.fromX + (pos.x - p.fromX) * k) * T + ox;
          draw(ghost, face < 0 ? gx - 14 : gx, top, face < 0, 0.25 * k);
        }
      }
      draw(look(parts.left, "l"), bx + pose.leftDx * face, top + pose.leftDy, face < 0, alpha);
      draw(look(parts.right, "r"), bx + pose.rightDx * face, top + pose.rightDy, face < 0, alpha);
      draw(look(pose.blink ? parts.blink : parts.body, pose.blink ? "k" : "b"), bx, top + pose.bodyDy, face < 0, alpha);
      const pick = cached(`pick${tiers.pickaxe}`, () => item("pickaxe", tiers.pickaxe));
      const pivotX = (face < 0 ? bx + 29 - HAND_X : bx + HAND_X) + 0.5;
      const pivotY = top + HAND_Y + pose.bodyDy;
      const dx = (g.aimPoint.x * T + ox - pivotX) * face;
      const dy = g.aimPoint.y * T + oy - pivotY;
      const aimAng = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, Math.atan2(dy, Math.max(0.1, dx))));
      const swing = pickSwing(g.now - p.swingAt, g.now - p.heavyAt < 320);
      const carry =
        PICK_REST +
        pose.stride * 0.22 +
        pose.bodyDy * 0.06 +
        Math.sin(g.now / 520) * 0.04 +
        (pose.air ? -0.5 : 0) +
        (pose.dashing ? -0.9 : 0) +
        (hurt ? 0.3 : 0);
      const ang = aimAng + Math.PI / 4 + (swing.active ? swing.off : carry);
      const pickImg = hurt ? cached(`pick${tiers.pickaxe}hurt`, () => tint(pick, "#ff6a5a")) : pick;
      ctx.save();
      ctx.translate(Math.round(pivotX), Math.round(pivotY));
      ctx.scale(face, 1);
      if (swing.trail) {
        const blur = cached(`pick${tiers.pickaxe}blur`, () => tint(pick, "#fff3d0"));
        for (const [back, a] of [
          [0.28, 0.35],
          [0.56, 0.16],
        ]) {
          ctx.save();
          ctx.globalAlpha = a * alpha;
          ctx.rotate(aimAng + Math.PI / 4 + swing.off - back);
          ctx.drawImage(toCanvas(blur), -GRIP_X, -GRIP_Y);
          ctx.restore();
        }
      }
      ctx.globalAlpha = alpha;
      ctx.rotate(ang);
      ctx.drawImage(toCanvas(pickImg), -GRIP_X, -GRIP_Y);
      ctx.restore();
      const hx = pivotX + face * (Math.cos(ang) * HEAD_DX - Math.sin(ang) * HEAD_DY);
      const hy = pivotY + Math.sin(ang) * HEAD_DX + Math.cos(ang) * HEAD_DY;
      if (!pose.flicker) {
        if (tiers.pickaxe >= 6) auras.push({ x: hx, y: hy, tier: tiers.pickaxe, seed: 9 });
        GEAR_ANCHORS.forEach(([slot, ax, ay], k) => {
          if (tiers[slot] >= 6)
            auras.push({ x: face < 0 ? bx + 29 - ax : bx + ax, y: top + ay + pose.bodyDy, tier: tiers[slot], seed: k });
        });
      }
      if (swing.spark) {
        ctx.fillStyle = Math.floor(g.now / 40) % 2 ? "#fff3a0" : "#ffffff";
        ctx.fillRect(Math.round(hx) - 3, Math.round(hy), 7, 1);
        ctx.fillRect(Math.round(hx), Math.round(hy) - 3, 1, 7);
      }
    }

    const pet = g.petActor;
    if (pet) {
      const sprite = cached(`pet${pet.key}`, () => petSprite(pet.art));
      const h = sprite.length;
      const fly = !!pet.art.fly && !g.asleep;
      const hop = g.now < pet.hopUntil ? 3 : 0;
      const bob = fly ? Math.round(Math.sin(g.now / 160) * 2) : 0;
      draw(sprite, pet.px * T + ox, (pet.py + 1) * T - h + oy - hop + bob, pet.face < 0);
    }

    if (g.beetle >= 0 && !g.asleep) {
      const bx = (g.beetle % g.W) * T + 8 + ox;
      const by = Math.floor(g.beetle / g.W) * T + 8 + oy;
      const hx = px + 8;
      const hy = feet - 30;
      const ang = Math.atan2(by - hy, bx - hx);
      const pulse = Math.floor(g.now / 300) % 2;
      ctx.fillStyle = pulse ? "#5fd0b8" : "#e0fff6";
      for (let k = 0; k < 4; k++)
        ctx.fillRect(Math.round(hx + Math.cos(ang) * (4 + k * 2)), Math.round(hy + Math.sin(ang) * (4 + k * 2)), 1, 1);
    }

    for (const z of g.zs)
      draw(
        cached(`z${z.big}`, () => zGlyph(z.big, "#e6e8ff")),
        z.x + ox,
        z.y + oy,
      );
    for (const q of g.parts) {
      ctx.fillStyle = q.color;
      ctx.fillRect(Math.round(q.x + ox), Math.round(q.y + oy), 1, 1);
    }

    const headX = px + 8;
    const headY = feet - 24;
    const hum = nearMotherlode(g);
    const fl = hum ? Math.round(Math.sin(g.now / 47) * 3 + Math.sin(g.now / 13) * 2) : Math.floor(g.now / 130) % 2 ? 2 : 0;
    if (!g.camp) {
      dctx.globalCompositeOperation = "source-over";
      dctx.clearRect(0, 0, VW, VH);
      dctx.fillStyle = "rgb(3,2,6)";
      dctx.fillRect(0, 0, VW, VH);
      dctx.globalCompositeOperation = "destination-out";
      dctx.fillStyle = "rgba(0,0,0,0.22)";
      for (let r = r0; r <= r1; r++)
        for (let c = c0; c <= c1; c++) {
          const i = r * g.W + c;
          if (g.seen[i] && g.map[i] === OPEN) dctx.fillRect(c * T + ox, r * T + oy, T, T);
        }
      const black = [0, 0, 0];
      glow(dctx, headX, headY, (lightRadius(g) + (g.asleep ? -0.8 : 0)) * T + fl, black, 1);
      glow(dctx, lx + 23, ly - 20, 3 * T + fl, black, 0.9);
      for (const i of g.torches)
        glow(dctx, (i % g.W) * T + ox + 8, Math.floor(i / g.W) * T + oy + 6, 2.5 * T + fl, black, 0.92);
      for (const b of g.bolts) glow(dctx, b.x * T + ox, b.y * T + oy, 1.8 * T, black, 0.95);
      if (g.trader >= 0) {
        const tx = (g.trader % g.W) * T + ox + 15;
        const ty = Math.floor(g.trader / g.W) * T + oy + 12;
        glow(dctx, tx, ty, 2.6 * T + fl, black, 0.9);
      }
      const petLight = pet && PET_LIGHT[pet.key];
      if (pet && petLight) glow(dctx, pet.px * T + ox + 8, (pet.py + 0.5) * T + oy, petLight * T, black, 0.9);
      for (const m of g.monsters)
        if (m.kind === 5 || m.kind === 7 || m.kind === 10) {
          const mp = drawPos(m);
          glow(dctx, (mp.x + 0.5) * T + ox, (mp.y + 0.5) * T + oy, T * 1.2, black, 0.6);
        }
      ctx.drawImage(dark, 0, 0);
      const sight = g.stats.oreSight;
      if (sight > 0) {
        const lit = lightRadius(g);
        const pulse = 0.35 + 0.25 * Math.sin(g.now / 300);
        for (let r = r0; r <= r1; r++)
          for (let c = c0; c <= c1; c++) {
            const o = oreOf(g.map[r * g.W + c]);
            const d = Math.hypot(c - p.x, r - (p.y - 1));
            if (o < 0 || d <= lit - 0.5 || d > lit + sight) continue;
            const fade = 1 - (d - lit) / (sight + 1);
            ctx.globalAlpha = 0.3 * fade;
            ctx.strokeStyle = g.oreColors[o];
            ctx.strokeRect(c * T + ox + 0.5, r * T + oy + 0.5, T - 1, T - 1);
            ctx.globalAlpha = pulse * fade;
            ctx.fillStyle = g.oreColors[o];
            ctx.fillRect(c * T + ox + 7, r * T + oy + 7, 2, 2);
          }
        ctx.globalAlpha = 1;
      }
      for (const at of glints) {
        const lc = at % g.W;
        const lr = Math.floor(at / g.W);
        if ((lc - p.x) ** 2 + (lr - p.y) ** 2 > 100 || Math.floor((g.now + at * 97) / 220) % 7 >= 2) continue;
        const X = lc * T + ox + 7;
        const Y = lr * T + oy + 7;
        ctx.fillStyle = g.map[at] === GILDED_CHEST ? "#fff0a0" : "#fff3c8";
        ctx.fillRect(X, Y - 2, 1, 5);
        ctx.fillRect(X - 2, Y, 5, 1);
      }
    }

    ctx.globalCompositeOperation = "lighter";
    for (const i of g.torches)
      glow(ctx, (i % g.W) * T + ox + 8, Math.floor(i / g.W) * T + oy + 6, 2.5 * T, [255, 150, 60], 0.18);
    if (g.camp) {
      const lv = g.forgeLevel;
      const fire = hex(FORGE_LEVELS[lv - 1].look.fire[1]);
      const cx = CAMP.forge * T + ox + 1;
      const top = CAMP.ground * T + oy - FORGE_H;
      glow(ctx, cx, top + FORGE_SPOTS.mouth + 3, 36 + lv * 2, fire, flick ? 0.26 : 0.2);
      if (lv >= 7) glow(ctx, cx, CAMP.ground * T + oy, 24, [255, 90, 30], 0.18);
      if (lv >= 8) glow(ctx, cx, top + FORGE_SPOTS.chimney - 2, 16, fire, flick ? 0.3 : 0.22);
      if (lv >= 10) glow(ctx, cx, top + 3, 20 + Math.sin(g.now / 300) * 3, [215, 225, 255], 0.4);
    }
    else glow(ctx, lx + 23, ly - 20, 2.5 * T, [255, 150, 60], 0.16);
    glow(ctx, headX, headY - 4, 22, [255, 215, 130], 0.1);
    for (const b of g.bolts) glow(ctx, b.x * T + ox, b.y * T + oy, 14, [255, 140, 50], 0.45);
    if (pet?.art.light) glow(ctx, pet.px * T + ox + 8, (pet.py + 0.5) * T + oy, 14, hex(pet.art.light), 0.3);
    if (pet?.key === "dragon") glow(ctx, pet.px * T + ox + 9, (pet.py + 0.5) * T + oy, 12, [255, 120, 40], 0.18);
    for (const a of auras) gearAura(ctx, a.x, a.y, a.tier, g.now, a.seed);
    if (!g.camp && g.hotOre >= 0)
      for (let r = r0; r <= r1; r++)
        for (let c = c0; c <= c1; c++) {
          const i = r * g.W + c;
          if (g.map[i] !== ORE0 + g.hotOre || !g.seen[i] || g.map[i - g.W] !== OPEN) continue;
          auras.push({ x: c * T + ox + 8, y: r * T + oy, tier: 7, seed: i });
          glow(ctx, c * T + ox + 8, r * T + oy + 2, 10, [255, 140, 50], 0.1);
        }
    const set = SETS[tiers.helm];
    if (tiers.helm >= 8 && set.gem) glow(ctx, headX, headY + 4, 20, hex(set.gem), 0.26);
    ctx.globalCompositeOperation = "source-over";

    for (const a of auras) gearSparks(ctx, a.x, a.y, a.tier, g.now, a.seed);
    if (tiers.helm === 10 && !g.asleep)
      for (let k = 0; k < 4; k++) {
        const a = (g.now / 50) * 0.35 * 0.3 + k * 1.6;
        ctx.fillStyle = k % 2 ? "#ffffff" : "#bcd0ff";
        ctx.fillRect(Math.round(headX + Math.cos(a) * 13), Math.round(headY + 2 + Math.sin(a) * 10), 1, 1);
      }

    for (const t of g.texts) write(t.text, t.x + ox, t.y + oy, t.color, Math.min(1, t.life / 300));
    flushWords();
    return { camX: Math.round(camX), camY: Math.round(camY) };
  };
}

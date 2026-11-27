import { CAMP } from "./engine";

type Ctx = CanvasRenderingContext2D;
type Glow = (ctx: Ctx, x: number, y: number, r: number, rgb: number[], a: number) => void;

const T = 16;
const LIFT_X = CAMP.lift * T + 8;
const ARCH = { half: 25, rise: 50, top: 76 };
const WARDEN = 196;
const TAVERN = 398;
const COTTAGE = 476;
const LIGHTHOUSE = 648;
const ANVIL_PEAK = 128;

const ridge = (x: number, seed: number) =>
  Math.sin(x / 9 + seed) * 1.5 + Math.sin(x / 23 + seed * 2) * 3 + Math.sin(x / 4.3 + seed) * 0.8;

const disc = (ctx: Ctx, cx: number, cy: number, r: number) => {
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.round(Math.sqrt(r * r - dy * dy));
    ctx.fillRect(cx - w, cy + dy, 2 * w + 1, 1);
  }
};

const moonAt = (VW: number, ox: number) => ({ x: Math.round(VW * 0.76 + ox * 0.04), y: 24 });

const SUMMIT = 96;

const anvilTop = (wx: number, gy: number) => {
  const d = Math.abs(wx - SUMMIT);
  const top = gy - ANVIL_PEAK + d ** 1.25 * 0.22 + ridge(wx, wx < SUMMIT ? 1 : 2) * Math.min(1, d / 20) * 1.6;
  return Math.min(gy, Math.round(top));
};

const cliffTop = (wx: number, gy: number) => {
  if (wx > 178) return gy;
  const h = wx < 60 ? Math.min(118, 98 + (60 - wx) * 0.12) : 98 * (1 - ((wx - 60) / 118) ** 1.7);
  return Math.round(gy - h + ridge(wx, 5));
};

const inArch = (wx: number, y: number, gy: number) => {
  const dx = Math.abs(wx - LIFT_X);
  if (dx > ARCH.half) return false;
  if (y >= gy - ARCH.rise) return true;
  const ry = ARCH.top - ARCH.rise;
  return ((gy - ARCH.rise - y) / ry) ** 2 + (dx / ARCH.half) ** 2 <= 1;
};

export const LANDMARKS = [
  { x: WARDEN + 20, y: 34, name: "Reeve's Post" },
  { x: TAVERN + 29, y: 50, name: "The Bent Nail" },
  { x: LIGHTHOUSE + 1, y: 90, name: "Saltbell Light" },
];

export function islandBack(ctx: Ctx, now: number, ox: number, gy: number, VW: number) {
  const m = moonAt(VW, ox);
  ctx.fillStyle = "#efe8cf";
  disc(ctx, m.x, m.y, 8);
  ctx.fillStyle = "#cfc6a8";
  for (const [dx, dy, w] of [
    [-3, -2, 2],
    [2, 1, 3],
    [-1, 4, 2],
    [3, -4, 1],
  ])
    ctx.fillRect(m.x + dx, m.y + dy, w, w > 1 ? 2 : 1);

  const hy = gy - 30;
  const sea = ctx.createLinearGradient(0, hy, 0, gy);
  sea.addColorStop(0, "#252c5a");
  sea.addColorStop(1, "#0c1030");
  ctx.fillStyle = sea;
  ctx.fillRect(0, hy, VW, gy - hy);
  ctx.fillStyle = "#3a4478";
  ctx.fillRect(0, hy, VW, 1);
  ctx.fillStyle = "#c8c8e8";
  for (let y = hy + 2; y < gy - 4; y += 3) {
    const w = 3 + ((y * 7) % 5);
    const jitter = Math.round(Math.sin(now / 420 + y * 1.3) * 3);
    ctx.globalAlpha = 0.12 + 0.12 * ((y * 5) % 3);
    ctx.fillRect(m.x - w + jitter, y, w, 1);
    ctx.fillRect(m.x + 2 - jitter, y + 1, w - 2, 1);
  }
  ctx.globalAlpha = 1;

  const far = Math.round(ox * 0.15);
  ctx.fillStyle = "#121633";
  for (let x = 0; x < VW; x++) {
    const wx = x - far;
    if (wx < 420 || wx > 640) continue;
    const h = Math.round(4 + Math.sin((wx - 420) / 70) * 3 + Math.sin(wx / 7) * 0.7);
    ctx.fillRect(x, hy - h, 1, h);
  }
  const gx = 590 + far;
  ctx.fillRect(gx, hy - 15, 5, 10);
  ctx.fillRect(gx - 1, hy - 16, 7, 2);
  ctx.fillRect(gx + 1, hy - 18, 1, 2);
  ctx.fillRect(gx + 3, hy - 18, 1, 2);
  ctx.fillRect(gx + 6, hy - 10, 6, 5);
  ctx.fillStyle = Math.floor(now / 900) % 3 ? "#ff7a4a" : "#a0402a";
  ctx.fillRect(gx + 2, hy - 13, 1, 1);

  const mid = Math.round(ox * 0.45);
  for (let x = 0; x < VW; x++) {
    const wx = x - mid;
    const top = anvilTop(wx, gy);
    if (top >= gy) continue;
    ctx.fillStyle = "#1a1530";
    ctx.fillRect(x, top, 1, gy - top);
    const lit = wx > SUMMIT;
    if (lit) {
      ctx.fillStyle = "#26203c";
      ctx.fillRect(x, top, 1, Math.min(gy - top, Math.round(26 + Math.sin(wx / 11) * 6)));
    }
    const snow = Math.round((gy - top - ANVIL_PEAK + 26) * 0.7 + Math.sin(wx / 3.1) * 2 + Math.sin(wx / 7) * 2);
    if (snow > 0) {
      ctx.fillStyle = lit ? "#c8cae6" : "#8a8cb2";
      ctx.fillRect(x, top, 1, snow);
      ctx.fillStyle = lit ? "#6a6c96" : "#4a4a72";
      ctx.fillRect(x, top + snow, 1, 1);
    }
  }

  const dune = Math.round(ox * 0.3);
  ctx.fillStyle = "#151024";
  for (let x = 0; x < VW; x += 2) {
    const h = Math.round(Math.sin((x - dune) / 31) * 2 + Math.sin((x - dune) / 9) * 1);
    ctx.fillRect(x, gy - 5 - h, 2, 7 + h);
  }
}

const house = (ctx: Ctx, x: number, gy: number, w: number, h: number, wall: string, roof: string, peak: number) => {
  ctx.fillStyle = wall;
  ctx.fillRect(x, gy - h, w, h);
  ctx.fillStyle = roof;
  for (let k = 0; k <= peak; k++) ctx.fillRect(x - 2 + k, gy - h - k, w + 4 - 2 * k, 1);
};

const windowAt = (ctx: Ctx, x: number, y: number, lit: boolean) => {
  ctx.fillStyle = lit ? "#ffcf6a" : "#3a2e3a";
  ctx.fillRect(x, y, 4, 4);
  ctx.fillStyle = "#2a1e22";
  ctx.fillRect(x + 2, y, 1, 4);
  ctx.fillRect(x, y + 2, 4, 1);
};

export function islandNear(ctx: Ctx, now: number, ox: number, gy: number, VW: number) {
  const x0 = Math.max(0, -300 + ox);
  const x1 = Math.min(VW, 180 + ox);
  for (let x = x0; x < x1; x++) {
    const wx = x - ox;
    const top = cliffTop(wx, gy);
    if (top >= gy) continue;
    for (let y = top; y < gy; y++) {
      if (inArch(wx, y, gy)) continue;
      const band = (y + Math.round(ridge(wx, 7))) % 9;
      ctx.fillStyle = y - top < 2 ? "#4a4062" : band === 0 ? "#211a2c" : (wx + y * 3) % 23 === 0 ? "#3a3050" : "#2b2238";
      ctx.fillRect(x, y, 1, 1);
    }
    if ((wx * 5) % 7 < 2) {
      ctx.fillStyle = "#2f4a2a";
      ctx.fillRect(x, top - 1, 1, 1 + ((wx * 3) % 2));
    }
  }

  const ax = LIFT_X + ox;
  ctx.fillStyle = "#050308";
  for (let y = gy - ARCH.top; y < gy; y++)
    for (let dx = -ARCH.half; dx <= ARCH.half; dx++) if (inArch(LIFT_X + dx, y, gy)) ctx.fillRect(ax + dx, y, 1, 1);
  for (let a = 0; a <= 16; a++) {
    const t = (a / 16) * Math.PI;
    const rx = ARCH.half + 2;
    const ry = ARCH.top - ARCH.rise + 2;
    const sx = Math.round(ax - Math.cos(t) * rx);
    const sy = Math.round(gy - ARCH.rise - Math.sin(t) * ry);
    ctx.fillStyle = a % 2 ? "#5a5070" : "#4a4060";
    ctx.fillRect(sx - 2, sy - 2, 4, 4);
    ctx.fillStyle = "#1a1424";
    ctx.fillRect(sx - 2, sy + 1, 4, 1);
  }
  for (const side of [-1, 1]) {
    const px = ax + side * (ARCH.half - 1) - (side > 0 ? 3 : 0);
    ctx.fillStyle = "#4a3020";
    ctx.fillRect(px, gy - ARCH.rise, 4, ARCH.rise);
    ctx.fillStyle = "#6b4423";
    ctx.fillRect(px + (side > 0 ? 0 : 1), gy - ARCH.rise, 2, ARCH.rise);
  }
  const lamp = ax - ARCH.half + 5;
  ctx.fillStyle = "#3a2a1a";
  ctx.fillRect(lamp, gy - ARCH.rise - 1, 1, 5);
  ctx.fillStyle = Math.floor(now / 140) % 7 ? "#ffd77a" : "#ffb347";
  ctx.fillRect(lamp - 1, gy - ARCH.rise + 4, 3, 3);

  const w = WARDEN + ox;
  if (w > -60 && w < VW + 10) {
    house(ctx, w, gy, 40, 24, "#3a3448", "#2a1e2a", 8);
    ctx.fillStyle = "#16121e";
    ctx.fillRect(w + 6, gy - 13, 7, 13);
    windowAt(ctx, w + 20, gy - 16, true);
    windowAt(ctx, w + 30, gy - 16, Math.floor(now / 7000) % 4 !== 0);
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(w + 41, gy - 46, 1, 46);
    const wave = Math.floor(now / 300) % 2;
    ctx.fillStyle = "#8a3a3a";
    ctx.fillRect(w + 42, gy - 46, 7, 2);
    ctx.fillRect(w + 42, gy - 44, 6 + wave, 2);
    ctx.fillStyle = "#e8dcc0";
    ctx.fillRect(w + 44, gy - 45, 2, 2);
    ctx.fillStyle = "#6b5a44";
    ctx.fillRect(w - 10, gy - 14, 8, 6);
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(w - 7, gy - 8, 2, 8);
    ctx.fillStyle = "#d8d0b8";
    ctx.fillRect(w - 9, gy - 13, 2, 2);
    ctx.fillRect(w - 6, gy - 12, 3, 2);
  }

  const tv = TAVERN + ox;
  if (tv > -80 && tv < VW + 10) {
    ctx.fillStyle = "#4a3628";
    ctx.fillRect(tv, gy - 20, 58, 20);
    ctx.fillStyle = "#3e3040";
    ctx.fillRect(tv - 2, gy - 36, 62, 16);
    ctx.fillStyle = "#2a1e22";
    for (let k = 0; k < 62; k += 10) ctx.fillRect(tv - 2 + k, gy - 36, 1, 16);
    ctx.fillRect(tv - 2, gy - 21, 62, 1);
    house(ctx, tv - 2, gy - 36, 62, 0, "#3e3040", "#24182a", 12);
    ctx.fillStyle = "#2a1e22";
    ctx.fillRect(tv + 44, gy - 56, 6, 10);
    for (let k = 0; k < 3; k++) {
      const p = (now / 2600 + k / 3) % 1;
      ctx.globalAlpha = (1 - p) * 0.3;
      ctx.fillStyle = "#968c96";
      ctx.fillRect(Math.round(tv + 46 + Math.sin(p * 5 + k) * 2 + p * 6), Math.round(gy - 58 - p * 20), 2, 2);
    }
    ctx.globalAlpha = 1;
    for (const [dx, dy] of [
      [6, -15],
      [18, -15],
      [40, -15],
      [6, -31],
      [26, -31],
      [46, -31],
    ])
      windowAt(ctx, tv + dx, gy + dy, (dx + dy + Math.floor(now / 9000)) % 5 !== 0);
    ctx.fillStyle = "#16121e";
    ctx.fillRect(tv + 28, gy - 12, 7, 12);
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(tv + 58, gy - 26, 8, 1);
    ctx.fillStyle = "#6b4423";
    const swing = Math.round(Math.sin(now / 700));
    ctx.fillRect(tv + 61 + swing, gy - 25, 7, 6);
    ctx.fillStyle = "#c8a050";
    ctx.fillRect(tv + 63 + swing, gy - 23, 3, 2);
  }

  const ct = COTTAGE + ox;
  if (ct > -40 && ct < VW + 10) {
    house(ctx, ct, gy, 26, 14, "#3a3040", "#2a1e2a", 6);
    windowAt(ctx, ct + 15, gy - 10, true);
    ctx.fillStyle = "#16121e";
    ctx.fillRect(ct + 4, gy - 9, 5, 9);
  }

  const lh = LIGHTHOUSE + ox;
  if (lh > -40 && lh < VW + 40) {
    ctx.fillStyle = "#241c2e";
    ctx.fillRect(lh - 12, gy - 6, 26, 6);
    ctx.fillRect(lh - 8, gy - 9, 18, 3);
    for (let y = 0; y < 64; y++) {
      const half = Math.round(7 - y / 16);
      const stripe = Math.floor(y / 10) % 2;
      ctx.fillStyle = stripe ? "#6a2e34" : "#8a8494";
      ctx.fillRect(lh - half + 1, gy - 9 - y, half * 2, 1);
      ctx.fillStyle = "#1a1424";
      ctx.fillRect(lh + half, gy - 9 - y, 1, 1);
    }
    ctx.fillStyle = "#2a2234";
    ctx.fillRect(lh - 6, gy - 75, 14, 2);
    ctx.fillStyle = "#fff3b0";
    ctx.fillRect(lh - 3, gy - 82, 8, 7);
    ctx.fillStyle = "#2a2234";
    ctx.fillRect(lh - 3, gy - 82, 1, 7);
    ctx.fillRect(lh + 4, gy - 82, 1, 7);
    for (let k = 0; k < 5; k++) ctx.fillRect(lh - 4 + k, gy - 83 - k, 10 - 2 * k, 1);
  }
}

export function islandLights(ctx: Ctx, glow: Glow, now: number, ox: number, gy: number, VW: number) {
  const m = moonAt(VW, ox);
  glow(ctx, m.x, m.y, 30, [200, 200, 255], 0.16);
  glow(ctx, LIFT_X + ox - ARCH.half + 5, gy - ARCH.rise + 5, 14, [255, 190, 90], 0.3);
  for (const [x, y] of [
    [WARDEN + 22, -14],
    [TAVERN + 20, -13],
    [TAVERN + 26, -29],
    [COTTAGE + 17, -8],
  ])
    glow(ctx, x + ox, gy + y, 12, [255, 190, 100], 0.12);
  const lx = LIGHTHOUSE + ox + 1;
  const ly = gy - 79;
  glow(ctx, lx, ly, 18, [255, 240, 180], 0.35);
  const a = Math.cos(now / 1600);
  const reach = 150 * a;
  const g = ctx.createLinearGradient(lx, ly, lx + reach, ly);
  g.addColorStop(0, "rgba(255,240,180,0.22)");
  g.addColorStop(1, "rgba(255,240,180,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(lx, ly);
  ctx.lineTo(lx + reach, ly - 14 * Math.abs(a));
  ctx.lineTo(lx + reach, ly + 14 * Math.abs(a));
  ctx.closePath();
  ctx.fill();
}

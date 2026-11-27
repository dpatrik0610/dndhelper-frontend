import { blank, type Grid, mix, rng } from "./pixel";

export const HOUSE_W = 176;
export const HOUSE_H = 84;
const G = HOUSE_H - 1;
const OX = 44;

export interface HouseSpots {
  door: number;
  top: number;
  smoke: [number, number] | null;
  lights: [number, number, number][];
}

type Level = { level: number; name: string; perk: string; blurb: string; spots: HouseSpots; grounds?: [number, number, number][] };

const LEVELS: Level[] = [
  {
    level: 1,
    name: "Driftwood Shed",
    perk: "A roof, mostly. Ore sells at the plain price.",
    blurb: "Washed-up planks and a sheet of tin the reeve didn't want. Home, for now.",
    spots: { door: 41, top: G - 31, smoke: null, lights: [[49, G - 13, 8]] },
  },
  {
    level: 2,
    name: "Timber Cabin",
    perk: "A peg by the door for one more potion on your belt.",
    blurb: "Real logs, a real chimney and a door that locks. The Bent Nail regulars are impressed.",
    spots: {
      door: 44,
      top: G - 46,
      smoke: [61, G - 49],
      lights: [
        [29, G - 12, 10],
        [59, G - 12, 10],
      ],
    },
  },
  {
    level: 3,
    name: "Stone Cottage",
    perk: "Hesk takes you seriously now: ore sells for 10% more.",
    blurb: "Fieldstone walls, a fat thatch roof and flowers nobody asked you to grow.",
    spots: {
      door: 44,
      top: G - 56,
      smoke: [24, G - 55],
      lights: [
        [27, G - 13, 11],
        [61, G - 13, 11],
        [44, G - 37, 8],
      ],
    },
  },
  {
    level: 4,
    name: "Dwarven Longhouse",
    perk: "Ore sells for 20% more, and the belt holds two extra potions.",
    blurb: "Dressed stone, a slate roof, a walled garden and a rune-door your grandfather would have wept at.",
    grounds: [
      [10, G - 16, 8],
      [165, G - 16, 8],
    ],
    spots: {
      door: 44,
      top: G - 70,
      smoke: [70, G - 66],
      lights: [
        [44, G - 27, 12],
        [19, G - 16, 9],
        [69, G - 16, 9],
        [33, G - 6, 8],
        [55, G - 6, 8],
      ],
    },
  },
  {
    level: 5,
    name: "Anvilhold Hall",
    perk: "Ore sells for 35% more, and the belt holds three extra potions.",
    blurb: "A hall fit for a thane: a fountain, clipped hedges and a gold anvil on a plinth. Gullrock seems very far away.",
    grounds: [
      [5, G - 25, 10],
      [171, G - 25, 10],
      [24, G - 12, 9],
    ],
    spots: {
      door: 38,
      top: G - 83,
      smoke: null,
      lights: [
        [38, G - 44, 14],
        [74, G - 52, 9],
        [74, G - 30, 9],
        [24, G - 6, 9],
        [52, G - 6, 9],
        [80, G - 80, 6],
      ],
    },
  },
];

export const HOUSE_LEVELS = LEVELS.map(({ grounds, ...L }) => ({
  ...L,
  spots: {
    door: L.spots.door + OX,
    top: L.spots.top,
    smoke: L.spots.smoke && ([L.spots.smoke[0] + OX, L.spots.smoke[1]] as [number, number]),
    lights: [...L.spots.lights.map(([x, y, r]) => [x + OX, y, r] as [number, number, number]), ...(grounds ?? [])],
  },
}));

type Paint = {
  g: Grid;
  dx: number;
  put: (x: number, y: number, c: string) => void;
  rect: (x: number, y: number, w: number, h: number, c: string) => void;
  r: () => number;
};

const painter = (seed: number): Paint => {
  const g = blank(HOUSE_W, HOUSE_H);
  const p: Paint = {
    g,
    dx: 0,
    put: (x, y, c) => {
      const X = x + p.dx;
      if (X >= 0 && X < HOUSE_W && y >= 0 && y < HOUSE_H) g[y][X] = c;
    },
    rect: (x, y, w, h, c) => {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p.put(x + i, y + j, c);
    },
    r: rng(seed),
  };
  return p;
};

const pick = (r: () => number, list: string[]) => list[Math.floor(r() * list.length)];

function pane(p: Paint, x: number, y: number, w: number, h: number, frame: string, lit: string, bars = true) {
  p.rect(x - 1, y - 1, w + 2, h + 2, frame);
  p.rect(x, y, w, h, lit);
  p.rect(x, y, w, 1, mix(lit, "#ffffff", 0.35));
  if (!bars) return;
  p.rect(x + (w >> 1), y, 1, h, frame);
  p.rect(x, y + (h >> 1), w, 1, frame);
}

function shed(p: Paint) {
  const L = 26;
  const R = 58;
  const top = G - 21;
  const planks = ["#6e5a44", "#7d664c", "#5e4b38", "#8a8478", "#6a5640"];
  const roofY = (x: number) => Math.round(top - 9 + ((x - L + 3) / (R - L + 6)) * 7);
  for (let x = L; x <= R; x += 3) {
    const c = pick(p.r, planks);
    const y0 = roofY(x) + 3;
    p.rect(x, y0, 3, G - y0 + 1, c);
    p.rect(x, y0, 1, G - y0 + 1, mix(c, "#000000", 0.35));
    p.put(x + 1, top + 4 + Math.floor(p.r() * 10), mix(c, "#000000", 0.5));
  }
  for (let x = L - 3; x <= R + 3; x++) {
    const y = roofY(x);
    for (let k = 0; k < 3; k++) p.put(x, y + k, x % 2 ? "#7c8088" : "#5c6068");
    p.put(x, y + 3, "#2e2a28");
  }
  p.rect(L + 4, top - 7, 5, 2, "#9a5a32");
  p.rect(R - 9, top - 3, 6, 2, "#a0a4a8");
  p.put(R - 8, top - 2, "#6e7278");
  p.rect(37, G - 15, 9, 16, "#3a2c20");
  p.rect(38, G - 14, 7, 15, "#5a4632");
  for (let k = 0; k < 7; k++) p.put(38 + k, G - 2 - k * 2, "#7a6246");
  p.rect(38, G - 12, 7, 1, "#7a6246");
  p.rect(38, G - 3, 7, 1, "#7a6246");
  p.put(43, G - 7, "#c8a050");
  p.rect(48, G - 15, 5, 4, "#2a1e16");
  p.rect(49, G - 14, 3, 2, "#e8b060");
  p.rect(47, G - 16, 1, 6, "#4a3a2a");
  p.rect(53, G - 16, 1, 6, "#4a3a2a");
  p.rect(18, G - 4, 6, 5, "#6a6e76");
  p.rect(18, G - 4, 6, 1, "#8a8e96");
  p.rect(19, G - 3, 4, 1, "#3a5a7a");
  p.rect(60, G - 6, 8, 7, "#7a5a36");
  p.rect(60, G - 6, 8, 1, "#9a7a4a");
  p.rect(63, G - 6, 1, 7, "#5a4024");
  p.rect(62, G - 11, 5, 5, "#6a4e30");
  p.rect(62, G - 11, 5, 1, "#8a6a40");
}

function cabin(p: Paint) {
  const L = 18;
  const R = 70;
  const top = G - 22;
  for (let y = top; y <= G; y += 3) {
    p.rect(L, y, R - L + 1, 1, "#a8743e");
    p.rect(L, y + 1, R - L + 1, 1, "#8a5a2e");
    p.rect(L, y + 2, R - L + 1, 1, "#5e3a1c");
    const out = ((y - top) / 3) % 2 ? 0 : 2;
    for (const ex of [L - out, R - 2 + out]) {
      p.rect(ex, y, 3, 3, "#c89a62");
      p.put(ex + 1, y + 1, "#8a5a2e");
    }
  }
  const peak = G - 46;
  const cx = 44;
  for (let y = peak; y <= top + 1; y++) {
    const half = Math.round(((y - peak) / (top + 1 - peak)) * 32);
    for (let x = cx - half; x <= cx + half; x++) {
      const row = y - peak;
      const shade = (x + (Math.floor(row / 3) % 2) * 2) % 5 === 0 ? "#4a2c1e" : row % 3 === 2 ? "#5a3624" : "#74462c";
      p.put(x, y, shade);
    }
    p.put(cx - half, y, "#a06a3a");
    p.put(cx + half, y, "#a06a3a");
    p.put(cx - half - 1, y, "#3a2216");
    p.put(cx + half + 1, y, "#3a2216");
  }
  p.rect(cx - 33, top + 1, 67, 2, "#3a2216");
  for (let y = G - 51; y < top; y++)
    for (let x = 58; x < 64; x++) p.put(x, y, (x + Math.floor(y / 2)) % 3 ? "#7a7470" : "#5a5450");
  p.rect(57, G - 52, 8, 2, "#8a8480");
  p.rect(39, G - 16, 11, 17, "#3a2216");
  p.rect(40, G - 15, 9, 16, "#6e4024");
  p.rect(40, G - 15, 9, 1, "#8a5a2e");
  p.rect(44, G - 15, 1, 16, "#4a2a16");
  p.put(47, G - 7, "#d8b060");
  for (const wx of [25, 55]) {
    pane(p, wx, G - 15, 8, 7, "#3a2216", "#ffcc6a");
    p.rect(wx - 4, G - 16, 3, 9, "#3d6a4a");
    p.rect(wx + 9, G - 16, 3, 9, "#3d6a4a");
  }
  pane(p, cx - 3, G - 36, 6, 5, "#3a2216", "#ffcc6a");
  for (let k = 0; k < 4; k++)
    for (let j = 0; j < 3 - (k > 1 ? 1 : 0); j++) {
      p.rect(4 + j * 4 + (k % 2) * 2, G - 3 - k * 3, 4, 3, "#a8743e");
      p.put(5 + j * 4 + (k % 2) * 2, G - 2 - k * 3, "#5e3a1c");
    }
  p.rect(52, G - 20, 1, 4, "#4a3a2a");
  p.rect(51, G - 16, 3, 3, "#ffcc6a");
}

function cottage(p: Paint) {
  const L = 12;
  const R = 76;
  const top = G - 26;
  p.rect(L, top, R - L + 1, G - top + 1, "#7a746a");
  for (let k = 0; k < 90; k++) {
    const w = 3 + Math.floor(p.r() * 4);
    const h = 2 + Math.floor(p.r() * 2);
    const x = L + Math.floor(p.r() * (R - L - w));
    const y = top + Math.floor(p.r() * (G - top - h));
    const c = pick(p.r, ["#8a847a", "#958e82", "#7e786e", "#a09a8c"]);
    p.rect(x, y, w, h, c);
    p.rect(x, y, w, 1, mix(c, "#ffffff", 0.18));
    p.rect(x, y + h, w, 1, "#4e4a44");
  }
  p.rect(18, G - 56, 7, 32, "#8a3a2a");
  for (let y = G - 56; y < G - 24; y += 2) p.rect(18 + ((y / 2) % 2), y, 7, 1, (y / 2) % 2 ? "#a04a36" : "#7a3224");
  p.rect(17, G - 57, 9, 2, "#5a2a1e");
  const peak = G - 52;
  for (let y = peak; y <= top + 3; y++) {
    const t = (y - peak) / (top + 3 - peak);
    const half = Math.round(18 + Math.sqrt(t) * 22);
    for (let x = 44 - half; x <= 44 + half; x++) {
      const v = (x * 7 + y * 3 + Math.floor(p.r() * 3)) % 6;
      p.put(x, y, v === 0 ? "#8a6a2a" : v < 3 ? "#c8a050" : v < 5 ? "#b08c3a" : "#e0c070");
    }
  }
  for (let x = 2; x < 87; x++) {
    p.put(x, top + 4, "#6e5420");
    p.put(x, top + 5, "#4a3814");
  }
  for (let x = 26; x < 63; x++) p.put(x, peak, "#e8d088");
  p.rect(40, G - 41, 9, 7, "#8a6a2a");
  pane(p, 41, G - 40, 7, 5, "#4a3814", "#ffd27a");
  p.rect(38, G - 19, 13, 20, "#5a554e");
  p.rect(40, G - 17, 9, 18, "#3d7a4a");
  p.rect(41, G - 18, 7, 1, "#3d7a4a");
  p.rect(42, G - 19, 5, 1, "#3d7a4a");
  p.rect(44, G - 18, 1, 19, "#2e5e38");
  p.put(47, G - 8, "#e8c060");
  p.rect(37, G, 15, 1, "#a09a8c");
  for (const wx of [22, 56]) {
    pane(p, wx, G - 17, 10, 8, "#4e3a24", "#ffd27a");
    p.rect(wx - 1, G - 8, 12, 2, "#6e4a2a");
    for (let k = 0; k < 6; k++) {
      p.put(wx + k * 2, G - 9, "#3a7a3a");
      p.put(wx + k * 2 + 1, G - 10, pick(p.r, ["#e05a6a", "#f2c14e", "#e8e0f0", "#c84a8a"]));
    }
  }
  for (let x = 0; x < 10; x += 3) {
    p.rect(x, G - 6, 2, 7, "#e8dcc0");
    p.put(x, G - 7, "#e8dcc0");
  }
  p.rect(0, G - 4, 11, 1, "#c8bca0");
  p.rect(80, G - 14, 1, 15, "#3a3440");
  p.rect(78, G - 17, 5, 4, "#2a2430");
  p.rect(79, G - 16, 3, 2, "#ffd27a");
}

function longhouse(p: Paint) {
  const L = 6;
  const R = 82;
  const top = G - 30;
  p.rect(L, top, R - L + 1, G - top + 1, "#5b5f6b");
  for (let y = top; y <= G; y += 4) {
    p.rect(L, y, R - L + 1, 1, "#3e424c");
    for (let x = L + ((y / 4) % 2) * 5; x <= R; x += 10) p.rect(x, y, 1, 4, "#3e424c");
    p.rect(L, y + 1, R - L + 1, 1, "#6b707c");
  }
  p.rect(L, top, R - L + 1, 2, "#7a5a36");
  p.rect(L, top, R - L + 1, 1, "#9a7444");
  const peak = G - 66;
  for (let y = peak; y < top; y++) {
    const half = Math.round(((y - peak) / (top - peak)) * 44);
    for (let x = 44 - half; x <= 44 + half; x++) {
      const row = y - peak;
      const c = row % 3 === 0 ? "#2a2e3a" : (x + (Math.floor(row / 3) % 2) * 3) % 6 === 0 ? "#2a2e3a" : row % 3 === 1 ? "#4a5262" : "#3a4050";
      p.put(x, y, c);
    }
    p.put(44 - half, y, "#7a5a36");
    p.put(44 + half, y, "#7a5a36");
  }
  for (const [x, d] of [
    [44 - 46, 1],
    [44 + 46, -1],
  ]) {
    p.rect(x, top - 4, 3, 2, "#d8b060");
    p.put(x + (d > 0 ? 0 : 2), top - 5, "#d8b060");
    p.put(x + (d > 0 ? -1 : 3), top - 6, "#d8b060");
    p.put(x + 1, top - 3, "#ff5a2a");
  }
  p.rect(42, peak - 4, 5, 4, "#d8b060");
  p.put(44, peak - 5, "#ffe08a");
  p.rect(67, peak + 4, 6, 14, "#4a4e5a");
  p.rect(66, peak + 3, 8, 2, "#2a2e3a");
  p.rect(32, G - 26, 25, 27, "#7a7e8a");
  p.rect(33, G - 25, 23, 1, "#9a9eaa");
  p.rect(42, G - 28, 5, 4, "#9a9eaa");
  p.put(44, G - 27, "#6fd0ff");
  p.rect(35, G - 22, 19, 23, "#2a2026");
  for (const dx of [36, 45]) {
    p.rect(dx, G - 21, 8, 22, "#5a3a24");
    p.rect(dx, G - 21, 8, 1, "#7a5232");
    for (const by of [G - 17, G - 9, G - 3]) {
      p.rect(dx, by, 8, 1, "#6a6e7c");
      p.put(dx + 1, by, "#9aa0ae");
      p.put(dx + 6, by, "#9aa0ae");
    }
  }
  p.put(43, G - 11, "#d8b060");
  p.put(46, G - 11, "#d8b060");
  for (const rx of [38, 41, 47, 50]) p.put(rx, G - 20, "#6fd0ff");
  for (const bx of [25, 60]) {
    p.rect(bx, G - 26, 5, 15, "#8a2a2a");
    p.rect(bx, G - 26, 5, 1, "#d8b060");
    p.put(bx + 1, G - 11, "#8a2a2a");
    p.put(bx + 3, G - 11, "#8a2a2a");
    p.rect(bx + 1, G - 21, 3, 1, "#d8b060");
    p.rect(bx + 2, G - 20, 1, 2, "#d8b060");
    p.rect(bx + 1, G - 18, 3, 1, "#d8b060");
  }
  for (const wx of [14, 66]) {
    pane(p, wx, G - 22, 9, 12, "#2a2e3a", "#ffc860", false);
    for (let k = 1; k < 9; k += 2) p.rect(wx + k, G - 22, 1, 12, "#3e424c");
  }
  for (const fx of [30, 57]) {
    p.rect(fx, G - 3, 5, 4, "#3a3440");
    p.rect(fx - 1, G - 4, 7, 1, "#5a5460");
    p.rect(fx + 1, G - 6, 3, 2, "#ff8a2a");
    p.put(fx + 2, G - 7, "#ffd23f");
  }
}

function hall(p: Paint) {
  const stone = "#d8d0c0";
  const shade = "#b0a898";
  const gold = "#e8c060";
  const L = 4;
  const R = 66;
  const top = G - 36;
  p.rect(L, top, R - L + 1, G - top + 1, stone);
  for (let y = top + 3; y <= G; y += 5) p.rect(L, y, R - L + 1, 1, shade);
  const peak = G - 66;
  for (let y = peak; y < top; y++) {
    const half = Math.round(((y - peak) / (top - peak)) * 34);
    p.rect(35 - half, y, half * 2 + 1, 1, stone);
    p.put(35 - half, y, gold);
    p.put(35 + half, y, gold);
    p.put(36 - half, y, "#7a6a40");
    p.put(34 + half, y, "#7a6a40");
  }
  p.rect(L - 2, top - 1, R - L + 5, 3, gold);
  p.rect(L - 2, top + 1, R - L + 5, 1, "#9a7a30");
  const rx = 38;
  const ry = G - 47;
  for (let y = -9; y <= 9; y++)
    for (let x = -9; x <= 9; x++) {
      const d = Math.hypot(x, y);
      if (d > 9.5) continue;
      if (d > 8) p.put(rx + x - 3, ry + y, gold);
      else {
        const a = Math.floor(((Math.atan2(y, x) + Math.PI) / (Math.PI * 2)) * 8);
        const ring = d < 3 ? "#ffe08a" : ["#3ab0c8", "#c83a4a", "#5a8af0", "#e8c060"][a % 4];
        p.put(rx + x - 3, ry + y, (x === 0 || y === 0) && d > 3 ? "#7a6a40" : ring);
      }
    }
  for (const cx of [20, 50]) {
    p.rect(cx, G - 30, 5, 31, "#f0ead8");
    p.rect(cx + 3, G - 30, 2, 31, shade);
    p.rect(cx - 1, G - 31, 7, 2, gold);
    p.rect(cx - 1, G - 1, 7, 2, shade);
  }
  p.rect(28, G - 30, 19, 2, gold);
  p.rect(33, G - 34, 9, 2, gold);
  p.rect(35, G - 36, 5, 2, gold);
  p.rect(36, G - 32, 3, 2, gold);
  p.rect(29, G - 25, 17, 21, "#6a5a3a");
  for (const dx of [30, 38]) {
    p.rect(dx, G - 24, 7, 20, gold);
    p.rect(dx + 1, G - 22, 5, 7, "#c8a040");
    p.rect(dx + 1, G - 13, 5, 7, "#c8a040");
  }
  p.put(36, G - 14, "#fff0b0");
  p.put(39, G - 14, "#fff0b0");
  for (let k = 0; k < 4; k++) p.rect(26 - k * 2, G - 3 + k, 23 + k * 4, 1, k % 2 ? shade : "#e8e2d4");
  for (const wx of [8, 56]) {
    pane(p, wx, G - 26, 7, 12, gold, "#bfe0ff");
    p.rect(wx, G - 28, 7, 1, gold);
  }
  const TX = 68;
  const ttop = G - 62;
  p.rect(TX, ttop, 14, G - ttop + 1, stone);
  for (let y = ttop + 4; y <= G; y += 5) p.rect(TX, y, 14, 1, shade);
  p.rect(TX + 11, ttop, 3, G - ttop + 1, shade);
  p.rect(TX - 1, ttop - 1, 16, 2, gold);
  for (let y = 0; y < 16; y++) {
    const half = Math.round((y / 15) * 8);
    for (let x = -half; x <= half; x++) p.put(TX + 7 + x, ttop - 2 - (15 - y), x > 1 ? "#2a6a5a" : "#3a8a7a");
  }
  p.rect(TX + 7, ttop - 22, 1, 6, gold);
  p.rect(TX + 8, ttop - 22, 6, 3, "#9a2a2a");
  p.put(TX + 10, ttop - 21, gold);
  for (const wy of [G - 54, G - 34]) pane(p, TX + 4, wy, 5, 8, gold, "#bfe0ff", false);
  for (const fx of [22, 50, 86]) {
    p.rect(fx - 2, G - 2, 5, 3, "#3a3440");
    p.rect(fx - 3, G - 3, 7, 1, gold);
    p.rect(fx - 1, G - 6, 3, 3, "#ff8a2a");
    p.put(fx, G - 7, "#ffd23f");
  }
}

function blob(p: Paint, cx: number, cy: number, r: number, dark: string, mid: string, light: string) {
  for (let y = -r; y <= r; y++)
    for (let x = -r; x <= r; x++) {
      const d = Math.hypot(x, y * 1.1);
      if (d > r + 0.3) continue;
      p.put(cx + x, cy + y, d > r - 1.2 || x + y > r * 0.6 ? dark : x + y < -r * 0.5 ? light : mid);
    }
}

function flowers(p: Paint, x0: number, x1: number, colors: string[]) {
  for (let x = x0; x < x1; x += 2) {
    p.put(x, G, "#2e5a2a");
    p.put(x, G - 1, "#3a7a3a");
    if (p.r() < 0.6) p.put(x, G - 2, pick(p.r, colors));
  }
}

function longhouseGrounds(p: Paint) {
  const stone = "#6b707c";
  const cap = "#8e929e";
  const seam = "#3e424c";
  for (const [x0, x1, px] of [
    [12, 47, 7],
    [129, 164, 163],
  ]) {
    p.rect(x0, G - 7, x1 - x0, 8, stone);
    for (let y = G - 4; y <= G; y += 4) p.rect(x0, y, x1 - x0, 1, seam);
    for (let x = x0 + 3; x < x1; x += 6) {
      p.put(x, G - 6, seam);
      p.put(x + 3, G - 3, seam);
    }
    p.rect(x0 - 1, G - 9, x1 - x0 + 2, 2, cap);
    p.rect(x0 - 1, G - 9, x1 - x0 + 2, 1, "#a8acb8");
    p.rect(px, G - 13, 6, 14, stone);
    p.rect(px, G - 13, 1, 14, cap);
    p.rect(px - 1, G - 14, 8, 2, cap);
    p.rect(px + 1, G - 18, 4, 4, "#2a2430");
    p.rect(px + 2, G - 17, 2, 2, "#ffc860");
    p.put(px + 2, G - 19, "#2a2430");
  }
  p.rect(28, G - 24, 2, 16, "#5a3a22");
  p.put(27, G - 15, "#5a3a22");
  p.put(30, G - 18, "#5a3a22");
  blob(p, 29, G - 28, 8, "#2e5a2a", "#3e7a34", "#5aa04a");
  for (const [ax, ay] of [
    [25, G - 30],
    [32, G - 27],
    [28, G - 24],
    [33, G - 32],
    [24, G - 25],
  ])
    p.put(ax, ay, "#d83a3a");
  p.rect(14, G - 1, 32, 2, "#4a3020");
  for (let x = 15; x < 45; x += 5) {
    blob(p, x + 1, G - 3, 2, "#2e6a2a", "#4a8a3a", "#7ab85a");
    p.put(x + 1, G - 1, "#2e6a2a");
  }
  flowers(p, 131, 162, ["#e05a6a", "#f2c14e", "#e8e0f0", "#c84a8a", "#7a8af0"]);
  for (const bx of [136, 148]) blob(p, bx, G - 12, 4, "#2e5a2a", "#3e7a34", "#5aa04a");
  p.rect(153, G - 15, 7, 1, "#8a6a2a");
  for (let y = 0; y < 6; y++) {
    const half = [2, 3, 4, 4, 4, 3][y];
    p.rect(156 - half, G - 21 + y, half * 2 + 1, 1, y % 2 ? "#c89a3a" : "#e0b84a");
  }
  p.put(156, G - 17, "#3a2a10");
}

function hallGrounds(p: Paint) {
  const stone = "#e2dccc";
  const shade = "#b8b0a0";
  const gold = "#e8c060";
  const iron = "#2a2a34";
  for (const [x0, x1, px] of [
    [9, 47, 1],
    [135, 168, 168],
  ]) {
    p.rect(x0, G - 11, x1 - x0, 12, stone);
    for (let y = G - 7; y <= G; y += 4) p.rect(x0, y, x1 - x0, 1, shade);
    p.rect(x0 - 1, G - 12, x1 - x0 + 2, 2, gold);
    for (let x = x0 + 1; x < x1; x += 3) {
      p.rect(x, G - 19, 1, 7, iron);
      p.put(x, G - 20, gold);
    }
    p.rect(x0, G - 16, x1 - x0, 1, iron);
    p.rect(px, G - 22, 7, 23, stone);
    p.rect(px + 5, G - 22, 2, 23, shade);
    p.rect(px - 1, G - 23, 9, 2, gold);
    p.rect(px + 1, G - 26, 5, 3, "#3a3440");
    p.rect(px + 2, G - 29, 3, 3, "#ff8a2a");
    p.put(px + 3, G - 30, "#ffd23f");
  }
  const fx = 24;
  p.rect(fx - 11, G - 5, 23, 6, stone);
  p.rect(fx - 12, G - 6, 25, 2, "#f4efe2");
  p.rect(fx - 10, G - 4, 21, 2, "#4aa0d8");
  p.rect(fx - 1, G - 15, 3, 10, shade);
  p.rect(fx - 5, G - 16, 11, 2, "#f4efe2");
  p.rect(fx - 4, G - 14, 9, 1, shade);
  p.rect(fx, G - 20, 1, 4, "#bfe6ff");
  p.put(fx, G - 21, "#ffffff");
  for (let k = 1; k < 7; k++) {
    p.put(fx - 6 - Math.floor(k / 2), G - 16 + k, "#8ad0f8");
    p.put(fx + 6 + Math.floor(k / 2), G - 16 + k, "#8ad0f8");
  }
  p.put(fx - 3, G - 18, "#8ad0f8");
  p.put(fx + 3, G - 18, "#8ad0f8");
  flowers(p, 37, 47, ["#e05a6a", "#f2c14e", "#e8e0f0"]);
  for (const [tx, top] of [
    [139, 22],
    [146, 16],
  ]) {
    p.rect(tx, G - 6, 1, 6, "#5a3a22");
    blob(p, tx, G - top + 4, 3, "#1e4a2a", "#2e6a3a", "#4a8a4a");
    blob(p, tx, G - 7, 3, "#1e4a2a", "#2e6a3a", "#4a8a4a");
  }
  p.rect(153, G - 14, 13, 15, stone);
  p.rect(162, G - 14, 4, 15, shade);
  p.rect(152, G - 15, 15, 2, gold);
  p.rect(152, G - 1, 15, 2, shade);
  p.rect(155, G - 18, 9, 3, "#b8862a");
  p.rect(156, G - 18, 6, 1, gold);
  p.rect(157, G - 21, 5, 3, gold);
  p.rect(152, G - 25, 15, 4, "#d8a840");
  p.rect(152, G - 25, 15, 1, "#fff0a0");
  p.rect(148, G - 24, 4, 2, "#d8a840");
  p.put(147, G - 24, "#d8a840");
  p.rect(166, G - 24, 2, 3, "#b8862a");
  flowers(p, 131, 151, ["#e05a6a", "#f2c14e", "#c84a8a", "#7a8af0"]);
}

const BUILDERS = [shed, cabin, cottage, longhouse, hall];
const GROUNDS: ((p: Paint) => void)[] = [() => {}, () => {}, () => {}, longhouseGrounds, hallGrounds];

export function houseSprite(level: number): Grid {
  const lv = Math.max(1, Math.min(BUILDERS.length, level));
  const p = painter(lv * 977);
  GROUNDS[lv - 1](p);
  p.dx = OX;
  BUILDERS[lv - 1](p);
  return p.g;
}

export function houseIcon(level: number): Grid {
  const g = houseSprite(level);
  const used = g[0].map((_, x) => g.some((row) => row[x]));
  const a = used.indexOf(true);
  const b = used.lastIndexOf(true);
  return g.map((row) => row.slice(a, b + 1));
}

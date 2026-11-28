import { blank, type Grid, mix, ramp, raster, rng } from "./pixel";

export const MAGMA_CORE = "magmaCore";
export const DIAMOND = "diamond";

const CORE = raster(
  [
    "................",
    "................",
    ".....xxxxxx.....",
    "...xxkkkkKKxx...",
    "..xkkKoyokkKKx..",
    "..xkkoYYoKkkKx..",
    ".xkKkkoyokkoKkx.",
    ".xkkoookKkoyokx.",
    ".xkoYyokkooYYox.",
    ".xkKoyokKkooykx.",
    ".xkkkokkkoKkkkx.",
    "..xkKkoookkKkx..",
    "..xkkkoyYokkkx..",
    "...xxkkooKkxx...",
    ".....xxxxxx.....",
    "................",
  ],
  { x: "#1a0a06", k: "#3a1a12", K: "#5a2a1a", o: "#d2451e", y: "#ff8a2a", Y: "#ffd166" },
);

export const DIAMOND_GRID = raster(
  [
    "................",
    "................",
    "................",
    "....xxxxxxxx....",
    "...xWwWwwWwbx...",
    "..xWWwWwwWwbbx..",
    ".xWwwWwwWwbbbbx.",
    ".xwWWwwbbwwbbbx.",
    "..xwWwwbbwbbbx..",
    "...xwWwbwbbbx...",
    "....xwWbwbbx....",
    ".....xwbbbx.....",
    "......xwbx......",
    ".......xx.......",
    "................",
    "................",
  ],
  { x: "#1f4a66", W: "#ffffff", w: "#c4f4ff", b: "#6cc6ea" },
);

export const holdingSprite = (): Grid =>
  raster(
    [
      "................",
      "......xxxx......",
      ".....xYYYYx.....",
      "......xYYx......",
      "....xxppppxx....",
      "...xpPppppppx...",
      "..xpPpppspppPx..",
      "..xpPppsSspppx..",
      ".xpPpppspppppPx.",
      ".xpPppppppspppx.",
      ".xpppppppsSsppx.",
      ".xppppppppsppPx.",
      ".xpppppppppppPx.",
      "..xpppppppppPx..",
      "...xxppppppxx...",
      ".....xxxxxx.....",
    ],
    { x: "#1a1024", p: "#4a2a7a", P: "#7a5ab8", Y: "#e8c060", s: "#c8b8ff", S: "#ffffff" },
  );

export const MATERIALS: Record<string, { name: string; lore: string; grid: Grid }> = {
  [MAGMA_CORE]: {
    name: "Magma Core",
    lore: "The still-burning heart of a salamander. Only Flametouched Iron will take an edge with one in the quench.",
    grid: CORE,
  },
  bagOfHolding: {
    name: "Bag of Holding",
    lore: "Taken from the Ashen Wyrm's hoard. Thora binds it to a Starmetal satchel at her smithy: it becomes a secret tier 11 bag that carries twice as much.",
    grid: holdingSprite(),
  },
  [DIAMOND]: {
    name: "Diamond",
    lore: "Rare from the Cold Halls down, and no luckier the deeper you go. Hesk pays a fortune for one, or keep it for your collection.",
    grid: DIAMOND_GRID,
  },
};

export const COIN = raster(
  [
    "................",
    "................",
    "................",
    ".....xxxxxx.....",
    "....xYYYYyyx....",
    "...xYYyyyyyox...",
    "...xYyYYYYyox...",
    "...xYyYooYyox...",
    "...xYyYooYyox...",
    "...xYyyyyyyox...",
    "...xyyyyyyoox...",
    "....xoooooox....",
    ".....xxxxxx.....",
    "................",
    "................",
    "................",
  ],
  { x: "#5a3a10", o: "#b8862a", y: "#f2c14e", Y: "#fff0a0" },
);

export const MERCHANT = raster(
  [
    "....xxxxxx....",
    "...xhhhhhhx...",
    "..xhhHHHHhhx..",
    "xxxxxxxxxxxxxx",
    "xbbbbbbbbbbbbx",
    "..xssssssssx..",
    "..xsxsssxssx..",
    "..xsssssssSx..",
    "..xRRssssRRx..",
    ".xRRRRRRRRRRx.",
    "xccRRRRRRRRccx",
    "xcxwwwwwwwwxcx",
    "xcxwwwwwwwwxcx",
    "xsxwwwyywwwxsx",
    ".x.wwwyywww.x.",
    "...wwwwwwww...",
    "...kkk..kkk...",
    "..xkkx..xkkx..",
  ],
  {
    x: "#1c1410",
    h: "#3a2a5a",
    H: "#5a4a8a",
    b: "#e8c060",
    s: "#e2aa7c",
    S: "#b97a52",
    R: "#8a4a2a",
    c: "#2e5e7a",
    w: "#e8dcc0",
    y: "#f2c14e",
    k: "#4a3020",
  },
);

type Box = { x0: number; yt: number; yb: number; L: number; H: number; D: number };
type Face = "top" | "front" | "side";
type Put = (x: number, y: number, c: string) => void;

interface IngotLook {
  L: number;
  H: number;
  D: number;
  speck: number;
  ghost?: boolean;
  halo?: string;
  extra?: (put: Put, b: Box, face: (x: number, y: number) => Face | null, r: () => number) => void;
}

const sparkle = (put: Put, x: number, y: number, c: string, core = "#ffffff") => {
  put(x, y - 1, c);
  put(x - 1, y, c);
  put(x + 1, y, c);
  put(x, y + 1, c);
  put(x, y, core);
};

const INGOTS: Record<number, IngotLook> = {
  4: {
    L: 9,
    H: 7,
    D: 3,
    speck: 0.12,
    extra: (put, b, face, r) => {
      for (let k = 0; k < 40; k++) {
        const x = b.x0 + Math.floor(r() * (b.L + b.D));
        const y = b.yt - b.D + Math.floor(r() * (b.H + b.D));
        if (face(x, y) === "top" && r() < 0.5) put(x, y, "#f4fbff");
      }
      for (let k = 0; k < 3; k++) put(b.x0 + b.L - 1 + k, b.yt + k, "#f4fbff");
    },
  },
  5: {
    L: 9,
    H: 6,
    D: 3,
    speck: 0.1,
    extra: (put, b) => {
      for (const [dx, dy, c] of [
        [2, 4, "#ff6a1a"],
        [3, 3, "#ffd23f"],
        [4, 3, "#ff6a1a"],
        [5, 2, "#ffd23f"],
        [6, 1, "#ff6a1a"],
      ] as const)
        put(b.x0 + dx, b.yt + dy, c);
      put(b.x0 + 3, b.yt - b.D - 2, "#ffd23f");
      put(b.x0 + 8, b.yt - b.D - 1, "#ff6a1a");
      put(b.x0 + 11, b.yt - b.D - 3, "#ffb347");
    },
  },
  6: {
    L: 11,
    H: 5,
    D: 3,
    speck: 0.06,
    extra: (put, b) => {
      for (const [dx, dy] of [
        [2, 0],
        [3, 0],
        [4, 1],
        [5, 1],
        [6, 0],
        [7, 0],
        [8, 1],
      ])
        put(b.x0 + dx, b.yt + 1 + dy, "#fff6a0");
      put(b.x0 + 9, b.yt - b.D - 2, "#fff6a0");
      put(b.x0 + 10, b.yt - b.D - 1, "#ffffff");
    },
  },
  7: {
    L: 9,
    H: 7,
    D: 3,
    speck: 0.05,
    extra: (put, b) => {
      const cx = b.x0 + 4;
      for (const [dx, dy, c] of [
        [0, 0, "#ff6a2a"],
        [0, 1, "#ffd23f"],
        [-1, 1, "#ff6a2a"],
        [1, 1, "#ff6a2a"],
        [0, 2, "#ff6a2a"],
      ] as const)
        put(cx + dx, b.yt + 2 + dy, c);
      sparkle(put, b.x0 + b.L + b.D - 1, b.yt - b.D, "#fff6c8");
    },
  },
  8: {
    L: 11,
    H: 4,
    D: 4,
    speck: 0.04,
    ghost: true,
    extra: (put, b) => {
      for (const [dx, dy] of [
        [2, -2],
        [3, -3],
        [2, -4],
        [8, -2],
        [9, -3],
        [9, -5],
        [13, -3],
        [12, -4],
      ])
        put(b.x0 + dx, b.yt - b.D + dy, "#bfe6ff");
      put(b.x0 + 3, b.yt + 1, "#bfe6ff");
      put(b.x0 + 7, b.yt + 1, "#bfe6ff");
    },
  },
  9: {
    L: 8,
    H: 7,
    D: 4,
    speck: 0.05,
    extra: (put, b) => {
      for (const [dx, dy] of [
        [4, 0],
        [5, 0],
        [3, 1],
        [3, 2],
        [4, 3],
        [5, 3],
      ])
        put(b.x0 + dx - 1, b.yt + 1 + dy, "#fff3c8");
      sparkle(put, b.x0, b.yt - b.D - 1, "#bfe6ff");
    },
  },
  10: {
    L: 9,
    H: 6,
    D: 3,
    speck: 0.04,
    halo: "#b9a6ff",
    extra: (put, b) => {
      const cx = b.x0 + 4;
      const cy = b.yt + 3;
      for (const [dx, dy] of [
        [0, -2],
        [-1, -1],
        [0, -1],
        [1, -1],
        [-2, 0],
        [-1, 0],
        [1, 0],
        [2, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
      ])
        put(cx + dx, cy + dy, "#ffe9a8");
      put(cx, cy, "#ffffff");
      sparkle(put, 1, 1, "#d8ccff");
      sparkle(put, 14, 13, "#d8ccff");
    },
  },
};

const ingots = new Map<string, Grid>();

export const alloyIcon = (tier: number, color: string): Grid => {
  const id = `${tier}${color}`;
  const cached = ingots.get(id);
  if (cached) return cached;
  const look = INGOTS[tier] ?? INGOTS[4];
  const { L, H, D } = look;
  const x0 = Math.floor((16 - (L + D)) / 2);
  const yt = Math.floor((16 - (H + D)) / 2) + D;
  const b: Box = { x0, yt, yb: yt + H - 1, L, H, D };
  const inBox = (x: number, y: number) => {
    for (let s = 0; s <= D; s++) if (x - s >= x0 && x - s < x0 + L && y + s >= yt && y + s <= b.yb) return true;
    return false;
  };
  const mask = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < 16 && y < 16 && inBox(x, y) && !corner(x, y);
  const corner = (x: number, y: number) => {
    const h = !inBox(x - 1, y) || !inBox(x + 1, y);
    const v = !inBox(x, y - 1) || !inBox(x, y + 1);
    return h && v;
  };
  const face = (x: number, y: number): Face | null => {
    if (!mask(x, y)) return null;
    if (x <= x0 + L - 1 && y >= yt) return "front";
    const dx = x - (x0 + L - 1);
    const dy = yt - y;
    return dy > 0 && (dx <= 0 || dy >= dx) ? "top" : "side";
  };
  const r = rng(tier * 7919);
  const shade = ramp(color);
  const lit = (t: number) => mix(color, "#ffffff", t);
  const dim = (t: number) => mix(color, "#140f1e", t);
  const g = blank(16, 16);
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const f = face(x, y);
      if (!f) continue;
      const edge = !mask(x - 1, y) || !mask(x + 1, y) || !mask(x, y - 1) || !mask(x, y + 1);
      if (edge) {
        g[y][x] = look.ghost ? dim(0.6) : shade.o;
        continue;
      }
      const down = Math.max(0, Math.min(1, (y - yt) / Math.max(1, H - 2)));
      const speck = r() < look.speck ? 0.14 : 0;
      if (f === "top") {
        const s = yt - 1 - y;
        const shine = x - s === x0 + 3 ? 0.88 : x - s === x0 + 4 ? 0.72 : 0;
        g[y][x] = shine ? lit(shine) : speck ? lit(0.3) : lit(s === 0 ? 0.62 : 0.42 - 0.08 * s);
      } else if (f === "front")
        g[y][x] =
          x === x0 + L - 1
            ? lit(0.5)
            : y === yt
              ? lit(0.3)
              : x === x0 + 1
                ? dim(Math.max(0, 0.08 * down - 0.1) + speck)
                : dim(0.04 + 0.4 * down + speck);
      else g[y][x] = dim(0.42 + 0.22 * down + speck);
    }
  for (let x = x0 + 1; x < x0 + L + 2; x++) if (b.yb + 1 < 16 && !g[b.yb + 1][x]) g[b.yb + 1][x] = "#00000047";
  if (look.halo)
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++)
        if ((!g[y][x] || y === b.yb + 1) && (mask(x - 1, y) || mask(x + 1, y) || mask(x, y - 1) || mask(x, y + 1)))
          g[y][x] = (x + y) % 2 ? look.halo : mix(look.halo, "#ffffff", 0.5);
  const put: Put = (x, y, c) => {
    if (x >= 0 && y >= 0 && x < 16 && y < 16) g[y][x] = c;
  };
  look.extra?.(put, b, face, r);
  ingots.set(id, g);
  return g;
};

import { BASE } from "./gear";
import { type Grid, mix, raster, rng } from "./pixel";

export type Enemy = {
  name: string;
  depth: number;
  threat: string;
  does: string;
  pal?: Record<string, string>;
  rows?: string[];
  duergar?: boolean;
};

const pad = (rows: string[], h = 16) => [...Array(Math.max(0, h - rows.length)).fill("................"), ...rows];

export const ENEMIES: Enemy[] = [
  {
    name: "Giant Rat",
    depth: 1,
    threat: "Pest",
    does: "Darts in from the dark far faster than you, zig-zagging so it is hard to pin down. Weak, though: one or two good hits.",
    pal: { x: "#1c1410", b: "#6e5e50", B: "#93806c", p: "#d98c9a", e: "#ff3b3b" },
    rows: pad([
      "....xx..........",
      "...xpBx..xxxxx..",
      "..xBBBBxxBBBBBx.",
      ".xBeBBBBBBBBBBBx",
      "xpBBBBBbbbbbbbbx",
      ".xxbbbbbbbbbbbx.",
      "...xbbxxxxxbbxpp",
      "...xpx....xpx..p",
    ]),
  },
  {
    name: "Kobold Digger",
    depth: 2,
    threat: "Thief",
    does: "Tunnels toward you through the rock and snatches a few ore from your satchel if it reaches you.",
    pal: { x: "#1c1410", R: "#b5482e", c: "#e8d8b0", y: "#ffd23f", m: "#9aa0a8", w: "#7a5030" },
    rows: pad([
      "..........xxxx..",
      "...x.x...xmmmmx.",
      "..xcxcx...xwx...",
      ".xRRRRRx..xwx...",
      "xRyRRRRRx.xwx...",
      "xRRRRRRRxxRx....",
      ".xxcRRRx.xRx....",
      "..xcRRRRRRx.....",
      "..xccRRRRx......",
      "..xccRRRx..xx...",
      "...xRRRRxxxRRx..",
      "...xRxxRx..xx...",
      "..xRx.xRx.......",
      "..xx..xx........",
    ]),
  },
  {
    name: "Cave Spider",
    depth: 3,
    threat: "Ambusher",
    does: "Drops from the ceiling. Its web slows your swings for a few seconds.",
    pal: { x: "#120c16", b: "#3a2a4a", B: "#5a4470", h: "#8a70a8", e: "#ff3355" },
    rows: pad([
      "......xxxx......",
      ".....xBhBBx.....",
      "..x.xBBBBBBx.x..",
      ".x.xxbBBBBbxx.x.",
      "x.x.xbbbbbbx.x.x",
      "x..xxeebbeexx..x",
      ".x.x.xbbbbx.x.x.",
      ".x.x..xbbx..x.x.",
      "x..x...xx...x..x",
      "x..x........x..x",
      "...x........x...",
    ]),
  },
  {
    name: "Skeleton Miner",
    depth: 4,
    threat: "Stubborn",
    does: "Falls apart, then pulls itself back together. Finish it with a critical strike to keep it down.",
    pal: { x: "#1c1410", b: "#e8e0cc", B: "#b8ac90", k: "#6a4a2c", y: "#ffd77a", r: "#ff5a3c" },
    rows: pad([
      "......xxxx......",
      ".....xkkkkx.....",
      "....xkkyykkx....",
      "....xxxxxxxx....",
      ".....xbbbbx.....",
      ".....xrbbrx.....",
      ".....xbBBbx.....",
      "......xbxbx.....",
      "....xxxbbxxx....",
      "...xb.xbbx.bx...",
      "...xb.xBBx.bx...",
      "..xbx.xbbx.xbx..",
      ".....xb..bx.....",
      ".....xb..bx.....",
      "....xbb..bbx....",
    ]),
  },
  {
    name: "Magma Mephit",
    depth: 5,
    threat: "Volatile",
    does: "Flits around and bursts when it dies. The blast hurts you up close, but it also cracks nearby ore loose.",
    pal: { x: "#1a0a06", s: "#3a2a2a", d: "#6a1a0a", m: "#d2451e", l: "#ff8a2a", h: "#ffd166", y: "#fff3a0" },
    rows: pad([
      "..x..........x..",
      ".xsx..xxxx..xsx.",
      ".xssxxmlmmxxssx.",
      "..xssxlhlmmxssx.",
      "...xsxmyymmxsx..",
      "....xxmllmmxx...",
      ".....xmhhmdx....",
      "....xmmllmmdx...",
      "...xmxmlmdxmx...",
      "...xx.xmmdx.xx..",
      "......xddx......",
      ".....xmx.xmx....",
      ".....xx..xx.....",
      "................",
    ]),
  },
  {
    name: "Duergar Raider",
    depth: 6,
    threat: "Bruiser",
    does: "A grey dwarf who fades from sight, then steps out swinging hard. A psionic ward turns steel until two firebolts shatter it.",
    duergar: true,
  },
  {
    name: "Salamander",
    depth: 7,
    threat: "Scorcher",
    does: "Leaves burning ground behind it. Standing in the flames chips away at you. Half of them drop a Magma Core, which Flametouched gear needs.",
    pal: { x: "#1a0806", d: "#7a1c10", m: "#c8381c", l: "#f26b2a", h: "#ffb347", f: "#ffd23f", y: "#fff3a0" },
    rows: pad([
      "..xxx...........",
      ".xlhlx.f.f......",
      "xlyllmxff.......",
      "xmmllmmx........",
      ".xxmlmmx........",
      "...xmlmx........",
      "...xmlmmx....xx.",
      "...xmmlmmxxxxlhx",
      "....xmmllmmmlmx.",
      ".....xxmmmmmmx..",
      ".......xxxxxx...",
    ]),
  },
  {
    name: "Gelatinous Cube",
    depth: 8,
    threat: "Engulfer",
    does: "Slow and heavy. Cut it down and it splits in two, then in two again. The tiny cubelets can't hurt you, but they love to shove you around.",
    pal: { Q: "#7fe6a0cc", q: "#4fc77a66", b: "#efe6d0", x: "#24402e", y: "#ffd23f" },
    rows: pad([
      ".QQQQQQQQQQQQQQ.",
      ".QqqqqqqqqqqqqQ.",
      ".QqqqqqqqqqqqqQ.",
      ".QqqbbbqqqqqqqQ.",
      ".QqqbxbqqqqqqqQ.",
      ".QqqbbbqqqqyqqQ.",
      ".QqqqbqqqqqqqqQ.",
      ".QqqqqqqqqqqqqQ.",
      ".QqqqqqqbqqqbqQ.",
      ".QqqqqqqqbbbqqQ.",
      ".QqqyqqqbqqqbqQ.",
      ".QqqqqqqqqqqqqQ.",
      ".QQQQQQQQQQQQQQ.",
    ]),
  },
  {
    name: "Xorn",
    depth: 9,
    threat: "Ore-eater",
    does: "Swims through solid stone and eats the ore around you. Kill it fast or lose the vein.",
    pal: { x: "#14100c", s: "#6b5a4a", S: "#8f7a63", d: "#3f342b", e: "#ffd23f", t: "#e8e0cc", m: "#2a1010" },
    rows: pad([
      ".....xxxxxx.....",
      "....xtmtmtmx....",
      "...xSxtmtmtxSx..",
      "..xSSSxxxxxSSSx.",
      ".xSSeSSSeSSSeSx.",
      "xsxSSSSSSSSSSxsx",
      "xsxSSsSSSsSSSxsx",
      "xsxsSSsSSSsSsxsx",
      ".xxsssSSsssSsxx.",
      "..xssdssssdssx..",
      "...xddssssddx...",
      "...xxdxxxxdxx...",
      "...xdx.xdx.xdx..",
      "...xx..xx..xx...",
    ]),
  },
  {
    name: "Star Golem",
    depth: 10,
    threat: "Guardian",
    does: "Grown from the fallen star itself. It hits like a landslide, and its heart is pure starmetal.",
    pal: { x: "#0c1030", c: "#3d5bd6", C: "#7f9cff", h: "#d8e4ff", y: "#fff7d0" },
    rows: pad([
      "......xxxx......",
      ".....xChCCx.....",
      ".....xCyyCx.....",
      "......xccx......",
      "..xxxxxCCxxxxx..",
      ".xCCxcCCCCcxCCx.",
      ".xChxcCyyCcxhCx.",
      ".xCCxcCyyCcxCCx.",
      ".xccxxcCCcxxccx.",
      "..xx.xcccccx.xx.",
      ".....xccxccx....",
      ".....xcCxCcx....",
      ".....xccxccx....",
      "....xCCx.xCCx...",
      "....xxxx.xxxx...",
    ]),
  },
  {
    name: "Chest Mimic",
    depth: 2,
    threat: "Mini-boss",
    does: "Waits as a treasure chest. Steel bounces off its hide; only fire hurts it. Spills a fortune when it dies.",
    pal: {
      x: "#1c1410",
      W: "#a8784a",
      w: "#7d5433",
      g: "#c9a04a",
      y: "#ffd77a",
      d: "#4a3020",
      t: "#efeadf",
      E: "#ffe066",
      r: "#5a0f1a",
      R: "#d0405a",
    },
    rows: pad([
      "..xxxxxxxxxxxx..",
      ".xWWWWWWWWWWWWx.",
      "xWwwEwwwwwwEwwWx",
      "xggggggggggggggx",
      "xtxtxtxtxtxtxtxx",
      "xrrrrrrrrrrrrrrx",
      "xrrrrrRRRRrrrrrx",
      "xrrrrRRRRRRrrrrx",
      "xtxtxtxtxtxtxtxx",
      "xggggggyyggggggx",
      "xwwwwwwwwwwwwwwx",
      "xddddddddddddddx",
      "xxxxxxxxxxxxxxxx",
      ".xdx.......xdx..",
      ".xx.........xx..",
    ]),
  },
];

const CHEST_PAL = { x: "#1c1410", W: "#a8784a", w: "#7d5433", g: "#c9a04a", y: "#ffd77a", d: "#4a3020", t: "#efeadf" };
const CHEST_LID = ["..xxxxxxxxxxxx..", ".xWWWWWWWWWWWWx.", "xWwwwwwwwwwwwwWx", "xwwwwwwwwwwwwwwx"];
const CHEST_BOX = [
  "xggggggyyggggggx",
  "xwwwwwwyywwwwwwx",
  "xwwwwwwwwwwwwwwx",
  "xgwwwwwwwwwwwwgx",
  "xgwwwwwwwwwwwwgx",
  "xddddddddddddddx",
  "xxxxxxxxxxxxxxxx",
];

const CHEST_TIERS = [
  CHEST_PAL,
  { ...CHEST_PAL, W: "#9aa1ab", w: "#5d636d", g: "#2e3238", d: "#23262b" },
  { ...CHEST_PAL, W: "#ffe27a", w: "#d9a536", g: "#fff6c8", y: "#ffffff", d: "#8a5a14" },
];

export const chestSprite = (mimic: boolean, breath: boolean, tier = 0): Grid =>
  raster(
    mimic && breath
      ? [...CHEST_LID, "xtxxtxxxxxxtxxtx", ...CHEST_BOX]
      : mimic
        ? [...CHEST_LID, CHEST_BOX[0], "xwwtwwwyywwwwtwx", ...CHEST_BOX.slice(2)]
        : [...CHEST_LID, ...CHEST_BOX],
    CHEST_TIERS[tier],
  );

const PACK = [
  "....",
  "....",
  "....",
  ".xx.",
  "xbbx",
  "xbBx",
  "xbbx",
  "xbBx",
  "xbbx",
  "xbbx",
  "xBbx",
  "xbbx",
  ".xx.",
  "....",
  "....",
  "....",
];
const LAMP = [
  "...",
  "...",
  "...",
  "...",
  "...",
  "...",
  "...",
  "...",
  "...",
  ".x.",
  "xyx",
  "xYx",
  "xyx",
  ".x.",
  "...",
  "...",
];
const MOSS = [
  ".....xx.....",
  "....xhhx....",
  "....xhHx....",
  "...xhhHHx...",
  "..xhhhhHhx..",
  "..xhssssxx..",
  "..xsxssxsx..",
  "..xsssSssx..",
  ".xwwwwwwwwx.",
  ".xwWwwwwWwx.",
  "xcxwwwwwwxcx",
  "xcccwwwwcccx",
  ".xccccccccx.",
  ".xccccccccx.",
  "..xkkxxkkx..",
  "..xxx..xxx..",
];

export const traderSprite = (): Grid =>
  raster(
    MOSS.map((row, i) => PACK[i] + row + LAMP[i]),
    {
      x: "#1c1410",
      h: "#5a4a32",
      H: "#7a6a48",
      s: "#e2aa7c",
      S: "#b97a52",
      w: "#c8c0b0",
      W: "#a8a090",
      c: "#3a5a4a",
      k: "#3a2a1a",
      b: "#7a5a3a",
      B: "#5a3a22",
      y: "#ffd23f",
      Y: "#fff3a0",
    },
  );

export const potionSprite = (): Grid =>
  raster(["..xxxx..", "...xx...", "..xccx..", ".xrrrrx.", "xrRrrrrx", "xrrrrrrx", ".xrrrrx.", "..xxxx.."], {
    x: "#1c1410",
    c: "#b98a52",
    r: "#c0303a",
    R: "#ff8a8a",
  });

export const scrollSprite = (): Grid =>
  raster([".xxxxxx.", "xPppppPx", ".xpoopx.", ".xpOopx.", ".xpoopx.", ".xppppx.", "xPppppPx", ".xxxxxx."], {
    x: "#1c1410",
    p: "#f4e2b8",
    P: "#c9b07a",
    o: "#ff8a2a",
    O: "#ffe066",
  });

export const chartSprite = (): Grid =>
  raster(["xxxxxxx.", "xpPppPpx", "xpppxppx", "xpPpppPx", "xppxpppx", "xPppprPx", "xppppppx", ".xxxxxxx"], {
    x: "#3a2a1a",
    p: "#e8d3a0",
    P: "#b8945a",
    r: "#d2451e",
  });

export const oilSprite = (): Grid =>
  raster(["...kk...", "...xx...", "..xyyx..", ".xyYyyx.", "xyyyyyyx", "xyyooyyx", ".xyyyyx.", "..xxxx.."], {
    k: "#6b4423",
    x: "#2a1c10",
    y: "#e0a030",
    Y: "#fff0a0",
    o: "#b8701a",
  });

const DUERGAR = [
  "................",
  "......h....h....",
  ".....ohoooohoo..",
  "....ohllmmmmdo..",
  "...oooooooooooo.",
  "....xssssssx....",
  "....xsessesx....",
  "....xSssssSx....",
  "...xrrsSSsrrx...",
  "...xrRrrrrRrx...",
  ".xxuxrRrrRrxuxx.",
  "xuUuuxrRRrxuuUux",
  "xuUuuuxrrxuuuUux",
  "xsxuUuuxxuuUuxsx",
  "xssxkkkkkkkkxssx",
  ".xxxuUuuuuUuxxx.",
  "...xuuuxxuuux...",
  "...xkkkx.xkkkx..",
  "..xkKkkx.xkKkkx.",
  "..xxxxxx.xxxxxx.",
];

const DUERGAR_PAL = {
  ...BASE,
  s: "#8f9098",
  S: "#62636c",
  r: "#34323a",
  R: "#1e1c22",
  u: "#4a3a44",
  U: "#6a5260",
  k: "#2a2226",
  K: "#3d3238",
  e: "#ff3030",
  o: "#101016",
  d: "#2c2c36",
  m: "#4a4a58",
  l: "#6e6e80",
  h: "#9a9aae",
};

export const enemySprite = (e: Enemy): Grid =>
  e.duergar ? raster(DUERGAR, DUERGAR_PAL) : raster(e.rows ?? [], e.pal ?? {});

export const ORE_ART: { name: string; color: string }[] = (
  [
    ["Copper", "#c8743a"],
    ["Tin", "#a9b0b5"],
    ["Iron", "#b08a74"],
    ["Silver", "#dfe3ea"],
    ["Gold", "#f2c14e"],
    ["Electrum", "#e3d27f"],
    ["Cold Iron", "#6f90ab"],
    ["Platinum", "#cfd4d8"],
    ["Fever Iron", "#e0503a"],
    ["Darksteel", "#7a8296"],
    ["Hizagkuur", "#c07a3a"],
    ["Byeshk", "#a46ad6"],
    ["Flametouched Iron", "#ff8a33"],
    ["Targath", "#c9d6e2"],
    ["Dlarun", "#f4eee0"],
    ["Arandur", "#45d08f"],
    ["Mithral", "#bfe6ff"],
    ["Adamantine", "#d4282f"],
    ["Khyber Dragonshard", "#a8359a"],
    ["Starmetal", "#9db6ff"],
  ] as [string, string][]
).map(([name, color]) => ({ name, color }));

export const STRATA: { name: string; stone: string }[] = [
  { name: "Shallow Seams", stone: "#6f655a" },
  { name: "Old Dwarf Road", stone: "#696a70" },
  { name: "Glimmering Galleries", stone: "#5b6577" },
  { name: "Cold Halls", stone: "#56697b" },
  { name: "Fever Vents", stone: "#6a3c33" },
  { name: "Darkfall Shafts", stone: "#36363f" },
  { name: "The Flamewell", stone: "#55261f" },
  { name: "Bonewhite Reach", stone: "#a49c8c" },
  { name: "Underdark Verge", stone: "#30263c" },
  { name: "Where the Star Fell", stone: "#1f2448" },
];

const FLECK = [
  "................",
  "..ab............",
  "..bcc......ab...",
  "...d.......bcd..",
  "......ab........",
  ".....abcc.......",
  "......ccd.......",
  "..............a.",
  "..ab..........bc",
  ".abcc...........",
  "..cd.......abb..",
  "...........bcd..",
  "....ab..........",
  "....bcd.....ab..",
  ".............c..",
  "................",
];

export const stoneTile = (depth: number, seed = 1, wall = false): Grid => {
  const base = STRATA[depth - 1].stone;
  const tones = [mix(base, "#000000", 0.28), mix(base, "#000000", 0.12), base, mix(base, "#ffffff", 0.12)];
  const r = rng(depth * 977 + seed * 31);
  const g: Grid = Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => tones[1 + Math.floor(r() * 2.2)]));
  for (let i = 0; i < 7; i++) {
    const x = Math.floor(r() * 15);
    const y = Math.floor(r() * 15);
    g[y][x] = tones[3];
    g[y + 1][x] = tones[0];
    if (r() < 0.5) g[y][x + 1] = tones[0];
  }
  for (let x = 0; x < 16; x++) g[15][x] = mix(g[15][x] as string, "#000000", 0.25);
  for (let y = 0; y < 16; y++) g[y][15] = mix(g[y][15] as string, "#000000", 0.2);
  if (wall) return g.map((row) => row.map((c) => mix(c as string, "#07060a", 0.55)));
  return g;
};

const orient = (rows: string[], k: number) => {
  let g = rows.map((r) => [...r]);
  if (k & 1) g = g.map((r) => r.reverse());
  if (k & 2) g = g.reverse();
  return g;
};

export const oreTile = (oreIdx: number, depth: number): Grid => {
  const g = stoneTile(depth, oreIdx + 3);
  const c = ORE_ART[oreIdx].color;
  const pal: Record<string, string> = {
    a: mix(c, "#ffffff", 0.6),
    b: mix(c, "#ffffff", 0.2),
    c,
    d: mix(c, "#000000", 0.45),
  };
  orient(FLECK, oreIdx % 4).forEach((row, y) => {
    row.forEach((ch, x) => {
      if (pal[ch]) g[y][x] = pal[ch];
    });
  });
  return g;
};

export const cracks = (() => {
  const r = rng(42);
  const segs: [number, number][][] = [];
  for (let k = 0; k < 4; k++) {
    let x = 7 + Math.floor(r() * 3) - 1;
    let y = 7 + Math.floor(r() * 3) - 1;
    const dx = [1, -1, 1, -1][k];
    const dy = [1, 1, -1, -1][k];
    const line: [number, number][] = [];
    for (let i = 0; i < 7; i++) {
      line.push([x, y]);
      if (r() < 0.6) x += dx;
      else y += dy;
      if (r() < 0.3) y += dy;
      x = Math.max(0, Math.min(15, x));
      y = Math.max(0, Math.min(15, y));
    }
    segs.push(line);
  }
  return (stage: number) => segs.slice(0, stage).flat();
})();

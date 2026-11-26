import { blank, blit, type Grid, mix, raster, ramp, rotateCW } from "./pixel";

export type GearSlot = "pickaxe" | "gauntlets" | "helm" | "charm" | "satchel";
export type Tiers = Record<GearSlot, number>;
export const GEAR_SLOTS: GearSlot[] = ["pickaxe", "gauntlets", "helm", "charm", "satchel"];

type Detail = { from: number; shape: number; rows: Record<number, string> };
type DollSlot = "helm" | "gauntlets" | "satchel" | "charm";

const G: Record<GearSlot, string[][]> = {
  pickaxe: [
    [
      "................",
      "....oooooo......",
      "...ohhlllmoo....",
      "..ohlmmmmmddo...",
      "..olmoooooomdo..",
      "..ooo...owoodo..",
      ".......owWo.odo.",
      "......owWo..odo.",
      ".....owWo...oo..",
      "....owWo........",
      "...owWo.........",
      "..owWo..........",
      ".owWo...........",
      ".oWo............",
      ".oo.............",
      "................",
    ],
    [
      "....ooooooo.....",
      "..oohhllllmoo...",
      ".ohhlllmmmmmdoo.",
      "ohlmmogGgommddo.",
      "olmo.ogggo.omdo.",
      "oo....oko...odo.",
      ".....okKo...odo.",
      "....owWo....oo..",
      "...okKo.........",
      "..owWo..........",
      ".okKo...........",
      "owWo............",
      "olo.............",
      "oo..............",
      "................",
      "................",
    ],

    [
      "...ooooooo......",
      "..ohhhllllmoo...",
      ".ohhlllmmmmddo..",
      "ohllmmmmmmmmddo.",
      "olmmooooooommddo",
      "olmo...owwo.omdo",
      "ooo...owWo...odo",
      ".....owWo....odo",
      "....omlo.....oo.",
      "...owWo.........",
      "..owWo..........",
      ".omlo...........",
      "owWo............",
      "oWo.............",
      "oo..............",
      "................",
    ],
    [
      ".......og.......",
      "....ooogGooo....",
      "..oohhlggllmoo..",
      ".ohhlllmgmmmmdoo",
      "ohlmmogGgommmddo",
      "olmo.ogggo.ommdo",
      "ohho..oko...omdo",
      ".oo..okKo....odo",
      "....ogWo.....oho",
      "...okKo......oo.",
      "..owgo..........",
      ".okKo...........",
      "ogWo............",
      "oGo.............",
      "oo..............",
      "................",
    ],
  ],
  gauntlets: [
    [
      "................",
      "......oo.oo.....",
      "...ooohlohlo....",
      "..ohlolmolmooo..",
      "..olmolmolmohlo.",
      "..olmolmolmolmo.",
      "..olmolmolmolmo.",
      "..oddoddoddoddo.",
      ".oohhlllllmmmdo.",
      "ohlolmmgGmmmmdo.",
      "olmolmmggmmmddo.",
      ".oddommmmmmmddo.",
      "..oooddddddddo..",
      ".oooooooooooooo.",
      "ohhllllmmmmmmddo",
      "oooooooooooooooo",
    ],
    [
      "......ll.ll.....",
      "......oo.oo.....",
      "...ooohlohlo....",
      "..ohlolmolmooo..",
      "..olmolmolmohlo.",
      "..olmolmolmolmo.",
      "..olmolmolmolmo.",
      "..ohhohhohhohho.",
      ".oohhlllllmmmdo.",
      "ohlolmmgGmmmmdo.",
      "olmolmmggmmmddo.",
      ".oddommmmmmmddo.",
      "..oooddddddddo..",
      ".oooooooooooooo.",
      "ohhllllgGlmmmddo",
      "oooooooooooooooo",
    ],
  ],
  helm: [
    [
      "................",
      "................",
      "......oooo......",
      "....oohhllmoo...",
      "...ohhllmmmmdo..",
      "..ohllmoooommdo.",
      "..olmmoyYyommdo.",
      "..olmmoYyYommdo.",
      "..ommmooooommdo.",
      ".oooooooooooooo.",
      "ohhllllgGmmmmddo",
      ".oddddddddddddo.",
      "..oooooooooooo..",
      "................",
      "................",
      "................",
    ],
    [
      "................",
      ".b............b.",
      ".bB...oooo...Bb.",
      "..bB.ohhllo.Bb..",
      "...Bohllmmmob...",
      "...ohllmmmmmdo..",
      "..ohlmooooommdo.",
      "..olmmoyYyommdo.",
      "..olmmoYgYommdo.",
      "..ommmooooommdo.",
      ".oooooooooooooo.",
      "ohhllllgGlmmmddo",
      ".oddddddddddddo.",
      "..oooooooooooo..",
      "................",
      "................",
    ],
  ],
  charm: [
    [
      "................",
      "....kk....kk....",
      ".....k....k.....",
      "......k..k......",
      "......oooo......",
      ".....ohllmo.....",
      "....ohlggmdo....",
      "....olgGgmdo....",
      "....omggmmdo....",
      "....odmmmddo....",
      ".....oddddo.....",
      "......oooo......",
      "................",
      "................",
      "................",
      "................",
    ],
    [
      "................",
      "...kk......kk...",
      ".....k....k.....",
      "......k..k......",
      "...o..oooo..o...",
      "...ooohllmooo...",
      "....ohlgggmdo...",
      "...ohlgGGggmdo..",
      "...olggGgggddo..",
      "...omgggggmddo..",
      "....omgggmddo...",
      "...ooommmddooo..",
      "...o..oooo..o...",
      "......o..o......",
      "......g..g......",
      "................",
    ],
  ],
  satchel: [
    [
      "................",
      ".....kkkkkk.....",
      "....k......k....",
      "...k........k...",
      "..oooooooooooo..",
      "..ohhllllmmmdo..",
      "..ohllllmmmmdo..",
      "..olmmmgGmmmdo..",
      "..oooooooooooo..",
      ".olmmmmmmmmmddo.",
      ".olmmmmmmmmmddo.",
      ".ommmmmmmmmdddo.",
      ".oddddddddddddo.",
      "..oooooooooooo..",
      "................",
      "................",
    ],
    [
      "................",
      "....kkkkkkkk....",
      "...k........k...",
      "..k..........k..",
      ".oooooooooooooo.",
      ".ohhlllllmmmmdo.",
      ".ohlllooooommdo.",
      ".olmmmogGgommdo.",
      ".olmmmogggommdo.",
      ".oddddooooodddo.",
      "oooooooooooooooo",
      "ohlmmmmmmmmmmddo",
      "olmmmmmmmmmmmddo",
      "oddddddddddddddo",
      ".oooooooooooooo.",
      "................",
    ],
  ],
};

const DETAILS: Record<GearSlot, Detail[]> = {
  pickaxe: [
    { from: 2, shape: 0, rows: { 10: "....kK", 12: "..kK" } },
    { from: 3, shape: 2, rows: { 3: ".......gG" } },
    { from: 4, shape: 2, rows: { 10: "...kK", 12: ".kK" } },
    { from: 5, shape: 2, rows: { 6: ".h", 8: ".............l" } },
    { from: 7, shape: 1, rows: { 2: "......h.h.l" } },
    { from: 8, shape: 1, rows: { 4: "..g", 6: ".............g" } },
    { from: 10, shape: 3, rows: { 0: "........G", 8: "..............G", 10: "....G" } },
  ],
  gauntlets: [
    { from: 2, shape: 0, rows: { 7: "...l..l..l..l" } },
    { from: 4, shape: 0, rows: { 14: "....d...d...d" } },
    { from: 5, shape: 0, rows: { 12: "......kKlKk" } },
    { from: 7, shape: 1, rows: { 11: ".....l...l" } },
    { from: 8, shape: 1, rows: { 14: "..g..........g" } },
    { from: 9, shape: 1, rows: { 0: "......GG.GG" } },
    { from: 10, shape: 1, rows: { 8: ".......hh", 11: ".......hh" } },
  ],
  helm: [
    { from: 2, shape: 0, rows: { 7: "...h........l" } },
    { from: 4, shape: 0, rows: { 1: ".......oo", 2: ".......hl" } },
    { from: 5, shape: 0, rows: { 13: "..olo......olo", 14: "...o.......o" } },
    { from: 7, shape: 1, rows: { 2: "..l..........l" } },
    { from: 8, shape: 1, rows: { 0: ".......oo", 1: ".......hl" } },
    { from: 9, shape: 1, rows: { 14: "..olo......olo", 15: "...g.......g" } },
    { from: 10, shape: 1, rows: { 1: ".G............G" } },
  ],
  charm: [
    { from: 2, shape: 0, rows: { 1: "....lm....ml", 2: ".....l....l", 3: "......m..m" } },
    { from: 4, shape: 0, rows: { 12: ".......o", 13: "......olo", 14: ".......o" } },
    { from: 5, shape: 0, rows: { 6: "...o........o", 7: "..ol........lo", 8: "...o........o" } },
    { from: 7, shape: 1, rows: { 1: "...lm......ml", 2: ".....l....l", 3: "......m..m" } },
    { from: 8, shape: 1, rows: { 8: ".oh...........ho" } },
    { from: 9, shape: 1, rows: { 14: "......G..G", 15: "......o..o" } },
    { from: 10, shape: 1, rows: { 4: "...h........h", 12: "...h........h" } },
  ],
  satchel: [
    { from: 2, shape: 0, rows: { 9: "..h.........h", 12: "..l.........l" } },
    { from: 4, shape: 0, rows: { 9: ".......hd", 10: ".......hd", 11: ".......hd" } },
    { from: 5, shape: 0, rows: { 2: ".....uUUUu", 3: "....uUuuuUu" } },
    { from: 7, shape: 1, rows: { 11: ".h............l", 13: ".l............m" } },
    { from: 8, shape: 1, rows: { 7: "...g........g" } },
    { from: 9, shape: 1, rows: { 2: "....uUUUUUUu", 3: "...uUuuuuuuUu" } },
    { from: 10, shape: 1, rows: { 11: ".......h", 12: ".......GG", 13: "........h" } },
  ],
};

const DWARF = [
  "................",
  "................",
  "................",
  "................",
  ".....xxxxxx.....",
  "....xssssssx....",
  "....xsxssxsx....",
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

const DOLL: Record<DollSlot, (string | number)[][]> = {
  helm: [
    ["", "......oooo......", "....oohhllmoo...", "...ohhlmmmmmdo..", "...olmmoyommdo..", "..ohhllgGmmddo.."],
    ["", ".b....oooo....b.", ".bB.oohhllmoo.Bb", "..bBohlmmmmmdBb.", "...olmmogommdo..", "..ohhllgGmmddo.."],
  ],
  gauntlets: [
    [13, "ol............lo", "olm..........mlo", ".dd..........dd."],
    [12, "o..............o", "ol............lo", "olm..........mlo", ".dd..........dd."],
  ],
  satchel: [
    [15, "........oooooo..", "........ohlgdo..", "........odmmdo..", "........oooooo.."],
    [14, "........oooooo..", "........ohllmo..", "........olgGdo..", "........odmmdo..", "........oooooo.."],
  ],
  charm: [
    [11, "......olmo......", "......ogGo......", ".......oo......."],
    [10, ".......oo.......", "......olmo......", ".....ogGGgo.....", "......oggo......", ".......oo......."],
  ],
};

export const BASE: Record<string, string> = {
  x: "#1c1410",
  s: "#e2aa7c",
  S: "#b97a52",
  r: "#c4562b",
  R: "#8a3418",
  u: "#3d6a86",
  U: "#5c8fae",
  k: "#5a3a22",
  K: "#7d5433",
  w: "#6b4423",
  W: "#9a6a3c",
  y: "#ffd77a",
  Y: "#fff4c2",
  b: "#e8dcc0",
  B: "#b8a88a",
};

export const SETS: {
  tier: number;
  name: string;
  base: string;
  gem: string | null;
  perSlot?: Partial<Record<GearSlot, string>>;
}[] = [
  {
    tier: 0,
    name: "Scrapper's Kit",
    base: "#8b4a2b",
    gem: null,
    perSlot: { gauntlets: "#b5a58a", helm: "#8a5a36", charm: "#8f8c86", satchel: "#a88d5e" },
  },
  { tier: 1, name: "Copper", base: "#c8743a", gem: null },
  { tier: 2, name: "Iron", base: "#8a9099", gem: null },
  { tier: 3, name: "Gold", base: "#e8b53e", gem: "#e0314b" },
  { tier: 4, name: "Cold Iron", base: "#6f90ab", gem: "#9fe6ff" },
  { tier: 5, name: "Darksteel", base: "#4a5060", gem: "#ffb020" },
  { tier: 6, name: "Byeshk", base: "#8a5bb5", gem: "#f0a8ff" },
  { tier: 7, name: "Flametouched", base: "#e0782a", gem: "#fff1b0" },
  { tier: 8, name: "Mithral", base: "#b5d8ef", gem: "#3d7bff" },
  { tier: 9, name: "Adamantine", base: "#b3242c", gem: "#ffcf5a" },
  { tier: 10, name: "Starmetal", base: "#7f9cff", gem: "#ffffff" },
];

const ITEM_NAMES: Record<GearSlot, [string, string]> = {
  pickaxe: ["Rusty Pickaxe", "Pickaxe"],
  gauntlets: ["Bare Knuckles", "Gauntlets"],
  helm: ["Candle Cap", "Lantern Helm"],
  charm: ["Lucky Pebble", "Strike Charm"],
  satchel: ["Torn Sack", "Satchel"],
};

export const pickShape = (tier: number) => (tier <= 2 ? 0 : tier <= 5 ? 2 : tier <= 8 ? 1 : 3);
const shapeOf = (tier: number) => (tier >= 6 ? 1 : 0);

const detailed = (slot: GearSlot, tier: number) => {
  const shape = slot === "pickaxe" ? pickShape(tier) : shapeOf(tier);
  const g = G[slot][shape].map((r) => [...r]);
  for (const d of DETAILS[slot])
    if (d.shape === shape && tier >= d.from)
      for (const [y, row] of Object.entries(d.rows))
        [...row].forEach((ch, x) => {
          if (ch !== ".") g[+y][x] = ch;
        });
  return g.map((r) => r.join(""));
};

export const itemName = (slot: GearSlot, tier: number) =>
  tier === 0 ? ITEM_NAMES[slot][0] : `${SETS[tier].name}${tier === 7 ? " Iron" : ""} ${ITEM_NAMES[slot][1]}`;

const paletteFor = (slot: GearSlot, tier: number) => {
  const set = SETS[tier];
  const r = ramp(set.perSlot?.[slot] ?? set.base);
  return { ...BASE, ...r, g: set.gem ?? r.m, G: set.gem ? mix(set.gem, "#ffffff", 0.6) : r.l };
};

export const item = (slot: GearSlot, tier: number) => raster(detailed(slot, tier), paletteFor(slot, tier));

const overlay = (spec: (string | number)[], pal: Record<string, string>) =>
  typeof spec[0] === "number"
    ? { y: spec[0], px: raster(spec.slice(1) as string[], pal) }
    : { y: 0, px: raster(spec as string[], pal) };

export const dwarfOnly = (tiers: Tiers) => {
  const out = blank(30, 20);
  blit(out, raster(DWARF, BASE), 0, 0);
  for (const slot of ["gauntlets", "satchel", "charm", "helm"] as DollSlot[]) {
    const t = tiers[slot];
    const o = overlay(DOLL[slot][shapeOf(t)], paletteFor(slot, t));
    blit(out, o.px, 0, o.y);
  }
  return out;
};

export const sleeper = (tiers: Tiers): Grid => {
  const g = dwarfOnly(tiers).map((r) => [...r]);
  for (const x of [6, 9]) g[6][x] = BASE.S;
  g[7][7] = BASE.x;
  g[7][8] = BASE.x;
  g.splice(16, 1);
  return g;
};

export type Pose = "raise" | "strike";

export const compose = (tiers: Tiers, pose: Pose): Grid => {
  const out = blank(34, 32);
  blit(out, dwarfOnly(tiers), 0, 8);
  const pick = item("pickaxe", tiers.pickaxe);
  if (pose === "strike") blit(out, rotateCW(pick), 12, 13);
  else blit(out, pick, 12, 1);
  return out;
};

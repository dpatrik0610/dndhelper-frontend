import { type Grid, mix, raster, ramp } from "./pixel";

const W = 32;
const row = (s: string) => s.padEnd(W, ".");
const hearth = (h: string, right = "") => row(`.${h}${right}`);
const open = (inner: string) => `olmo${inner}omdo`;

const BASE = [
  ...Array(10).fill(row("")),
  hearth("oooooooooooooooo"),
  hearth("ohhllllllllllmdo"),
  hearth("olmmmmmmmmmmmmdo"),
  hearth("olm" + "oooooooooo" + "mdo"),
  hearth(open("cFcccFcc")),
  hearth(open("FfFccfFc")),
  hearth(open("fYfFfYfF")),
  hearth(open("YYYfYYYf")),
  hearth(open("cFcfcFcF"), ".....wwwwAA...."),
  hearth("olm" + "oooooooooo" + "mdo", "..ooooooooooo.."),
  hearth("olmmmmmmmmmmmmdo", ".oAnnnnnnnnnAAo"),
  hearth("olmmdmmmmmdmmmdo", "..oaAAAAAAAaoo."),
  hearth("ommmmmmdmmmmmmdo", "....oaaAAaao..."),
  hearth("olmmdmmmmmdmmmdo", ".....oaAAao...."),
  hearth("oddddddddddddddo", "...ooaaAAaaoo.."),
  hearth("oooooooooooooooo", "...oooooooooo.."),
];

const layer = (start: number, rows: string[]) => ({ start, rows: rows.map(row) });
const LAYERS = {
  chimney: layer(4, ["....oooooooo", "....olmmmmdo", "....olmdmmdo", "....olmmmmdo", "....olmmdmdo", "...oooooooooo"]),
  bellows: layer(6, ["............okkKo", "...........okKkKko", "............okkko", "..............w"]),
  runes: layer(21, ["...G.........G..........g", "........g", "...g.........g"]),
  crystals: layer(0, [".......GG", "....G..gG..G", "....gG.gg.Gg", ".....gggggg"]),
};

export const FORGE_LEVELS: {
  level: number;
  name: string;
  stone: string;
  fire: string[];
  rune: string | null;
  perk: string;
  cost: string;
}[] = [
  {
    level: 1,
    name: "Fieldstone Forge",
    stone: "#7a7066",
    fire: ["#b8401c", "#ff8a2a", "#ffd23f"],
    rune: null,
    perk: "Forges gear up to tier 2.",
    cost: "Free. It's where every delver starts.",
  },
  {
    level: 2,
    name: "Brick Kiln Forge",
    stone: "#9c4a32",
    fire: ["#c8501c", "#ff9a2a", "#ffe066"],
    rune: null,
    perk: "Forges up to tier 4. A chimney draws the heat up: ores cost 5% less.",
    cost: "Iron, Silver and Tin",
  },
  {
    level: 3,
    name: "Dwarven Bellows Forge",
    stone: "#5b5f6b",
    fire: ["#e07a1c", "#ffd23f", "#fff6c8"],
    rune: null,
    perk: "Forges up to tier 6. Bellows push it hotter: 10% cheaper.",
    cost: "Cold Iron, Platinum and Gold",
  },
  {
    level: 4,
    name: "Magma Forge",
    stone: "#2a2230",
    fire: ["#a01808", "#ff4a1a", "#ffb347"],
    rune: "#ff5a2a",
    perk: "Forges up to tier 8. Fed by the Fever Vents: 15% cheaper.",
    cost: "Fever Iron, Byeshk and Hizagkuur",
  },
  {
    level: 5,
    name: "Starfall Forge",
    stone: "#2c3b8a",
    fire: ["#3d5bd6", "#9db6ff", "#ffffff"],
    rune: "#e8f0ff",
    perk: "Forges up to tier 10, the only fire hot enough for starmetal. 20% cheaper.",
    cost: "Mithral, Arandur and Dlarun",
  },
];

const palette = (lv: number, flick: boolean) => {
  const L = FORGE_LEVELS[lv - 1];
  const r = ramp(L.stone);
  const [f0, f1, f2] = L.fire;
  return {
    ...r,
    f: flick ? f1 : f0,
    F: flick ? f0 : f1,
    Y: f2,
    c: mix(f0, "#000000", 0.4),
    a: "#2a2a32",
    A: "#4a4c58",
    n: "#8a8e9c",
    k: "#5a3a22",
    K: "#7d5433",
    w: "#6b4423",
    g: L.rune ?? r.l,
    G: L.rune ? mix(L.rune, "#ffffff", 0.6) : r.h,
  };
};

export const forgeSprite = (lv: number, flick = false): Grid => {
  const grid = BASE.map((r) => [...r]);
  const apply = (l: { start: number; rows: string[] }) =>
    l.rows.forEach((r, y) => {
      [...r].forEach((ch, x) => {
        if (ch !== ".") grid[l.start + y][x] = ch;
      });
    });
  if (lv >= 2) apply(LAYERS.chimney);
  if (lv >= 3) apply(LAYERS.bellows);
  if (lv >= 4) apply(LAYERS.runes);
  if (lv >= 5) apply(LAYERS.crystals);
  return raster(
    grid.map((r) => r.join("")),
    palette(lv, flick),
  );
};

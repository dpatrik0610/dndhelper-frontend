import { type Grid, raster } from "./pixel";

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

export const MATERIALS: Record<string, { name: string; lore: string; grid: Grid }> = {
  [MAGMA_CORE]: {
    name: "Magma Core",
    lore: "The still-burning heart of a salamander. Only Flametouched Iron will take an edge with one in the quench.",
    grid: CORE,
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

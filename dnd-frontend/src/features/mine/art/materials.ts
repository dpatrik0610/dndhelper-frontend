import { type Grid, raster } from "./pixel";

export const MAGMA_CORE = "magmaCore";

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

export const MATERIALS: Record<string, { name: string; lore: string; grid: Grid }> = {
  [MAGMA_CORE]: {
    name: "Magma Core",
    lore: "The still-burning heart of a salamander. Only Flametouched Iron will take an edge with one in the quench.",
    grid: CORE,
  },
};

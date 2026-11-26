export type Px = string | null;
export type Grid = Px[][];
export type Palette = Record<string, string>;

export const hex = (h: string) => {
  const n = Number.parseInt(h.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const toHex = (rgb: number[]) =>
  `#${rgb
    .map((v) =>
      Math.max(0, Math.min(255, Math.round(v)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;

export const mix = (a: string, b: string, t: number) => {
  const B = hex(b);
  return toHex(hex(a).map((v, i) => v + (B[i] - v) * t));
};

export const ramp = (base: string) => ({
  o: mix(base, "#0b0a12", 0.82),
  d: mix(base, "#140f1e", 0.45),
  m: base,
  l: mix(base, "#ffffff", 0.32),
  h: mix(base, "#ffffff", 0.68),
});

export const raster = (rows: readonly string[], pal: Palette): Grid =>
  rows.map((row) => [...row].map((ch) => (ch === "." || ch === " " ? null : (pal[ch] ?? "#ff00ff"))));

export const blank = (w: number, h: number): Grid => Array.from({ length: h }, () => Array<Px>(w).fill(null));

export const blit = (dst: Grid, src: Grid, ox: number, oy: number) => {
  src.forEach((row, y) => {
    row.forEach((c, x) => {
      if (c && dst[oy + y] && x + ox >= 0 && x + ox < dst[0].length) dst[oy + y][ox + x] = c;
    });
  });
};

export const rotateCW = (g: Grid): Grid => g[0].map((_, x) => g.map((row) => row[x]).reverse());

export const tint = (g: Grid, color: string): Grid => g.map((row) => row.map((c) => (c ? color : null)));

export const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

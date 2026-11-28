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

const scale2x = (g: Grid): Grid => {
  const h = g.length;
  const w = g[0].length;
  const at = (x: number, y: number) => g[Math.max(0, Math.min(h - 1, y))][Math.max(0, Math.min(w - 1, x))];
  const out: Grid = Array.from({ length: h * 2 }, () => Array<Px>(w * 2).fill(null));
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const [A, B, C, D, P] = [at(x, y - 1), at(x + 1, y), at(x - 1, y), at(x, y + 1), g[y][x]];
      out[y * 2][x * 2] = C === A && C !== D && A !== B ? A : P;
      out[y * 2][x * 2 + 1] = A === B && A !== C && B !== D ? B : P;
      out[y * 2 + 1][x * 2] = D === C && D !== B && C !== A ? C : P;
      out[y * 2 + 1][x * 2 + 1] = B === D && B !== A && D !== C ? D : P;
    }
  return out;
};

const scale3x = (g: Grid): Grid => {
  const h = g.length;
  const w = g[0].length;
  const at = (x: number, y: number) => g[Math.max(0, Math.min(h - 1, y))][Math.max(0, Math.min(w - 1, x))];
  const out: Grid = Array.from({ length: h * 3 }, () => Array<Px>(w * 3).fill(null));
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const [A, B, C, D, E, F, G, H, I] = [
        at(x - 1, y - 1), at(x, y - 1), at(x + 1, y - 1),
        at(x - 1, y), g[y][x], at(x + 1, y),
        at(x - 1, y + 1), at(x, y + 1), at(x + 1, y + 1),
      ];
      const px = [
        D === B && D !== H && B !== F ? D : E,
        (D === B && D !== H && B !== F && E !== C) || (B === F && B !== D && F !== H && E !== A) ? B : E,
        B === F && B !== D && F !== H ? F : E,
        (D === B && D !== H && B !== F && E !== G) || (D === H && D !== B && H !== F && E !== A) ? D : E,
        E,
        (B === F && B !== D && F !== H && E !== I) || (H === F && D !== H && B !== F && E !== C) ? F : E,
        D === H && D !== B && H !== F ? D : E,
        (D === H && D !== B && H !== F && E !== I) || (H === F && D !== H && B !== F && E !== G) ? H : E,
        H === F && D !== H && B !== F ? F : E,
      ];
      px.forEach((c, k) => {
        out[y * 3 + Math.floor(k / 3)][x * 3 + (k % 3)] = c;
      });
    }
  return out;
};

export const upscale = (g: Grid, k: number): Grid => (k === 3 ? scale3x(g) : k === 2 ? scale2x(g) : g);

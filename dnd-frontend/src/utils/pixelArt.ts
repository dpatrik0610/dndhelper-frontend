/**
 * Pixel-art sprites written as rows of characters: each character is a palette key, "." is
 * transparent. One frame = one string[]; animated sprites are a list of frames.
 */
export type Palette = Record<string, string>;

export interface Pixel {
  x: number;
  y: number;
  color: string;
}

export function pixels(rows: string[], palette: Palette): Pixel[] {
  const out: Pixel[] = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === ".") return;
      const color = palette[ch];
      if (!color) throw new Error(`pixelArt: no colour for "${ch}"`);
      out.push({ x, y, color });
    });
  });
  return out;
}

/** A copy of rows with single pixels replaced ([x, y, char]), for animation frames. */
export function editPixels(rows: string[], changes: [number, number, string][]): string[] {
  const grid = rows.map((r) => [...r]);
  for (const [x, y, ch] of changes) grid[y][x] = ch;
  return grid.map((r) => r.join(""));
}

import type { AoeKind, GridType } from "@appTypes/Tabletop";

/**
 * Pure grid geometry for the three grid types. World units are pixels at zoom 1.
 * Square cells are `cellSize` wide. Hex cells are `cellSize` flat-to-flat, so 1 cell = 5 ft everywhere.
 * Hex coordinates are axial (q, r): https://www.redblobgames.com/grids/hexagons/
 */

export const MIN_ZOOM = 0.05;
export const MAX_ZOOM = 10;
export const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

export interface Grid {
  type: GridType;
  cellSize: number;
}
export interface Pt {
  x: number;
  y: number;
}
/** Square: column/row. Hex: axial q/r. */
export interface Cell {
  a: number;
  b: number;
}

const SQRT3 = Math.sqrt(3);
const hexRadius = (g: Grid) => g.cellSize / SQRT3;

function hexRound(q: number, r: number): Cell {
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(s);
  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;
  return { a: rq + 0, b: rr + 0 }; // + 0 turns -0 into 0
}

export function cellAt(g: Grid, p: Pt): Cell {
  if (g.type === "Square") return { a: Math.floor(p.x / g.cellSize), b: Math.floor(p.y / g.cellSize) };
  const R = hexRadius(g);
  if (g.type === "HexPointy") return hexRound(((SQRT3 / 3) * p.x - p.y / 3) / R, ((2 / 3) * p.y) / R);
  return hexRound(((2 / 3) * p.x) / R, (-p.x / 3 + (SQRT3 / 3) * p.y) / R);
}

export function cellCenter(g: Grid, c: Cell): Pt {
  if (g.type === "Square") return { x: (c.a + 0.5) * g.cellSize, y: (c.b + 0.5) * g.cellSize };
  const R = hexRadius(g);
  if (g.type === "HexPointy") return { x: R * (SQRT3 * c.a + (SQRT3 / 2) * c.b), y: R * 1.5 * c.b };
  return { x: R * 1.5 * c.a, y: R * ((SQRT3 / 2) * c.a + SQRT3 * c.b) };
}

export const snap = (g: Grid, p: Pt): Pt => cellCenter(g, cellAt(g, p));

/** Corners of the cell around `center` (any point is fine for squares if it is a cell center). */
export function cellCorners(g: Grid, center: Pt): Pt[] {
  if (g.type === "Square") {
    const h = g.cellSize / 2;
    return [
      { x: center.x - h, y: center.y - h },
      { x: center.x + h, y: center.y - h },
      { x: center.x + h, y: center.y + h },
      { x: center.x - h, y: center.y + h },
    ];
  }
  const R = hexRadius(g);
  const offset = g.type === "HexPointy" ? -30 : 0;
  return Array.from({ length: 6 }, (_, i) => {
    const angle = ((60 * i + offset) * Math.PI) / 180;
    return { x: center.x + R * Math.cos(angle), y: center.y + R * Math.sin(angle) };
  });
}

export const toPoints = (pts: Pt[]) => pts.map((p) => `${p.x},${p.y}`).join(" ");

/** Steps between cells: squares use the 5e default (diagonal = 5 ft), hexes the hex distance. */
export function cellDistance(g: Grid, from: Cell, to: Cell): number {
  const da = to.a - from.a;
  const db = to.b - from.b;
  if (g.type === "Square") return Math.max(Math.abs(da), Math.abs(db));
  return (Math.abs(da) + Math.abs(db) + Math.abs(da + db)) / 2;
}

export const distanceFt = (g: Grid, from: Pt, to: Pt) => cellDistance(g, cellAt(g, from), cellAt(g, to)) * 5;

/**
 * One repeating tile of grid lines for an SVG <pattern> in world space.
 * Hex tiles also outline the neighbours that poke into the tile, so every edge gets drawn.
 */
export function gridTile(g: Grid): { width: number; height: number; d: string } {
  const s = g.cellSize;
  if (g.type === "Square") return { width: s, height: s, d: `M ${s} 0 L 0 0 0 ${s}` };

  const R = hexRadius(g);
  const [width, height, centers] =
    g.type === "HexPointy"
      ? [s, 3 * R, [[0, 0], [s, 0], [s / 2, 1.5 * R], [0, 3 * R], [s, 3 * R]]]
      : [3 * R, s, [[0, 0], [0, s], [1.5 * R, s / 2], [3 * R, 0], [3 * R, s]]];

  const d = centers
    .map(([x, y]) => {
      const pts = cellCorners(g, { x, y });
      return `M ${pts.map((p) => `${p.x} ${p.y}`).join(" L ")} Z`;
    })
    .join(" ");
  return { width, height, d };
}

// ── AoE templates (5e grid rules: cone width = length, line is 5 ft wide) ──

export type TemplateShape = { circle: { cx: number; cy: number; r: number } } | { polygon: Pt[] };

export interface TemplateGeometry {
  kind: AoeKind;
  x: number;
  y: number;
  sizeFt: number;
  angle: number;
  widthFt?: number;
  centered?: boolean;
}

export function templateShape(g: Grid, t: TemplateGeometry): TemplateShape {
  const len = (t.sizeFt / 5) * g.cellSize;
  if (t.kind === "Circle") return { circle: { cx: t.x, cy: t.y, r: len } };
  if (t.kind === "Cube" && t.centered) {
    // Centred cubes sit square on the grid around their origin (e.g. a creature).
    const h = len / 2;
    return {
      polygon: [
        { x: t.x - h, y: t.y - h },
        { x: t.x + h, y: t.y - h },
        { x: t.x + h, y: t.y + h },
        { x: t.x - h, y: t.y + h },
      ],
    };
  }

  const rad = (t.angle * Math.PI) / 180;
  const dir = { x: Math.cos(rad), y: Math.sin(rad) };
  const perp = { x: -dir.y, y: dir.x };
  const at = (along: number, side: number): Pt => ({
    x: t.x + dir.x * along + perp.x * side,
    y: t.y + dir.y * along + perp.y * side,
  });

  if (t.kind === "Cone") return { polygon: [at(0, 0), at(len, len / 2), at(len, -len / 2)] };
  const half = t.kind === "Line" ? (((t.widthFt ?? 5) / 5) * g.cellSize) / 2 : len / 2;
  return { polygon: [at(0, -half), at(len, -half), at(len, half), at(0, half)] };
}

export function pointInPolygon(p: Pt, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

export function pointInTemplate(p: Pt, shape: TemplateShape): boolean {
  if ("circle" in shape) return Math.hypot(p.x - shape.circle.cx, p.y - shape.circle.cy) <= shape.circle.r;
  return pointInPolygon(p, shape.polygon);
}

/** Distance from p to a flat x0,y0,x1,y1,... polyline. */
export function distanceToPolyline(p: Pt, flat: number[]): number {
  let best = Infinity;
  for (let i = 0; i + 3 < flat.length; i += 2) {
    const ax = flat[i], ay = flat[i + 1], bx = flat[i + 2], by = flat[i + 3];
    const dx = bx - ax, dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - ax) * dx + (p.y - ay) * dy) / lenSq));
    best = Math.min(best, Math.hypot(p.x - (ax + t * dx), p.y - (ay + t * dy)));
  }
  return best;
}

export function polylinePath(flat: number[]): string {
  if (flat.length < 2) return "";
  let d = `M ${flat[0]} ${flat[1]}`;
  for (let i = 2; i + 1 < flat.length; i += 2) d += ` L ${flat[i]} ${flat[i + 1]}`;
  return d;
}

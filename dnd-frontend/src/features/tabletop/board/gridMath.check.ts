// Self-check for gridMath. Run: node src/features/tabletop/board/gridMath.check.ts
import assert from "node:assert/strict";
import {
  cellAt,
  cellCenter,
  cellCorners,
  distanceFt,
  pointInTemplate,
  snap,
  templateShape,
  type Grid,
} from "./gridMath.ts";

const types = ["Square", "HexPointy", "HexFlat"] as const;
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;

for (const type of types) {
  const g: Grid = { type, cellSize: 70 };

  // Every cell center maps back to its own cell, and snapping is idempotent.
  for (let a = -4; a <= 4; a++) {
    for (let b = -4; b <= 4; b++) {
      const c = cellCenter(g, { a, b });
      assert.deepEqual(cellAt(g, c), { a, b }, `${type} center ${a},${b}`);
      const s = snap(g, { x: c.x + 9, y: c.y - 7 });
      assert.ok(near(s.x, c.x) && near(s.y, c.y), `${type} snap near ${a},${b}`);
    }
  }

  // Neighbouring cells are 5 ft apart; flat-to-flat width equals cellSize.
  const origin = cellCenter(g, { a: 0, b: 0 });
  const east = cellCenter(g, type === "HexFlat" ? { a: 0, b: 1 } : { a: 1, b: 0 });
  assert.equal(distanceFt(g, origin, east), 5, `${type} neighbour distance`);
  assert.ok(near(Math.hypot(east.x - origin.x, east.y - origin.y), 70), `${type} neighbour spacing`);
  assert.equal(cellCorners(g, origin).length, type === "Square" ? 4 : 6);
}

// Square diagonals count 5 ft (5e default); hexes count steps.
const sq: Grid = { type: "Square", cellSize: 50 };
assert.equal(distanceFt(sq, cellCenter(sq, { a: 0, b: 0 }), cellCenter(sq, { a: 3, b: 2 })), 15);
const hex: Grid = { type: "HexPointy", cellSize: 50 };
assert.equal(distanceFt(hex, cellCenter(hex, { a: 0, b: 0 }), cellCenter(hex, { a: 2, b: -1 })), 10);

// Templates: a 20 ft cone pointing right covers the cell 3 cells away but not one behind.
const cone = templateShape(sq, { kind: "Cone", x: 0, y: 0, sizeFt: 20, angle: 0 });
assert.ok(pointInTemplate({ x: 150, y: 0 }, cone));
assert.ok(!pointInTemplate({ x: -10, y: 0 }, cone));
const circle = templateShape(sq, { kind: "Circle", x: 0, y: 0, sizeFt: 10, angle: 0 });
assert.ok(pointInTemplate({ x: 99, y: 0 }, circle) && !pointInTemplate({ x: 101, y: 0 }, circle));

// Centred cube: a 15 ft cube on a creature covers the ring of cells around it, not two cells out.
const cube = templateShape(sq, { kind: "Cube", x: 25, y: 25, sizeFt: 15, angle: 0, centered: true });
assert.ok(pointInTemplate({ x: 25 + 50, y: 25 + 50 }, cube) && !pointInTemplate({ x: 25 + 100, y: 25 }, cube));
// Line width: a 15 ft wide line reaches a cell beside its axis that a 5 ft line misses.
const thinLine = templateShape(sq, { kind: "Line", x: 0, y: 0, sizeFt: 30, angle: 0 });
const wideLine = templateShape(sq, { kind: "Line", x: 0, y: 0, sizeFt: 30, angle: 0, widthFt: 15 });
assert.ok(!pointInTemplate({ x: 100, y: 50 }, thinLine) && pointInTemplate({ x: 100, y: 50 }, wideLine));

console.log("gridMath ok");

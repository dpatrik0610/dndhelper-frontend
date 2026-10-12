// Self-check: npx esbuild src/components/layout/backdrops/gearTrain.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { CLOCKWORK_TRAINS, pitchRadius } from "./gearTrain";

// Every neighbouring pair meshes: centres exactly r1 + r2 apart, turning opposite ways, with periods
// in tooth ratio (same tooth speed at the contact point).
for (const t of CLOCKWORK_TRAINS) {
  for (let i = 1; i < t.gears.length; i++) {
    const a = t.gears[i - 1];
    const b = t.gears[i];
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    assert.ok(Math.abs(dist - pitchRadius(a.teeth) - pitchRadius(b.teeth)) < 1e-6, `${t.key}${i}: gears don't mesh`);
    assert.equal(a.dir, -b.dir, `${t.key}${i}: meshing gears must counter-rotate`);
    assert.ok(Math.abs(a.period / a.teeth - b.period / b.teeth) < 1e-9, `${t.key}${i}: tooth speeds differ`);
  }
}

// The belt joins D and A with equal pulleys, so their first gears must turn at the same rate and way.
const tr = CLOCKWORK_TRAINS.find((t) => t.key === "tr")!;
const bl = CLOCKWORK_TRAINS.find((t) => t.key === "bl")!;
assert.equal(bl.gears[0].period, tr.gears[0].period, "belt-coupled gears D and A must share a period");
assert.equal(bl.gears[0].dir, tr.gears[0].dir, "belt-coupled gears D and A must turn the same way");

console.log("gear train checks passed");

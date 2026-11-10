// Self-check: npx esbuild src/components/layout/backdrops/celestiaStairs.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { BOTTOM_Y, STEPS, TOP_Y, buildStairs } from "./celestiaStairs";

const steps = buildStairs();
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;

assert.equal(steps.length, STEPS);
assert.ok(near(steps[0].bottom, BOTTOM_Y));
assert.ok(near(steps[STEPS - 1].top, TOP_Y));
steps.forEach((s, i) => {
  assert.ok(s.bottom > s.nose && s.nose > s.top, `step ${i} goes up the screen`);
  assert.ok(s.front > s.back, `step ${i} narrows away from the viewer`);
  if (i > 0) {
    assert.ok(near(steps[i - 1].top, s.bottom), `step ${i} sits on the previous tread`);
    assert.ok(near(steps[i - 1].back, s.front), `step ${i} riser is as wide as the tread below`);
  }
});
const tread = (i: number) => steps[i].nose - steps[i].top;
assert.ok(tread(0) > tread(STEPS - 1) * 10, "treads foreshorten toward eye level");
console.log("celestia stairs checks passed");
